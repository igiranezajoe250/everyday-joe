// data.jsx — mock data for Poketee.
// Six funds (no sub-companies). All amounts in RWF.

const CC_PORTFOLIO = {
  user: { name: 'Joseph', initials: 'JK' },
  total: 12450000,
  changePct: 8.2,
  changeWindow: 'this year',
  allocation: [
    { id: 'savannah', label: 'Savannah Creek', percent: 34 },
    { id: 'heza',     label: 'Heza Estate',    percent: 26 },
    { id: 'cash',     label: 'Cash Reserve',   percent: 40 },
  ],
  activity: [
    { id: 'a1', title: 'Top up from MTN MoMo',      amount: '+ RWF 500,000', time: 'Today' },
    { id: 'a2', title: 'Savannah Creek · yield',    amount: '+ RWF 42,300',  time: '2 days ago' },
    { id: 'a3', title: 'Invested in Heza Estate',   amount: '— RWF 250,000', time: '6 days ago' },
  ],
};

// ───────────────────────── Savings & Credit (Everyday core) ─────────────────────────
// Saving is the primary behaviour. Returns grow the savings; the savings
// balance in turn unlocks a credit line (capacity = 70% of savings).
//
// INTERNAL ECONOMICS (not surfaced in the customer UI):
//   Pooled savings are placed with professional investors earning ~12%.
//   Customers receive 8% interest on their savings; Everyday keeps the
//   ~4% spread, which also funds the credit line. Only the 8% interest and
//   the 70% borrowing ratio are shown to customers.

const CC_SAVINGS = {
  balance: 4200000,          // total saved
  returnsEarned: 318400,     // interest earned to date
  returnsPct: 8,             // 8% interest paid to the customer
  apy: '8%',
  streakMonths: 14,          // consecutive months saved
  monthlyContribution: 300000,
  monthlyGoal: 300000,
  savedThisMonth: 300000,
  thisMonthLabel: 'June',
  historyStartLabel: 'Jun 2024',
  // 12-month savings-balance history (oldest → newest), for the Growth sparkline
  history: [
    1850000, 2080000, 2310000, 2520000, 2760000, 3010000,
    3260000, 3480000, 3690000, 3880000, 4040000, 4200000,
  ],
  // Recent contributions
  contributions: [
    { id: 'c1', label: 'Monthly save',  sub: 'Auto · MTN MoMo', date: '1 Jun',  amount: '+ RWF 300,000' },
    { id: 'c2', label: 'Returns credited', sub: 'Savings yield', date: '1 Jun', amount: '+ RWF 28,600' },
    { id: 'c3', label: 'Monthly save',  sub: 'Auto · MTN MoMo', date: '1 May',  amount: '+ RWF 300,000' },
    { id: 'c4', label: 'Top up',         sub: 'Bank of Kigali',  date: '22 Apr', amount: '+ RWF 250,000' },
    { id: 'c5', label: 'Monthly save',  sub: 'Auto · MTN MoMo', date: '1 Apr',  amount: '+ RWF 300,000' },
  ],
};

// Credit line — capacity is a fixed share of savings. The more you save, the
// more you can borrow. Available = capacity − outstanding.
const CC_CREDIT = {
  ratio: 0.7,                                    // capacity = 70% of savings
  capacity: Math.round(4200000 * 0.7),           // 2,940,000
  outstanding: 900000,                           // currently owed
  serviceFeePct: 0.02,                           // 2% origination fee
  apr: '1.5% / mo',
  status: 'Good standing',
  nextPayment: { amount: 'RWF 150,000', date: '30 Jun' },
  get available() { return this.capacity - this.outstanding; },
  get utilization() { return Math.round((this.outstanding / this.capacity) * 100); },
};

const CC_DEPOSIT_SOURCES = [
  { id: 'momo',   label: 'MTN MoMo · ****4421',     sub: 'Mobile money · Instant' },
  { id: 'airtel', label: 'Airtel Money · ****9023', sub: 'Mobile money · Instant' },
  { id: 'bok',    label: 'Bank of Kigali · ****982', sub: 'Bank transfer · Same day' },
  { id: 'card',   label: 'Card ending 4848',         sub: 'Visa · Instant' },
];

const CC_FUNDS_PICKER = [
  { id: 'cash',     label: 'Cash Reserve',    sub: 'Available · RWF 3,735,000' },
  { id: 'savannah', label: 'Savannah Creek',  sub: 'Allocated · 24%' },
  { id: 'heza',     label: 'Heza Estate',     sub: 'Allocated · 18%' },
];

const CC_DESTINATIONS = [
  { id: 'momo', label: 'MTN MoMo · ****4421',     sub: 'Mobile money · Instant' },
  { id: 'bok',  label: 'Bank of Kigali · ****982', sub: 'Bank transfer · 1–2 business days' },
];

