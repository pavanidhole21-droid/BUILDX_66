import Config from "@/constants/config";
import { Organization } from "@/types/organization";

export interface SheetHospitalRow {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isVerified: boolean;
  isOpen24Hours: boolean;
  operatingHours: string;
  inventory_A_pos: number;
  inventory_A_neg: number;
  inventory_B_pos: number;
  inventory_B_neg: number;
  inventory_O_pos: number;
  inventory_O_neg: number;
  inventory_AB_pos: number;
  inventory_AB_neg: number;
  lastUpdated: string;
}

/**
 * Convert an Organization object to a flat row for Google Sheets
 */
export function formatHospitalForSheet(org: Organization): SheetHospitalRow {
  return {
    id: org.id,
    name: org.name,
    type: org.type,
    phone: org.phone || Config.emergencyHelplineFormatted,
    address: org.address,
    city: org.city,
    state: org.state,
    isVerified: org.isVerified,
    isOpen24Hours: org.isOpen24Hours,
    operatingHours: org.operatingHours,
    inventory_A_pos: org.inventory["A+"] || 0,
    inventory_A_neg: org.inventory["A-"] || 0,
    inventory_B_pos: org.inventory["B+"] || 0,
    inventory_B_neg: org.inventory["B-"] || 0,
    inventory_O_pos: org.inventory["O+"] || 0,
    inventory_O_neg: org.inventory["O-"] || 0,
    inventory_AB_pos: org.inventory["AB+"] || 0,
    inventory_AB_neg: org.inventory["AB-"] || 0,
    lastUpdated: new Date().toISOString(),
  };
}

export const GoogleSheetsService = {
  /**
   * Sync a hospital/organization to the Google Spreadsheet via the Webhook
   */
  syncHospital: async (org: Organization): Promise<{ success: boolean; error?: string }> => {
    const webhookUrl = Config.googleSheet.webhookUrl;
    if (!webhookUrl) {
      return {
        success: false,
        error: "Google Sheet Webhook URL not configured in EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL",
      };
    }

    try {
      const payload = formatHospitalForSheet(org);
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsertHospital", data: payload }),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to sync to Google Sheet" };
    }
  },

  /**
   * Bulk sync all hospitals to the Google Spreadsheet
   */
  syncAllHospitals: async (orgs: Organization[]): Promise<{ success: boolean; error?: string }> => {
    const webhookUrl = Config.googleSheet.webhookUrl;
    if (!webhookUrl) {
      return {
        success: false,
        error: "Google Sheet Webhook URL not configured in EXPO_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL",
      };
    }

    try {
      const payload = orgs.map(formatHospitalForSheet);
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpsert", data: payload }),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to sync to Google Sheet" };
    }
  },

  /**
   * Fetch public CSV rows from Google Sheet
   */
  fetchFromPublicSheet: async (): Promise<any[]> => {
    const sheetId = Config.googleSheet.id;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    try {
      const response = await fetch(url);
      const csvText = await response.text();
      return parseCsv(csvText);
    } catch (e) {
      console.error("Failed to read Google Sheet CSV", e);
      return [];
    }
  },
};

/** Simple CSV parser helper */
function parseCsv(csv: string): any[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

export default GoogleSheetsService;
