import { OnboardingQuestion, SampleProduct } from "../verticals";
import type { SubscriptionTier } from "../types";

export interface BusinessDTO {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  category: string; // The vertical ID
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  pixKey: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  openingHours: Record<string, string> | null;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessVerticalDTO {
  id: string;
  name: string;
  description: string;
  defaultModules: string[];
  hiddenModules: string[];
  dashboardMenuItems: string[];
  publicPageSections: string[];
  defaultTemplate: string;
  sampleProducts: SampleProduct[];
  onboardingQuestions: OnboardingQuestion[];
}
