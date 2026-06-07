// Mock data for the Poketee prototype. All amounts in RWF (Rwandan Franc).
// Typed so a future move to a real API surface (REST / tRPC / GraphQL) is a
// straight swap of the source — the rest of the app already codes against
// these types.

// ───────── shared types ─────────

export type Metric = { label: string; value: string };

export type Financials = {
  revenue: string;
  growth: string;
  ebitda: string;
  period: string;
};

export type Operation = {
  name: string;
  detail: string;
  activities: string[];
  partners: string[];
  timeline: string;
  kpis: { label: string; value: string }[];
};

export type Project = {
  id: string;
  type: "project";
  name: string;
  sector: string;
  location: string;
  blurb: string;
  status: "open" | "closing-soon" | "waitlist";
  yieldRange: string;
  yieldHero: string;
  capitalNeeded: string;
  raisedPct: number;
  lockMonths: number;
  minInvest: string;
  image: string;
  website: string;
  financials: Financials;
  metrics: Metric[];
  about: string;
  thesis: string[];
  operations: Operation[];
  risks: string[];
};

const fin = (
  revenue: string,
  growth: string,
  ebitda: string,
  period = "FY 2025"
): Financials => ({ revenue, growth, ebitda, period });

const op = (
  name: string,
  detail: string,
  activities: string[],
  partners: string[],
  timeline: string,
  kpis: { label: string; value: string }[] = []
): Operation => ({ name, detail, activities, partners, timeline, kpis });

// ───────── portfolio summary on Capital home ─────────

export const PK_PORTFOLIO = {
  user: { name: "Joseph", initials: "JK" },
  total: 12450000,
  changePct: 8.2,
  changeWindow: "this year",
  activity: [
    { id: "a1", title: "Deposit from MTN MoMo",       amount: "+ RWF 500,000", time: "Today" },
    { id: "a2", title: "Savannah Creek · yield",      amount: "+ RWF 42,300",  time: "2 days ago" },
    { id: "a3", title: "Moved to Heza Estate",        amount: "— RWF 250,000", time: "6 days ago" },
  ],
};

// ───────── money-flow pickers ─────────

type Picker = { id: string; label: string; sub: string };

export const PK_DEPOSIT_SOURCES: Picker[] = [
  { id: "momo", label: "MTN MoMo · ****4421", sub: "Mobile money · Instant" },
  { id: "airtel", label: "Airtel Money · ****9023", sub: "Mobile money · Instant" },
  { id: "bok", label: "Bank of Kigali · ****982", sub: "Bank transfer · Same day" },
  { id: "card", label: "Card ending 4848", sub: "Visa · Instant" },
];

export const PK_FUNDS_PICKER: Picker[] = [
  { id: "cash", label: "Cash Reserve", sub: "Available · RWF 3,735,000" },
  { id: "savannah", label: "Savannah Creek", sub: "Allocated · 24%" },
  { id: "heza", label: "Heza Estate", sub: "Allocated · 18%" },
];

export const PK_DESTINATIONS: Picker[] = [
  { id: "momo", label: "MTN MoMo · ****4421", sub: "Mobile money · Instant" },
  { id: "bok", label: "Bank of Kigali · ****982", sub: "Bank transfer · 1–2 business days" },
];

export const PK_MANDATE_TARGETS: Picker[] = [
  { id: "cash", label: "Hold as Cash Reserve",
    sub: "Sit in your wallet until you allocate it." },
  { id: "house", label: "Invest with Poketee",
    sub: "Our team allocates across the live projects." },
  { id: "savannah", label: "Savannah Creek",
    sub: "Eco-tourism · safari camps in Akagera." },
  { id: "heza", label: "Heza Estate",
    sub: "Mid-market residential in Kigali." },
  { id: "shine", label: "Shine Group",
    sub: "Consumer goods manufacturing and distribution." },
  { id: "blessed", label: "Blessed Dairy",
    sub: "Smallholder dairy collection and processing." },
];

// Funding sources (used by the project checkout).
export const PK_SOURCES: { id: string; label: string; available?: number }[] = [
  { id: "cash", label: "Cash Reserve", available: 3735000 },
  { id: "momo", label: "MTN MoMo · ****4421", available: 1820000 },
  { id: "bok", label: "Bank of Kigali · ****982" },
];