const CC_MANDATE_TARGETS = [
  { id: 'cash',     label: 'Your wallet',
                    sub: 'Hold as cash. Use to invest later.' },
  { id: 'house',    label: 'Invest with Everyday',
                    sub: 'Our team allocates across the live funds.' },
  { id: 'savannah', label: 'Savannah Creek',
                    sub: 'Eco-tourism · safari camps in Akagera.' },
  { id: 'heza',     label: 'Heza Estate',
                    sub: 'Mid-market residential in Kigali.' },
  { id: 'shine',    label: 'Shine Group',
                    sub: 'Consumer goods manufacturing and distribution.' },
  { id: 'blessed',  label: 'Blessed Dairy',
                    sub: 'Smallholder dairy collection and processing.' },
  { id: 'maran',    label: 'Maran Design',
                    sub: 'Design and architecture studio.' },
  { id: 'gll',      label: 'Great Lakes Logistics',
                    sub: 'Regional logistics and distribution network.' },
  { id: 'tpnn',     label: 'TPNN',
                    sub: 'Media hub — communications, PR, brand storytelling.' },
];

// Bank list used in the Top-Up / Withdraw "Connect a source" sheet.
// Just names — accounts are connected live by the user in the actual app.
const CC_BANKS = [
  { id: 'bok',        name: 'Bank of Kigali' },
  { id: 'equity',     name: 'Equity Bank' },
  { id: 'eco',        name: 'Ecobank' },
  { id: 'im',         name: 'I&M Bank' },
  { id: 'cogebanque', name: 'Cogebanque' },
  { id: 'access',     name: 'Access Bank' },
  { id: 'gtb',        name: 'GTB' },
  { id: 'kcb',        name: 'KCB Bank' },
];

// Funding sources for the venture checkout — with available balances.
const CC_SOURCES = [
  { id: 'cash', label: 'Cash Reserve',           available: 3735000 },
  { id: 'momo', label: 'MTN MoMo · ****4421',    available: 1820000 },
  { id: 'bok',  label: 'Bank of Kigali · ****982' },
];

const fin = (revenue, growth, ebitda, period = 'FY 2025') =>
  ({ revenue, growth, ebitda, period });

const op = (name, detail, activities, partners, timeline, kpis = []) =>
  ({ name, detail, activities, partners, timeline, kpis });

// ───────────────────────── Funds ─────────────────────────

