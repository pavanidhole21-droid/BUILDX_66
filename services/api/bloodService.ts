import { BloodGroup, BloodRequest } from "@/types/blood";
import { Organization } from "@/types/organization";
import { MOCK_ORGANIZATIONS, MOCK_REQUESTS } from "./mockData";

export interface SearchBloodParams {
  bloodGroup: BloodGroup;
  units: number;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  recentlyUpdatedOnly?: boolean;
}

export interface RankedOrganizationResult {
  organization: Organization;
  availableUnits: number;
  matchScore: number;
  relevanceReasons: string[];
}

export const BloodService = {
  /**
   * Smart Result Ranking based on:
   * 1. Exact blood-group match
   * 2. Sufficient reported units
   * 3. Availability freshness
   * 4. Verified organization
   * 5. Distance / travel relevance
   */
  searchBloodSources: async (
    params: SearchBloodParams
  ): Promise<RankedOrganizationResult[]> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200));

    let list = [...MOCK_ORGANIZATIONS];

    if (params.verifiedOnly) {
      list = list.filter((org) => org.isVerified);
    }

    if (params.recentlyUpdatedOnly) {
      list = list.filter((org) => org.lastUpdatedMinutesAgo <= 60);
    }

    if (params.maxDistanceKm) {
      list = list.filter((org) => org.distanceKm <= params.maxDistanceKm!);
    }

    const results: RankedOrganizationResult[] = list.map((org) => {
      const availableUnits = org.inventory[params.bloodGroup] || 0;
      let score = 0;
      const reasons: string[] = [];

      // 1. Blood group availability
      if (availableUnits > 0) {
        score += 50;
        reasons.push(`✓ ${params.bloodGroup} match`);
      }

      // 2. Sufficient units
      if (availableUnits >= params.units) {
        score += 30;
        reasons.push(`✓ ${availableUnits} units reported`);
      } else if (availableUnits > 0) {
        score += 10;
        reasons.push(`Partial: ${availableUnits} of ${params.units} units reported`);
      }

      // 3. Freshness (higher score for updates < 30 mins)
      if (org.lastUpdatedMinutesAgo <= 15) {
        score += 25;
        reasons.push(`✓ Updated ${org.lastUpdatedMinutesAgo} min ago`);
      } else if (org.lastUpdatedMinutesAgo <= 60) {
        score += 15;
        reasons.push(`✓ Updated ${org.lastUpdatedMinutesAgo} min ago`);
      }

      // 4. Verification
      if (org.isVerified) {
        score += 20;
        reasons.push("✓ Verified organization");
      }

      // 5. Proximity
      if (org.distanceKm <= 3) {
        score += 20;
      } else if (org.distanceKm <= 5) {
        score += 10;
      }
      reasons.push(`✓ ${org.distanceKm} km away`);

      return {
        organization: org,
        availableUnits,
        matchScore: score,
        relevanceReasons: reasons,
      };
    });

    // Sort descending by score
    return results.sort((a, b) => b.matchScore - a.matchScore);
  },

  getRequests: async (): Promise<BloodRequest[]> => {
    return [...MOCK_REQUESTS];
  },

  createRequest: async (
    request: Omit<BloodRequest, "id" | "createdAt" | "status">
  ): Promise<BloodRequest> => {
    const newId = `#BH${new Date().getFullYear()}${String(
      Math.floor(100000 + Math.random() * 900000)
    )}`;
    const created: BloodRequest = {
      ...request,
      id: newId,
      status: "Searching",
      createdAt: "Just now",
    };
    MOCK_REQUESTS.unshift(created);
    return created;
  },

  updateInventory: async (
    orgId: string,
    inventory: Record<BloodGroup, number>
  ): Promise<Organization> => {
    const target = MOCK_ORGANIZATIONS.find((o) => o.id === orgId);
    if (!target) throw new Error("Organization not found");
    target.inventory = { ...inventory };
    target.lastUpdatedMinutesAgo = 0;
    return { ...target };
  },
};

export default BloodService;