// ───────── projects (the things you can invest in) ─────────

export const PK_PROJECTS: Project[] = [
  {
    id: "savannah-creek",
    type: "project",
    name: "Savannah Creek",
    sector: "Eco-tourism",
    location: "Akagera, Rwanda",
    blurb: "A network of tented safari camps and conservation lodges inside Rwanda's national parks.",
    status: "open",
    yieldRange: "11–15%", yieldHero: "13%",
    capitalNeeded: "RWF 320M", raisedPct: 52, lockMonths: 24,
    minInvest: "RWF 100,000",
    image: "COVER · TENTED CAMP", website: "savannah-creek.rw",
    financials: fin("RWF 240M", "+34% YoY", "26%"),
    metrics: [
      { label: "Capital needed", value: "RWF 320M" },
      { label: "Raised",         value: "52%" },
      { label: "Projected yield", value: "13%" },
      { label: "Lock-in",        value: "24 mo" },
    ],
    about:
      "Savannah Creek operates premium tented camps and conservation lodges " +
      "in and around Akagera National Park. The business pairs hard-currency " +
      "tourism revenue with a clear conservation mandate, and is the only " +
      "premium-segment operator with a multi-park concession portfolio.",
    thesis: [
      "Rwanda tourism arrivals up 36% year on year",
      "Premium ADR with structurally limited supply inside parks",
      "Hard-currency revenue with rand and dollar pricing",
    ],
    operations: [
      op("Reservations",
        "Direct and through curated travel partners. Average four-month booking lead time.",
        ["Booking management", "Partner relationships", "Yield management"],
        ["Wilderness Safaris", "andBeyond", "Direct"],
        "Continuous",
        [{ label: "Occupancy", value: "78%" }, { label: "Lead time", value: "4 mo" }]),
      op("Guest experience",
        "Full-board hosting with tailored game drives, walking safaris, and cultural programming.",
        ["Front office", "Housekeeping", "F&B", "Guiding"],
        ["African Parks", "Local guides"],
        "Daily",
        [{ label: "NPS", value: "76" }, { label: "Repeat", value: "32%" }]),
      op("Conservation",
        "Solar power, water recycling, and a revenue-share programme with neighbouring communities.",
        ["Solar maintenance", "Water recycling", "Community programme"],
        ["African Parks", "Local communities"],
        "Continuous",
        [{ label: "Solar share", value: "92%" }, { label: "Community spend", value: "12%" }]),
    ],
    risks: [
      "Climate-driven park access disruption",
      "Reliance on inbound premium demand",
      "Concession renewal risk",
    ],
  },
  {
    id: "heza-estate",
    type: "project",
    name: "Heza Estate",
    sector: "Real Estate",
    location: "Kigali, Rwanda",
    blurb: "Mid-market residential developments serving Kigali's growing professional class.",
    status: "open",
    yieldRange: "9–12%", yieldHero: "10%",
    capitalNeeded: "RWF 480M", raisedPct: 38, lockMonths: 36,
    minInvest: "RWF 250,000",
    image: "COVER · HOUSING BLOCK", website: "heza-estate.rw",
    financials: fin("RWF 410M", "+22% YoY", "19%"),
    metrics: [
      { label: "Capital needed", value: "RWF 480M" },
      { label: "Raised",         value: "38%" },
      { label: "Projected yield", value: "10%" },
      { label: "Lock-in",        value: "36 mo" },
    ],
    about:
      "Heza Estate acquires, develops, and sells mid-market residential " +
      "compounds in Kigali's growth corridors. Each phase pre-sells before " +
      "ground-breaking, recycling capital into the next site.",
    thesis: [
      "Structural housing shortage in Kigali's urban professional segment",
      "Pre-sale model de-risks each phase before construction",
      "Land bank acquired below market through long-standing relationships",
    ],
    operations: [
      op("Land acquisition",
        "Sites selected against infrastructure roadmap and walking-distance to schools and transit.",
        ["Site survey", "Title verification", "Zoning approval"],
        ["Rwanda Lands Authority", "City of Kigali"],
        "6 months / site",
        [{ label: "Sites under option", value: "4" }, { label: "Avg site size", value: "0.8 ha" }]),
      op("Construction",
        "Two construction partners run staged builds across multiple sites in parallel.",
        ["Procurement", "Build management", "QC inspection"],
        ["NPD Construction", "Strabag EA"],
        "12 months / phase",
        [{ label: "Units / yr", value: "84" }, { label: "On-budget rate", value: "94%" }]),
      op("Sales & handover",
        "In-house sales team plus partner mortgage origination through local banks.",
        ["Sales floor", "Mortgage referral", "Snag & handover"],
        ["Bank of Kigali", "I&M Bank", "Equity Bank"],
        "Continuous",
        [{ label: "Pre-sold", value: "68%" }, { label: "Avg ticket", value: "RWF 78M" }]),
    ],
    risks: [
      "Construction-cost inflation",
      "Mortgage availability for buyers",
      "Long capital cycle per phase",
    ],
  },
  {
    id: "shine-group",
    type: "project",
    name: "Shine Group",
    sector: "Consumer goods",
    location: "Kigali, Rwanda",
    blurb: "Manufacturing and distribution of personal-care and home-care brands across East Africa.",
    status: "closing-soon",
    yieldRange: "10–13%", yieldHero: "12%",
    capitalNeeded: "RWF 280M", raisedPct: 78, lockMonths: 18,
    minInvest: "RWF 100,000",
    image: "COVER · PRODUCTION LINE", website: "shinegroup.rw",
    financials: fin("RWF 384M", "+27% YoY", "16%"),
    metrics: [
      { label: "Capital needed", value: "RWF 280M" },
      { label: "Raised",         value: "78%" },
      { label: "Projected yield", value: "12%" },
      { label: "Lock-in",        value: "18 mo" },
    ],
    about:
      "Shine Group manufactures and distributes a portfolio of personal-care " +
      "and home-care brands sold across Rwanda, Uganda, Tanzania, and the DRC. " +
      "The business benefits from Made-in-Rwanda procurement preference and " +
      "harmonised EAC standards.",
    thesis: [
      "Made-in-Rwanda policy provides structural tailwind",
      "EAC harmonised standards favour scaled local manufacturers",
      "Anchor distribution contracts with regional retail chains",
    ],
    operations: [
      op("Sourcing",
        "Inputs procured through a central buying desk with regional suppliers.",
        ["Resin purchasing", "Fragrance sourcing", "QC sampling"],
        ["BASF EA", "Symrise EA"],
        "Monthly",
        [{ label: "Suppliers", value: "18" }, { label: "On-spec rate", value: "98%" }]),
      op("Production",
        "Three production lines running two shifts per day across 4,200 m² of factory floor.",
        ["Line scheduling", "Changeovers", "In-line QC"],
        ["Internal teams"],
        "Continuous",
        [{ label: "Utilisation", value: "82%" }, { label: "Yield", value: "97%" }]),
      op("Distribution",
        "Owned-fleet primary distribution plus partner last-mile across four EAC markets.",
        ["Route planning", "Fleet maintenance", "Trade marketing"],
        ["Sendy Logistics", "DPD Rwanda"],
        "Weekly",
        [{ label: "Markets", value: "4" }, { label: "On-time", value: "94%" }]),
    ],
    risks: [
      "FX exposure on imported inputs",
      "Energy-cost volatility",
      "Competition from regional FMCG majors",
    ],
  },
  {
    id: "blessed-dairy",
    type: "project",
    name: "Blessed Dairy",
    sector: "Agribusiness · Dairy",
    location: "Northern Province, Rwanda",
    blurb: "Smallholder dairy collection, processing, and cold-chain distribution to urban consumers.",
    status: "open",
    yieldRange: "8–11%", yieldHero: "9%",
    capitalNeeded: "RWF 220M", raisedPct: 44, lockMonths: 24,
    minInvest: "RWF 100,000",
    image: "COVER · DAIRY PLANT", website: "blesseddairy.rw",
    financials: fin("RWF 168M", "+19% YoY", "11%"),
    metrics: [
      { label: "Capital needed", value: "RWF 220M" },
      { label: "Raised",         value: "44%" },
      { label: "Projected yield", value: "9%" },
      { label: "Lock-in",        value: "24 mo" },
    ],
    about:
      "Blessed Dairy aggregates raw milk from a network of smallholder farmers " +
      "in Rwanda's Northern Province, processes it at a Musanze plant, and " +
      "distributes pasteurised and value-added dairy products to retailers " +
      "in Kigali and across the Eastern Province.",
    thesis: [
      "Per-capita dairy consumption growing 9% per year",
      "Cold-chain investment unlocks higher-margin value-added SKUs",
      "Long-term smallholder relationships secure raw-milk supply",
    ],
    operations: [
      op("Collection",
        "Network of 14 chilled collection centres aggregate from ~3,200 smallholders.",
        ["Farmer onboarding", "Quality testing", "Chilled aggregation"],
        ["Smallholder cooperatives", "RAB"],
        "Twice daily",
        [{ label: "Farmers", value: "3,200" }, { label: "Avg yield", value: "6.4 L / cow / day" }]),
      op("Processing",
        "Pasteurisation and packaging at a Musanze plant. Yoghurt and butter expansion underway.",
        ["Pasteurisation", "Homogenisation", "Packaging"],
        ["Tetra Pak", "Internal teams"],
        "Daily",
        [{ label: "Throughput / day", value: "22,000 L" }, { label: "Loss rate", value: "1.8%" }]),
      op("Distribution",
        "Cold-chain delivery to retailers, hotels, and institutional buyers across two provinces.",
        ["Route management", "Refrigerated fleet", "Trade marketing"],
        ["Inyange Industries", "Local retailers"],
        "Daily",
        [{ label: "Retail accounts", value: "180" }, { label: "Stock-out rate", value: "2.4%" }]),
    ],
    risks: [
      "Raw-milk price volatility",
      "Cold-chain reliability",
      "Concentration on a small number of urban retailers",
    ],
  },
];