const CC_FUNDS_V2 = [
  {
    id: 'savannah-creek', type: 'company', parent: 'reit-fund',
    name: 'Savannah Creek', sector: 'Eco-tourism', location: 'Akagera, Rwanda',
    blurb: 'A network of tented safari camps and conservation lodges inside Rwanda\'s national parks.',
    status: 'vetted',
    yieldRange: '11–15%', yieldHero: '13%',
    capitalNeeded: 'RWF 320M', raisedPct: 52, lockMonths: 24,
    minInvest: 'RWF 100,000',
    image: 'COVER · TENTED CAMP', website: 'savannah-creek.rw',
    financials: fin('RWF 240M', '+34% YoY', '26%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 320M' },
      { label: 'Raised',          value: '52%' },
      { label: 'Projected yield', value: '13%' },
      { label: 'Lock-in',         value: '24 mo' },
    ],
    about:
      'Savannah Creek operates premium tented camps and conservation lodges in and around ' +
      'Akagera National Park. The fund pairs hard-currency tourism revenue with a clear ' +
      'conservation mandate, and is the only premium-segment operator with a multi-park ' +
      'concession portfolio.',
    thesisBullets: [
      'Rwanda tourism arrivals up 36% year on year',
      'Premium ADR with structurally limited supply inside parks',
      'Hard-currency revenue with dollar pricing',
    ],
    operations: [
      op('Reservations', 'Direct and through curated travel partners. Four-month booking lead time.',
         ['Booking management', 'Partner relationships', 'Yield management'],
         ['Wilderness Safaris', 'andBeyond'], 'Continuous',
         [{ label: 'Occupancy', value: '78%' }, { label: 'Lead time', value: '4 mo' }]),
      op('Guest experience', 'Full-board hosting with game drives, walking safaris, cultural programming.',
         ['Front office', 'Housekeeping', 'F&B', 'Guiding'],
         ['African Parks', 'Local guides'], 'Daily',
         [{ label: 'NPS', value: '76' }, { label: 'Repeat', value: '32%' }]),
      op('Conservation', 'Solar power, water recycling, and a community revenue-share programme.',
         ['Solar maintenance', 'Water recycling', 'Community programme'],
         ['African Parks', 'Local communities'], 'Continuous',
         [{ label: 'Solar share', value: '92%' }, { label: 'Community spend', value: '12%' }]),
    ],
    risks: [
      'Climate-driven park access disruption',
      'Reliance on inbound premium demand',
      'Concession renewal risk',
    ],
  },
  {
    id: 'heza-estate', type: 'company', parent: 'reit-fund',
    name: 'Heza Estate', sector: 'Real Estate', location: 'Kigali, Rwanda',
    blurb: 'Mid-market residential developments serving Kigali\'s growing professional class.',
    status: 'vetted',
    yieldRange: '9–12%', yieldHero: '10%',
    capitalNeeded: 'RWF 480M', raisedPct: 38, lockMonths: 36,
    minInvest: 'RWF 250,000',
    image: 'COVER · HOUSING BLOCK', website: 'heza-estate.rw',
    financials: fin('RWF 410M', '+22% YoY', '19%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 480M' },
      { label: 'Raised',          value: '38%' },
      { label: 'Projected yield', value: '10%' },
      { label: 'Lock-in',         value: '36 mo' },
    ],
    about:
      'Heza Estate acquires, develops, and sells mid-market residential compounds in Kigali\'s ' +
      'growth corridors. Each phase pre-sells before ground-breaking, recycling capital into ' +
      'the next site.',
    thesisBullets: [
      'Structural housing shortage in Kigali\'s urban professional segment',
      'Pre-sale model de-risks each phase before construction',
      'Land bank acquired below market through long-standing relationships',
    ],
    operations: [
      op('Land acquisition', 'Sites selected against infrastructure roadmap and walking-distance amenities.',
         ['Site survey', 'Title verification', 'Zoning approval'],
         ['Rwanda Lands Authority', 'City of Kigali'], '6 months / site',
         [{ label: 'Sites under option', value: '4' }, { label: 'Avg site size', value: '0.8 ha' }]),
      op('Construction', 'Two construction partners run staged builds across sites in parallel.',
         ['Procurement', 'Build management', 'QC inspection'],
         ['NPD Construction', 'Strabag EA'], '12 months / phase',
         [{ label: 'Units / yr', value: '84' }, { label: 'On-budget rate', value: '94%' }]),
      op('Sales & handover', 'In-house sales team plus partner mortgage origination through local banks.',
         ['Sales floor', 'Mortgage referral', 'Snag & handover'],
         ['Bank of Kigali', 'I&M Bank', 'Equity Bank'], 'Continuous',
         [{ label: 'Pre-sold', value: '68%' }, { label: 'Avg ticket', value: 'RWF 78M' }]),
    ],
    risks: [
      'Construction-cost inflation',
      'Mortgage availability for buyers',
      'Long capital cycle per phase',
    ],
  },
  {
    id: 'shine-group', type: 'company', parent: 'reit-fund',
    name: 'Shine Group', sector: 'Consumer goods', location: 'Kigali, Rwanda',
    blurb: 'Manufacturing and distribution of personal-care and home-care brands across East Africa.',
    status: 'vetted',
    yieldRange: '10–13%', yieldHero: '12%',
    capitalNeeded: 'RWF 280M', raisedPct: 78, lockMonths: 18,
    minInvest: 'RWF 100,000',
    image: 'COVER · PRODUCTION LINE', website: 'shinegroup.rw',
    financials: fin('RWF 384M', '+27% YoY', '16%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 280M' },
      { label: 'Raised',          value: '78%' },
      { label: 'Projected yield', value: '12%' },
      { label: 'Lock-in',         value: '18 mo' },
    ],
    about:
      'Shine Group manufactures and distributes a portfolio of personal-care and home-care brands ' +
      'sold across Rwanda, Uganda, Tanzania, and the DRC. The business benefits from ' +
      'Made-in-Rwanda procurement preference and harmonised EAC standards.',
    thesisBullets: [
      'Made-in-Rwanda policy provides structural tailwind',
      'EAC harmonised standards favour scaled local manufacturers',
      'Anchor distribution contracts with regional retail chains',
    ],
    operations: [
      op('Sourcing', 'Inputs procured through a central buying desk with regional suppliers.',
         ['Resin purchasing', 'Fragrance sourcing', 'QC sampling'],
         ['BASF EA', 'Symrise EA'], 'Monthly',
         [{ label: 'Suppliers', value: '18' }, { label: 'On-spec rate', value: '98%' }]),
      op('Production', 'Three lines run two shifts per day across 4,200 m² of factory floor.',
         ['Line scheduling', 'Changeovers', 'In-line QC'],
         ['Internal teams'], 'Continuous',
         [{ label: 'Utilisation', value: '82%' }, { label: 'Yield', value: '97%' }]),
      op('Distribution', 'Owned-fleet primary distribution plus partner last-mile across four EAC markets.',
         ['Route planning', 'Fleet maintenance', 'Trade marketing'],
         ['Sendy Logistics', 'DPD Rwanda'], 'Weekly',
         [{ label: 'Markets', value: '4' }, { label: 'On-time', value: '94%' }]),
    ],
    risks: [
      'FX exposure on imported inputs',
      'Energy-cost volatility',
      'Competition from regional FMCG majors',
    ],
  },
  {
    id: 'blessed-dairy', type: 'company', parent: 'industry-fund',
    name: 'Blessed Dairy', sector: 'Agribusiness · Dairy', location: 'Northern Province, Rwanda',
    blurb: 'Smallholder dairy collection, processing, and cold-chain distribution to urban consumers.',
    status: 'vetted',
    yieldRange: '8–11%', yieldHero: '9%',
    capitalNeeded: 'RWF 220M', raisedPct: 44, lockMonths: 24,
    minInvest: 'RWF 100,000',
    image: 'COVER · DAIRY PLANT', website: 'blesseddairy.rw',
    financials: fin('RWF 168M', '+19% YoY', '11%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 220M' },
      { label: 'Raised',          value: '44%' },
      { label: 'Projected yield', value: '9%' },
      { label: 'Lock-in',         value: '24 mo' },
    ],
    about:
      'Blessed Dairy aggregates raw milk from a network of smallholder farmers in Rwanda\'s ' +
      'Northern Province, processes it at a Musanze plant, and distributes pasteurised and ' +
      'value-added dairy products to retailers in Kigali and across the Eastern Province.',
    thesisBullets: [
      'Per-capita dairy consumption growing 9% per year',
      'Cold-chain investment unlocks higher-margin value-added SKUs',
      'Long-term smallholder relationships secure raw-milk supply',
    ],
    operations: [
      op('Collection', '14 chilled collection centres aggregate from ~3,200 smallholders.',
         ['Farmer onboarding', 'Quality testing', 'Chilled aggregation'],
         ['Smallholder cooperatives', 'RAB'], 'Twice daily',
         [{ label: 'Farmers', value: '3,200' }, { label: 'Avg yield', value: '6.4 L / cow / day' }]),
      op('Processing', 'Pasteurisation and packaging at a Musanze plant. Yoghurt and butter expansion underway.',
         ['Pasteurisation', 'Homogenisation', 'Packaging'],
         ['Tetra Pak', 'Internal teams'], 'Daily',
         [{ label: 'Throughput / day', value: '22,000 L' }, { label: 'Loss rate', value: '1.8%' }]),
      op('Distribution', 'Cold-chain delivery to retailers, hotels, and institutional buyers.',
         ['Route management', 'Refrigerated fleet', 'Trade marketing'],
         ['Inyange Industries', 'Local retailers'], 'Daily',
         [{ label: 'Retail accounts', value: '180' }, { label: 'Stock-out rate', value: '2.4%' }]),
    ],
    risks: [
      'Raw-milk price volatility',
      'Cold-chain reliability',
      'Concentration on a small number of urban retailers',
    ],
  },
  {
    id: 'maran-design', type: 'company', parent: 'services-fund',
    name: 'Maran Design', sector: 'Design · Architecture', location: 'Kigali, Rwanda',
    blurb: 'Full-service design and architecture studio serving East Africa\'s real-estate developers and consumer brands.',
    status: 'vetted',
    yieldRange: '10–14%', yieldHero: '11%',
    capitalNeeded: 'RWF 180M', raisedPct: 29, lockMonths: 18,
    minInvest: 'RWF 100,000',
    image: 'COVER · DESIGN STUDIO', website: 'maran-design.rw',
    financials: fin('RWF 96M', '+38% YoY', '22%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 180M' },
      { label: 'Raised',          value: '29%' },
      { label: 'Projected yield', value: '11%' },
      { label: 'Lock-in',         value: '18 mo' },
    ],
    about:
      'Maran Design is a full-service architecture, interior, and brand-design studio. ' +
      'The studio anchors recurring revenue with multi-year retainers from real-estate developers ' +
      'and consumer brands across Rwanda, Kenya, and the DRC.',
    thesisBullets: [
      'High-margin service business with low capital intensity',
      'Multi-year retainers smooth project lumpiness',
      'Cross-border design pipeline diversifies single-market risk',
    ],
    operations: [
      op('Studio', 'In-house design teams across architecture, interiors, and brand.',
         ['Concept design', 'Technical drawings', 'Brand systems'],
         ['Internal teams'], 'Continuous',
         [{ label: 'Designers', value: '22' }, { label: 'Active projects', value: '34' }]),
      op('Delivery', 'Site supervision and design-administration during construction phase.',
         ['Site visits', 'Contractor coordination', 'Snagging'],
         ['NPD Construction', 'Strabag EA'], 'Per project',
         [{ label: 'On-time delivery', value: '88%' }, { label: 'Client NPS', value: '72' }]),
      op('Business development', 'Pipeline anchored by repeat clients plus competitive pitches.',
         ['Pitches', 'Retainer management', 'Industry events'],
         ['Architects Association of Rwanda'], 'Continuous',
         [{ label: 'Retainer share', value: '54%' }, { label: 'Win rate', value: '38%' }]),
    ],
    risks: [
      'Project cancellations in a downturn',
      'Talent retention',
      'Foreign-exchange exposure on cross-border invoicing',
    ],
  },
  {
    id: 'gll', type: 'company', parent: 'industry-fund',
    name: 'Great Lakes Logistics', sector: 'Logistics · Distribution', location: 'Kigali · East Africa',
    blurb: 'Cross-border parcel and pallet network linking Rwanda to the wider East African Community.',
    status: 'vetted',
    yieldRange: '11–14%', yieldHero: '12%',
    capitalNeeded: 'RWF 360M', raisedPct: 56, lockMonths: 24,
    minInvest: 'RWF 150,000',
    image: 'COVER · LOGISTICS HUB', website: 'gll.network',
    financials: fin('RWF 312M', '+44% YoY', '14%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 360M' },
      { label: 'Raised',          value: '56%' },
      { label: 'Projected yield', value: '12%' },
      { label: 'Lock-in',         value: '24 mo' },
    ],
    about:
      'Great Lakes Logistics (GLL) operates a parcel and pallet distribution network connecting ' +
      'Kigali to secondary cities in Rwanda and primary corridors into Uganda, Tanzania, Burundi, ' +
      'and the DRC. The network combines owned trunk-line fleet with last-mile partner couriers.',
    thesisBullets: [
      'EAC intra-trade growing 18% per year',
      'Asset-light last-mile combined with owned trunk lines',
      'Anchor contracts with FMCG manufacturers and e-commerce platforms',
    ],
    operations: [
      op('Pick-up & sorting', 'Branch network collects from SME shippers and consolidates at four regional hubs.',
         ['Pickup routes', 'Sorting', 'Manifest creation'],
         ['Sendy Logistics', 'SME shippers'], 'Daily',
         [{ label: 'Branches', value: '22' }, { label: 'Pickups / day', value: '1,840' }]),
      op('Trunk-line', 'Owned trunk-line fleet runs daily routes between Kigali and four cross-border hubs.',
         ['Long-haul driving', 'Fleet maintenance', 'Customs clearance'],
         ['EAC Customs', 'Internal fleet'], 'Daily',
         [{ label: 'Trucks', value: '38' }, { label: 'Avg utilisation', value: '81%' }]),
      op('Last-mile', 'Partner couriers handle last-mile delivery in destination cities.',
         ['Courier management', 'Delivery tracking', 'POD capture'],
         ['Local couriers', 'Glovo EA'], 'Daily',
         [{ label: 'On-time delivery', value: '93%' }, { label: 'Lost-parcel rate', value: '0.4%' }]),
    ],
    risks: [
      'Cross-border customs delays',
      'Fuel-cost volatility',
      'Dependence on partner couriers in destination markets',
    ],
  },
  {
    id: 'tpnn', type: 'company', parent: 'services-fund',
    name: 'TPNN', sector: 'Media · Communications · PR', location: 'Kigali, Rwanda',
    blurb: 'A media hub that runs structured communications, brand storytelling, and PR for organisations across the region.',
    status: 'vetted',
    yieldRange: '10–14%', yieldHero: '12%',
    capitalNeeded: 'RWF 200M', raisedPct: 33, lockMonths: 18,
    minInvest: 'RWF 100,000',
    image: 'COVER · MEDIA HUB', website: 'tpnn.media',
    financials: fin('RWF 128M', '+41% YoY', '21%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 200M' },
      { label: 'Raised',          value: '33%' },
      { label: 'Projected yield', value: '12%' },
      { label: 'Lock-in',         value: '18 mo' },
    ],
    about:
      'TPNN is a media hub helping organisations structure their communications, brand ' +
      'narrative, and public relations. The studio operates on multi-year retainers with ' +
      'corporates, public-sector clients, and high-growth ventures across Rwanda and the ' +
      'wider East African market.',
    thesisBullets: [
      'Structural under-supply of senior comms talent in the region',
      'Retainer model smooths revenue and compounds account value over time',
      'Cross-sell into events, content production, and PR amplifies margins',
    ],
    operations: [
      op('Strategy & narrative', 'Senior strategists set positioning, messaging, and quarterly comms plans per account.',
         ['Brand strategy', 'Messaging architecture', 'Quarterly planning'],
         ['Internal teams'], 'Quarterly',
         [{ label: 'Active accounts', value: '28' }, { label: 'Retainer share', value: '71%' }]),
      op('Content & production', 'In-house content, video, and design studio executes the comms plan across channels.',
         ['Editorial', 'Video production', 'Design'],
         ['Internal teams', 'Freelance network'], 'Continuous',
         [{ label: 'Stories / month', value: '160' }, { label: 'On-time delivery', value: '92%' }]),
      op('PR & distribution', 'Earned-media outreach and paid amplification across regional and international press.',
         ['Media relations', 'Press tours', 'Paid amplification'],
         ['The New Times', 'KT Press', 'Bloomberg Africa'], 'Continuous',
         [{ label: 'Placements / mo', value: '48' }, { label: 'Tier-1 share', value: '34%' }]),
    ],
    risks: [
      'Client concentration on a small number of large retainers',
      'Talent retention in a competitive senior-comms market',
      'Reputational risk tied to client outcomes',
    ],
  },
  {
    id: 'exp-africa', type: 'company', parent: 'services-fund',
    name: 'EXP.AFRICA', sector: 'Experiential · Events · Activation', location: 'Kigali · East Africa',
    blurb: 'An experiential marketing and events agency running brand activations, conferences, and live experiences across the region.',
    status: 'vetted',
    yieldRange: '11–15%', yieldHero: '13%',
    capitalNeeded: 'RWF 160M', raisedPct: 36, lockMonths: 18,
    minInvest: 'RWF 100,000',
    image: 'COVER · LIVE EVENT', website: 'exp.africa',
    financials: fin('RWF 112M', '+47% YoY', '24%'),
    metrics: [
      { label: 'Capital needed',  value: 'RWF 160M' },
      { label: 'Raised',          value: '36%' },
      { label: 'Projected yield', value: '13%' },
      { label: 'Lock-in',         value: '18 mo' },
    ],
    about:
      'EXP.AFRICA designs and produces brand activations, conferences, and live experiences for ' +
      'consumer brands, telcos, and institutions across Rwanda and the wider East African market. ' +
      'The agency blends project-based production revenue with multi-event retainers.',
    thesisBullets: [
      'Brands shifting spend toward measurable experiential channels',
      'Regional events calendar deepening with conferences and festivals',
      'Asset-light model with high margins on production and creative',
    ],
    operations: [
      op('Creative & strategy', 'Concepts activations end-to-end — from idea to run-of-show.',
         ['Concept design', 'Experience strategy', 'Production planning'],
         ['Internal teams'], 'Per project',
         [{ label: 'Active briefs', value: '26' }, { label: 'Win rate', value: '41%' }]),
      op('Production', 'In-house production crew plus vetted partner network for builds and staging.',
         ['Set & staging', 'Technical production', 'Logistics'],
         ['Partner crews', 'AV suppliers'], 'Continuous',
         [{ label: 'Events / yr', value: '140' }, { label: 'On-time delivery', value: '95%' }]),
      op('Measurement', 'Post-event reporting on reach, engagement, and brand lift for clients.',
         ['Data capture', 'Reporting', 'Account renewal'],
         ['Internal teams'], 'Per project',
         [{ label: 'Retainer share', value: '48%' }, { label: 'Repeat clients', value: '64%' }]),
    ],
    risks: [
      'Event spend is cyclical and discretionary',
      'Execution risk on large live productions',
      'Talent retention across creative and production teams',
    ],
  },
];

