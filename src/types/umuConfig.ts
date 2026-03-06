export interface UMUProductInfo {
  name: string;
  tagline: string;
  description: string;
  targetMarket: string;
  userCount: string;
  countries: string;
  keyMessage: string;
  website: string;
}

export interface UMUPlanPrice {
  label: string;
  unitPrice: number;
  initialFee: number;
  description: string;
}

export interface UMUOption {
  id: string;
  name: string;
  description: string;
  priceType: "per_id" | "flat";
  price: number;
  defaultFor: ("premium" | "standard" | "light")[];
}

export interface VolumeDiscountTier {
  minIDs: number;
  rate: number;
  label: string;
}

export interface ContractDiscountTier {
  months: number;
  rate: number;
  label: string;
}

export interface UMUPricingConfig {
  plans: {
    premium: UMUPlanPrice;
    standard: UMUPlanPrice;
    light: UMUPlanPrice;
  };
  options: UMUOption[];
  volumeDiscounts: VolumeDiscountTier[];
  contractDiscounts: ContractDiscountTier[];
  maxTotalDiscount: number;
  notes: string;
}

export interface UMUStrength {
  id: string;
  title: string;
  description: string;
  evidence: string;
  category: string;
}

export interface UMUSuccessCase {
  id: string;
  industry: string;
  company: string;
  size: string;
  challenge: string;
  solution: string;
  result: string;
  quote: string;
  roi: string;
  planType: "Premium" | "Standard" | "Light";
}

export interface UMUCopywriting {
  openingPhrases: string[];
  transformationPhrases: string[];
  roiPhrases: string[];
  urgencyPhrases: string[];
  closingPhrases: string[];
  premiumTagline: string;
  standardTagline: string;
  lightTagline: string;
}

export interface UMUCompetitorRow {
  id: string;
  feature: string;
  umuValue: string;
  competitorValue: string;
}

export interface UMUConfig {
  product: UMUProductInfo;
  pricing: UMUPricingConfig;
  strengths: UMUStrength[];
  successCases: UMUSuccessCase[];
  copywriting: UMUCopywriting;
  competitors: UMUCompetitorRow[];
  additionalContext: string;
}