// ───────── wallet ─────────

export const PK_WALLET = {
  invested: 9450000,
  available: 3000000,
  pending: [
    { id: "p1", title: "Withdrawal to Bank of Kigali", amount: "— RWF 250,000", sub: "Arriving in 1–2 days" },
    { id: "p2", title: "Deposit from MTN MoMo",        amount: "+ RWF 500,000", sub: "Clearing · instant" },
  ],
  holdings: [
    { id: "h1", label: "Savannah Creek", amount: "RWF 3,200,000", pct: 34, sub: "Lock 12 of 24 mo" },
    { id: "h2", label: "Heza Estate",    amount: "RWF 2,400,000", pct: 25, sub: "Lock 8 of 36 mo" },
    { id: "h3", label: "Shine Group",    amount: "RWF 2,250,000", pct: 24, sub: "Lock 9 of 18 mo" },
    { id: "h4", label: "Blessed Dairy",  amount: "RWF 1,600,000", pct: 17, sub: "Lock 6 of 24 mo" },
  ],
};

// ───────── settings ─────────

export const PK_SETTINGS = [
  { group: "Account",     items: [
    { id: "p",  label: "Personal information" },
    { id: "v",  label: "Verification",         meta: "Verified" },
    { id: "b",  label: "Bank & mobile money" },
  ]},
  { group: "Preferences", items: [
    { id: "no", label: "Notifications" },
    { id: "cu", label: "Currency",             meta: "RWF" },
    { id: "la", label: "Language",             meta: "English" },
  ]},
  { group: "Security",    items: [
    { id: "s",  label: "Sign-in & passcode" },
    { id: "d",  label: "Devices" },
  ]},
  { group: "Support",     items: [
    { id: "h",  label: "Help centre" },
    { id: "l",  label: "Legal & terms" },
    { id: "so", label: "Sign out",             destructive: true },
  ]},
];

// ───────── lookups ─────────

export const pkLookup = (id: string | null | undefined): Project | undefined => {
  if (!id) return undefined;
  return PK_PROJECTS.find((p) => p.id === id);
};
