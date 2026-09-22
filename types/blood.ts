export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
];

export type RequestStatus =
  | "Searching"
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Completed"
  | "Cancelled";

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  units: number;
  lastUpdatedMinutesAgo: number;
  updatedAt: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  hospitalAddress: string;
  isEmergency: boolean;
  contactPerson: string;
  contactPhone: string;
  additionalNote?: string;
  status: RequestStatus;
  createdAt: string;
  organizationId?: string;
  organizationName?: string;
}
