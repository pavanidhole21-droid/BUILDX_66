import { supabase } from "@/lib/supabase";
import { BloodGroup, BloodRequest, RequestStatus } from "@/types/blood";
import { Organization } from "@/types/organization";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchBloodParams {
  bloodGroup: BloodGroup;
  units: number;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  recentlyUpdatedOnly?: boolean;
  city?: string;
}

export interface RankedOrganizationResult {
  organization: Organization;
  availableUnits: number;
  matchScore: number;
  relevanceReasons: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert Supabase org row + inventory rows to Organization type */
function mapOrgRow(
  row: Record<string, unknown>,
  inventoryRows: Record<string, unknown>[]
): Organization {
  const inventory: Record<BloodGroup, number> = {
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
  };
  for (const inv of inventoryRows) {
    if ((inv.organization_id || inv.org_id) === row.id) {
      inventory[inv.blood_group as BloodGroup] = (inv.units as number) || 0;
    }
  }

  // Calculate minutes ago from last_updated / updated_at
  const updatedAt = inventoryRows
    .filter((i) => (i.organization_id || i.org_id) === row.id)
    .map((i) => new Date((i.last_updated || i.updated_at) as string).getTime())
    .sort((a, b) => b - a)[0];
  const lastUpdatedMinutesAgo = updatedAt
    ? Math.floor((Date.now() - updatedAt) / 60000)
    : 9999;

  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Organization["type"],
    address: row.address as string,
    city: row.city as string,
    state: row.state as string,
    distanceKm: 0, // Will be calculated client-side if GPS available
    phone: row.phone as string,
    isVerified: row.is_verified as boolean,
    isOpen24Hours: row.is_open_24_hours as boolean,
    operatingHours: row.operating_hours as string,
    lastUpdatedMinutesAgo,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    inventory,
  };
}

/** Convert Supabase blood_request row to BloodRequest type */
function mapRequestRow(row: Record<string, unknown>): BloodRequest {
  const createdAt = new Date(row.created_at as string);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  let createdLabel = "Just now";
  if (diffMin >= 1440) createdLabel = `${Math.floor(diffMin / 1440)} day${Math.floor(diffMin / 1440) > 1 ? "s" : ""} ago`;
  else if (diffMin >= 60) createdLabel = `${Math.floor(diffMin / 60)} hr ago`;
  else if (diffMin >= 1) createdLabel = `${diffMin} min ago`;

  return {
    id: `#BH${(row.id as string).slice(0, 8).toUpperCase()}`,
    patientName: row.patient_name as string,
    bloodGroup: row.blood_group as BloodGroup,
    units: row.units as number,
    hospitalName: row.hospital_name as string,
    hospitalAddress: row.hospital_address as string,
    isEmergency: row.is_emergency as boolean,
    contactPerson: row.contact_person as string,
    contactPhone: row.contact_phone as string,
    additionalNote: row.additional_note as string | undefined,
    status: row.status as RequestStatus,
    createdAt: createdLabel,
    organizationId: row.organization_id as string | undefined,
  };
}

// ─── BloodService ─────────────────────────────────────────────────────────────

export const BloodService = {
  /**
   * Search blood sources from Supabase (orgs + inventory).
   * Falls back to empty array if Supabase not configured.
   */
  searchBloodSources: async (
    params: SearchBloodParams
  ): Promise<RankedOrganizationResult[]> => {
    if (!supabase) return [];

    // Fetch orgs (optionally filter by city)
    let orgQuery = supabase.from("organizations").select("*");
    if (params.verifiedOnly) orgQuery = orgQuery.eq("is_verified", true);
    if (params.city) orgQuery = orgQuery.eq("city", params.city);

    const { data: orgs, error: orgErr } = await orgQuery;
    if (orgErr || !orgs) return [];

    // Fetch blood inventory for those orgs
    const orgIds = orgs.map((o: Record<string, unknown>) => o.id);
    const { data: inventory, error: invErr } = await supabase
      .from("blood_inventory")
      .select("*")
      .in("organization_id", orgIds);
    if (invErr) return [];

    const invRows = (inventory || []) as Record<string, unknown>[];

    // Filter recentlyUpdated (< 60 min)
    const results: RankedOrganizationResult[] = [];

    for (const orgRow of orgs as Record<string, unknown>[]) {
      const org = mapOrgRow(orgRow, invRows);

      if (params.recentlyUpdatedOnly && org.lastUpdatedMinutesAgo > 60) continue;
      if (params.maxDistanceKm && org.distanceKm > params.maxDistanceKm) continue;

      const availableUnits = org.inventory[params.bloodGroup] || 0;
      let score = 0;
      const reasons: string[] = [];

      if (availableUnits > 0) { score += 50; reasons.push(`✓ ${params.bloodGroup} match`); }
      if (availableUnits >= params.units) { score += 30; reasons.push(`✓ ${availableUnits} units available`); }
      else if (availableUnits > 0) { score += 10; reasons.push(`Partial: ${availableUnits} of ${params.units} units`); }

      if (org.lastUpdatedMinutesAgo <= 15) { score += 25; reasons.push(`✓ Updated ${org.lastUpdatedMinutesAgo} min ago`); }
      else if (org.lastUpdatedMinutesAgo <= 60) { score += 15; reasons.push(`✓ Updated ${org.lastUpdatedMinutesAgo} min ago`); }
      else { reasons.push(`⚠ Updated ${org.lastUpdatedMinutesAgo} min ago`); }

      if (org.isVerified) { score += 20; reasons.push("✓ Verified organization"); }
      if (org.isOpen24Hours) { score += 5; reasons.push("✓ Open 24 hours"); }

      results.push({ organization: org, availableUnits, matchScore: score, relevanceReasons: reasons });
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  },

  /** Get all requests for the current logged-in user */
  getRequests: async (userId?: string): Promise<BloodRequest[]> => {
    if (!supabase) return [];
    let query = supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("requester_id", userId);

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(mapRequestRow);
  },

  /** Create a new blood request */
  createRequest: async (
    request: Omit<BloodRequest, "id" | "createdAt" | "status">,
    userId: string
  ): Promise<BloodRequest> => {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("blood_requests")
      .insert({
        requester_id: userId,
        patient_name: request.patientName,
        blood_group: request.bloodGroup,
        units: request.units,
        hospital_name: request.hospitalName,
        hospital_address: request.hospitalAddress,
        is_emergency: request.isEmergency,
        contact_person: request.contactPerson,
        contact_phone: request.contactPhone,
        additional_note: request.additionalNote || null,
        organization_id: request.organizationId || null,
        status: "Searching",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRequestRow(data as Record<string, unknown>);
  },

  /** Update inventory for an organization */
  updateInventory: async (
    orgId: string,
    inventory: Record<BloodGroup, number>
  ): Promise<void> => {
    if (!supabase) throw new Error("Supabase not configured");

    const upsertRows = Object.entries(inventory).map(([blood_group, units]) => ({
      organization_id: orgId,
      blood_group,
      units,
      last_updated: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("blood_inventory")
      .upsert(upsertRows, { onConflict: "organization_id,blood_group" });

    if (error) throw new Error(error.message);
  },

  /** Update a request status */
  updateRequestStatus: async (
    requestDbId: string,
    status: RequestStatus
  ): Promise<void> => {
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase
      .from("blood_requests")
      .update({ status })
      .eq("id", requestDbId);
    if (error) throw new Error(error.message);
  },

  /** Get all requests (for admin/provider view) */
  getAllRequests: async (): Promise<BloodRequest[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(mapRequestRow);
  },
};

export default BloodService;
