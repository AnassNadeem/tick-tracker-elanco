export const SEVERITIES = ["low", "medium", "high"] as const;

export type Severity = (typeof SEVERITIES)[number];

export type SightingSource = "upstream" | "user_submitted";

export type SpeciesDto = {
  id: string;
  slug: string;
  name: string;
  latinName: string;
  riskLevel: string;
  description: string;
  identificationTips: string;
  imageUrl: string | null;
};

export type SightingDto = {
  id: string;
  upstreamId: string | null;
  observedAt: string;
  species: {
    slug: string;
    name: string;
    latinName: string;
    riskLevel: string;
  };
  region: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  severity: Severity | null;
  locationLabel: string | null;
  lat: number | null;
  lng: number | null;
  reporterNote: string | null;
  imageUrl: string | null;
  source: SightingSource;
  coordinatesAreApproximate: boolean;
  createdAt: string;
};

export type SightingListResponse = {
  data: SightingDto[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type TimelineEntry = {
  id: string;
  observedAt: string;
  speciesName: string;
  speciesSlug: string;
  severity: Severity | null;
  source: SightingSource;
};

export type MonthlyCount = {
  periodStart: string;
  count: number;
};

export type FieldMessage = {
  field: string;
  message: string;
};