// ───────────────────────── Parent funds (themed pools) ─────────────────────────
// Three public, investable funds. Each pools several portfolio companies. The
// investor can back the whole fund (diversified — return tracks the pool), let
// an in-house expert allocate, or direct a set amount straight into a single
// company within the fund.
const CC_PARENT_FUNDS = [
  {
    id: 'industry-fund', type: 'fund',
    name: 'Manufacturing & Operations Fund',
    sector: 'Manufacturing · Operations', location: 'Rwanda · East Africa',
    blurb: 'A diversified pool across production and the operations that move goods — agri-processing, manufacturing, and logistics.',
    status: 'vetted',
    yieldRange: '9–14%', yieldHero: '11%',
    capitalNeeded: 'RWF 580M', raisedPct: 49, lockMonths: 24,
    minInvest: 'RWF 100,000',
    image: 'COVER · INDUSTRY', website: 'everyday.rw/funds/manufacturing',
    financials: fin('RWF 480M', '+28% YoY', '13%'),
    metrics: [
      { label: 'Companies',       value: '2' },
      { label: 'Capital needed',  value: 'RWF 580M' },
      { label: 'Projected yield', value: '11%' },
      { label: 'Lock-in',         value: '24 mo' },
    ],
    about:
      'The Manufacturing & Operations Fund pools capital across Rwanda\'s production and ' +
      'distribution backbone — agri-processing and the logistics that move goods to market. ' +
      'Back the whole fund for diversified exposure, or direct your capital straight into a company.',
    thesisBullets: [
      'Made-in-Rwanda policy and EAC integration favour local industry',
      'Asset-backed cash flows across production and distribution',
      'Operations businesses compound on volume as trade deepens',
    ],
    risks: [
      'Input-cost and fuel-price inflation',
      'FX exposure on imported materials',
      'Cold-chain and cross-border reliability',
    ],
  },
  {
    id: 'services-fund', type: 'fund',
    name: 'Services & Consumer Brands',
    sector: 'Services · Consumer brands', location: 'Rwanda · East Africa',
    blurb: 'A diversified pool of high-margin creative, media, and experiential businesses serving the region\'s brands.',
    status: 'vetted',
    yieldRange: '10–15%', yieldHero: '12%',
    capitalNeeded: 'RWF 540M', raisedPct: 33, lockMonths: 18,
    minInvest: 'RWF 100,000',
    image: 'COVER · SERVICES', website: 'everyday.rw/funds/services',
    financials: fin('RWF 336M', '+42% YoY', '22%'),
    metrics: [
      { label: 'Companies',       value: '3' },
      { label: 'Capital needed',  value: 'RWF 540M' },
      { label: 'Projected yield', value: '12%' },
      { label: 'Lock-in',         value: '18 mo' },
    ],
    about:
      'Services & Consumer Brands pools capital across high-margin, low-capital service businesses — ' +
      'design, media and PR, and experiential marketing. Back the whole fund for instant ' +
      'diversification, or direct your capital straight into a single company within it.',
    thesisBullets: [
      'High-margin service businesses with low capital intensity',
      'Multi-year retainers smooth project lumpiness',
      'Brands shifting spend toward creative and experiential channels',
    ],
    risks: [
      'Discretionary client spend is cyclical',
      'Talent retention across creative teams',
      'Revenue concentration within individual companies',
    ],
  },
  {
    id: 'reit-fund', type: 'fund',
    name: 'REIT Fund',
    sector: 'Real estate · Income', location: 'Rwanda · East Africa',
    blurb: 'A real-estate income pool spanning residential development, hospitality property, and consumer-asset businesses.',
    status: 'vetted',
    yieldRange: '9–15%', yieldHero: '11%',
    capitalNeeded: 'RWF 1.08B', raisedPct: 56, lockMonths: 36,
    minInvest: 'RWF 100,000',
    image: 'COVER · REIT', website: 'everyday.rw/funds/reit',
    financials: fin('RWF 1.03B', '+26% YoY', '20%'),
    metrics: [
      { label: 'Companies',       value: '3' },
      { label: 'Capital needed',  value: 'RWF 1.08B' },
      { label: 'Projected yield', value: '11%' },
      { label: 'Lock-in',         value: '24–36 mo' },
    ],
    about:
      'The REIT Fund pools capital across income-producing real estate and asset-backed ' +
      'businesses — residential development, hospitality property, and consumer-asset operations. ' +
      'Back the whole fund for diversified, asset-backed income, or direct your capital into a company.',
    thesisBullets: [
      'Structural housing shortage in Kigali\'s professional segment',
      'Hard-currency hospitality revenue with limited in-park supply',
      'Asset-backed cash flows cushion against market cycles',
    ],
    risks: [
      'Longer capital cycles on development phases',
      'Exposure to inbound tourism demand',
      'Construction-cost inflation',
    ],
  },
];

