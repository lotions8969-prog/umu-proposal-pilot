export interface HearingData {
  companyName: string;
  industry: string;
  employeeCount: number;
  targetLearners: number;
  currentChallenges: string;
  learningGoals: string;
  budget: string;
  timeline: string;
  competitorProducts: string;
  keyStakeholders: string;
  successMetrics: string;
  additionalNotes: string;
}

export interface BeforeAfterMetric {
  label: string;
  value: string;
}

export interface BeforeState {
  description: string;
  metrics: BeforeAfterMetric[];
  painPoints: string[];
}

export interface AfterState {
  description: string;
  metrics: BeforeAfterMetric[];
  achievements: string[];
}

export interface ROIData {
  currentAnnualCost: number;
  projectedSavings: number;
  productivityGainPercent: number;
  paybackMonths: number;
  threeYearROIPercent: number;
  roiNarrative: string;
}

export interface TimelineItem {
  month: number;
  milestone: string;
  detail: string;
}

export interface CompetitorRow {
  feature: string;
  umu: string;
  competitor: string;
  umuAdvantage: boolean;
}

export interface SuccessStory {
  company: string;
  industry: string;
  challenge: string;
  result: string;
  quote: string;
}

export interface PricingDetail {
  planType: "premium" | "standard" | "light";
  idCount: number;
  contractMonths: number;
  baseUnitPrice: number;
  discountedUnitPrice: number;
  volumeDiscountRate: number;
  contractDiscountRate: number;
  totalDiscountRate: number;
  initialFee: number;
  monthlyBase: number;
  optionsMonthlyCost: number;
  monthlyTotal: number;
  annualTotal: number;
  totalContractValue: number;
  selectedOptions: string[];
}

export interface ProposalPlan {
  planType: "Premium" | "Standard" | "Light";
  title: string;
  tagline: string;
  executiveSummary: string;
  killerPhrase: string;
  before: BeforeState;
  after: AfterState;
  keyFeatures: string[];
  implementationTimeline: TimelineItem[];
  competitorComparison: CompetitorRow[];
  successStory: SuccessStory;
  roiAnalysis: ROIData;
  pricing: PricingDetail;
}

export interface GeneratedProposal {
  id: string;
  timestamp: string;
  hearingData: HearingData;
  plans: ProposalPlan[];
  command?: string;
}

export interface PricingCalculationInput {
  planType: "premium" | "standard" | "light";
  idCount: number;
  contractMonths: number;
  selectedOptions: string[];
}

export interface PricingCalculationResult {
  baseUnitPrice: number;
  discountedUnitPrice: number;
  volumeDiscountRate: number;
  contractDiscountRate: number;
  totalDiscountRate: number;
  initialFee: number;
  monthlyBase: number;
  optionsMonthlyCost: number;
  monthlyTotal: number;
  annualTotal: number;
  totalContractValue: number;
}
