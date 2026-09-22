import { supabase } from "@/lib/supabase";
import { Organization } from "@/types/organization";
import { BloodGroup } from "@/types/blood";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInventory(
  inventoryRows: Record<string, unknown>[],
  orgId: string
): Record<BloodGroup, number> {
  const inv: Record<BloodGroup, number> = {
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
  };
  for (const row of inventoryRows) {
    if ((row.organization_id || row.org_id) === orgId) {
      inv[row.blood_group as BloodGroup] = (row.units as number) || 0;
    }
  }
  return inv;
}

function getLastUpdatedMinutes(
  inventoryRows: Record<string, unknown>[],
  orgId: string
): number {
  const times = inventoryRows
    .filter((r) => (r.organization_id || r.org_id) === orgId && (r.last_updated || r.updated_at))
    .map((r) => new Date((r.last_updated || r.updated_at) as string).getTime())
    .sort((a, b) => b - a);
  if (!times.length) return 9999;
  return Math.floor((Date.now() - times[0]) / 60000);
}

function mapOrgRow(
  row: Record<string, unknown>,
  inventoryRows: Record<string, unknown>[]
): Organization {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Organization["type"],
    address: row.address as string,
    city: row.city as string,
    state: row.state as string,
    phone: row.phone as string,
    isVerified: row.is_verified as boolean,
    isOpen24Hours: row.is_open_24_hours as boolean,
    operatingHours: row.operating_hours as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    distanceKm: 0,
    lastUpdatedMinutesAgo: getLastUpdatedMinutes(inventoryRows, row.id as string),
    inventory: buildInventory(inventoryRows, row.id as string),
  };
}

// ─── OrganizationService ──────────────────────────────────────────────────────

export const OrganizationService = {
  /** Get all organizations with their inventory */
  getAll: async (filters?: { city?: string; verified?: boolean }): Promise<Organization[]> => {
    if (!supabase) return [];

    let query = supabase.from("organizations").select("*");
    if (filters?.city) query = query.eq("city", filters.city);
    if (filters?.verified) query = query.eq("is_verified", true);

    const { data: orgs, error: orgErr } = await query;
    if (orgErr || !orgs) return [];

    const orgIds = (orgs as Record<string, unknown>[]).map((o) => o.id);
    const { data: inventory } = await supabase
      .from("blood_inventory")
      .select("*")
      .in("organization_id", orgIds);

    const invRows = (inventory || []) as Record<string, unknown>[];
    return (orgs as Record<string, unknown>[]).map((row) =>
      mapOrgRow(row, invRows)
    );
  },

  /** Get a single organization by ID */
  getById: async (id: string): Promise<Organization | null> => {
    if (!supabase) return null;

    const { data: org, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !org) return null;

    const { data: inventory } = await supabase
      .from("blood_inventory")
      .select("*")
      .eq("organization_id", id);

    return mapOrgRow(
      org as Record<string, unknown>,
      (inventory || []) as Record<string, unknown>[]
    );
  },

  /** Get organization managed by a provider user */
  getByProvider: async (userId: string): Promise<Organization | null> => {
    if (!supabase) return null;

    const { data: org, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("provider_id", userId)
      .single();
    if (error || !org) return null;

    const { data: inventory } = await supabase
      .from("blood_inventory")
      .select("*")
      .eq("organization_id", (org as Record<string, unknown>).id);

    return mapOrgRow(
      org as Record<string, unknown>,
      (inventory || []) as Record<string, unknown>[]
    );
  },

  /** Update blood inventory for an organization */
  updateInventory: async (
    orgId: string,
    inventory: Record<BloodGroup, number>
  ): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };

    const rows = Object.entries(inventory).map(([blood_group, units]) => ({
      organization_id: orgId,
      blood_group,
      units: Math.max(0, units),
      last_updated: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("blood_inventory")
      .upsert(rows, { onConflict: "organization_id,blood_group" });

    return { error: error ? error.message : null };
  },

  /** Toggle verification for an org (admin only) */
  toggleVerification: async (
    orgId: string,
    isVerified: boolean
  ): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase
      .from("organizations")
      .update({ is_verified: isVerified })
      .eq("id", orgId);
    return { error: error ? error.message : null };
  },

  /** Get admin stats */
  getAdminStats: async (): Promise<{
    totalOrgs: number;
    verifiedOrgs: number;
    pendingOrgs: number;
    totalRequests: number;
  }> => {
    if (!supabase) return { totalOrgs: 0, verifiedOrgs: 0, pendingOrgs: 0, totalRequests: 0 };

    const [orgsRes, requestsRes] = await Promise.all([
      supabase.from("organizations").select("id, is_verified"),
      supabase.from("blood_requests").select("id", { count: "exact" }),
    ]);

    const orgs = (orgsRes.data || []) as { id: string; is_verified: boolean }[];
    const verified = orgs.filter((o) => o.is_verified).length;

    return {
      totalOrgs: orgs.length,
      verifiedOrgs: verified,
      pendingOrgs: orgs.length - verified,
      totalRequests: requestsRes.count || 0,
    };
  },
};

export default OrganizationService;