// Companies = the retyped CC_FUNDS_V2 entries that belong to a parent fund.
const CC_COMPANIES = CC_FUNDS_V2.filter((x) => x.type === 'company');

// The Ventures feed lists the parent funds.
const CC_VENTURES = CC_PARENT_FUNDS;

// Every detail-addressable entity, for lookup by id.
const CC_ALL = [...CC_PARENT_FUNDS, ...CC_COMPANIES];

// No "For You" segment in the rebrand — everything lives under Funds.
const CC_FORYOU = [];

// Single segment now — Funds.
const CC_FILTERS = [
  { id: 'funds', label: 'Funds' },
];

// Wallet view — invested + pending capital.
const CC_WALLET = {
  invested: 9450000,
  available: 3000000,
  pending: [
    { id: 'p1', title: 'Withdrawal to Bank of Kigali', amount: '— RWF 250,000', sub: 'Arriving in 1–2 days' },
    { id: 'p2', title: 'Top up from MTN MoMo',         amount: '+ RWF 500,000', sub: 'Clearing · instant' },
  ],
  holdings: [
    { id: 'h1', label: 'Savannah Creek', amount: 'RWF 3,200,000', pct: 34, sub: 'Lock 12 of 24 mo' },
    { id: 'h2', label: 'Heza Estate',    amount: 'RWF 2,400,000', pct: 25, sub: 'Lock 8 of 36 mo' },
    { id: 'h3', label: 'Shine Group',    amount: 'RWF 2,250,000', pct: 24, sub: 'Lock 9 of 18 mo' },
    { id: 'h4', label: 'Blessed Dairy',  amount: 'RWF 1,600,000', pct: 17, sub: 'Lock 6 of 24 mo' },
  ],
};

