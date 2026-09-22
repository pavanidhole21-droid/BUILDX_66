import { BloodGroup, BloodInventoryItem } from "./blood";

export type OrganizationType = "Hospital" | "Blood Bank" | "NGO";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  phone: string;
  isVerified: boolean;
  isOpen24Hours: boolean;
  operatingHours: string;
  lastUpdatedMinutesAgo: number;
  latitude: number;
  longitude: number;
  inventory: Record<BloodGroup, number>;
  imageUri?: string;
}
