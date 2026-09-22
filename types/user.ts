import { BloodGroup } from "./blood";

export type UserRole = "recipient" | "donor" | "provider" | "admin";

export type SupportedLanguage = "en" | "hi" | "mr";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup?: BloodGroup;
  city: string;
  state: string;
  role: UserRole;
  isAvailableDonor?: boolean;
  language: SupportedLanguage;
}