// Transaction history — savings, returns, borrow/repay, investments, withdrawals.
const CC_ACTIVITY = [
  { id: 'a1', kind: 'save',     title: 'Monthly save',                    meta: 'Auto · MTN MoMo',           date: 'Today · 09:24',     amount: '+ RWF 300,000',   dir: 'in',  status: 'Completed' },
  { id: 'a9', kind: 'borrow',   title: 'Credit drawdown',                 meta: 'Borrowed · to wallet',      date: 'Yesterday · 12:10',  amount: '+ RWF 400,000',   dir: 'in',  status: 'Completed' },
  { id: 'a2', kind: 'topup',    title: 'MTN MoMo',                        meta: 'Top up · Mobile money',     date: 'Yesterday · 18:02', amount: '+ RWF 500,000',   dir: 'in',  status: 'Completed' },
  { id: 'a5', kind: 'yield',    title: 'Returns credited',                meta: 'Savings yield',             date: '1 Jun · 00:00',     amount: '+ RWF 28,600',    dir: 'in',  status: 'Completed' },
  { id: 'a10', kind: 'repay',   title: 'Credit repayment',                meta: 'Repaid · from wallet',      date: '30 May · 08:00',    amount: '− RWF 150,000',   dir: 'out', status: 'Completed' },
  { id: 'a3', kind: 'invest',   title: 'Blessed Dairy',                   meta: 'Invested · Direct',         date: '12 May · 14:10',    amount: '− RWF 250,000',   dir: 'out', status: 'Completed' },
  { id: 'a4', kind: 'withdraw', title: 'Bank of Kigali',                  meta: 'Withdrawal',                date: '8 May · 11:30',     amount: '− RWF 250,000',   dir: 'out', status: 'Pending'   },
  { id: 'a6', kind: 'topup',    title: 'Bank of Kigali',                  meta: 'Top up · Bank transfer',    date: '28 Apr · 16:45',    amount: '+ RWF 1,000,000', dir: 'in',  status: 'Completed' },
];

const CC_SETTINGS = [
  { group: 'Account',     items: [
    { id: 'p',  label: 'Personal information' },
    { id: 'v',  label: 'Verification',         meta: 'Verified' },
    { id: 'b',  label: 'Bank & mobile money' },
  ]},
  { group: 'Preferences', items: [
    { id: 'no', label: 'Notifications' },
    { id: 'cu', label: 'Currency',             meta: 'RWF' },
    { id: 'la', label: 'Language',             meta: 'English' },
  ]},
  { group: 'Security',    items: [
    { id: 's',  label: 'Sign-in & passcode' },
    { id: 'd',  label: 'Devices' },
  ]},
  { group: 'Support',     items: [
    { id: 'h',  label: 'Help centre' },
    { id: 'l',  label: 'Legal & terms' },
    { id: 'so', label: 'Sign out',             destructive: true },
  ]},
];

const ccLookup = (id) => CC_ALL.find((x) => x.id === id);
const ccCompaniesIn = (fundId) => CC_COMPANIES.filter((c) => c.parent === fundId);

Object.assign(window, {
  CC_PORTFOLIO, CC_VENTURES, CC_FILTERS, CC_COMPANIES, CC_FUNDS_V2, CC_FORYOU,
  CC_PARENT_FUNDS, CC_ALL,
  CC_SAVINGS, CC_CREDIT,
  CC_DEPOSIT_SOURCES, CC_FUNDS: CC_FUNDS_PICKER, CC_DESTINATIONS,
  CC_MANDATE_TARGETS, CC_SOURCES, CC_BANKS,
  CC_WALLET, CC_SETTINGS, CC_ACTIVITY,
  ccLookup, ccCompaniesIn,
});
