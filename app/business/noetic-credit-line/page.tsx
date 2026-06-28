import DetailPage, { type Step, type Tab } from "../../components/DetailPage";

export const metadata = {
  title: "Syncabi Credit Line — Grow your business with ease | Syncabi",
};

const TABS: Tab[] = [
  { label: "Syncabi", href: "/business/syncabi" },
  { label: "Syncabi Credit Line", href: "/business/noetic-credit-line", active: true },
];

const STEPS: Step[] = [
  {
    title: "Credit that moves with your business",
    description: "A flexible credit line designed for Rwandan businesses — draw what you need, when you need it. No rigid loan schedules. Capital available the moment an opportunity arrives.",
    phone: {
      type: "stats",
      title: "Syncabi Credit Line",
      subtitle: "Syncabi · Business Finance",
      stats: [
        { label: "Credit available", value: "RWF 25M" },
        { label: "Interest rate", value: "From 14%" },
        { label: "Repayment", value: "Flexible" },
        { label: "Approval time", value: "48 hrs" },
      ],
    },
  },
  {
    title: "Simple, transparent terms",
    description: "Draw down in full or in parts. Repay on your schedule — weekly, monthly, or as revenue comes in. Interest accrues only on what you use. No hidden fees, no surprises.",
    phone: {
      type: "list",
      title: "Credit Terms",
      items: [
        { name: "Credit limit", initials: "CL", detail: "RWF 5M – 100M based on profile" },
        { name: "Draw periods", initials: "DP", detail: "Draw anytime within 12 months" },
        { name: "Repayment", initials: "RP", detail: "Weekly, monthly, or custom" },
        { name: "Interest", initials: "IR", detail: "From 14% p.a. on amount used" },
      ],
    },
  },
  {
    title: "Built on your track record",
    description: "Qualification is based on your business performance — revenue, transaction history, tax compliance, and audit trail. The stronger your Syncabi record, the better your credit terms.",
    phone: {
      type: "text",
      title: "How We Assess You",
      tags: ["Revenue history", "Tax compliance", "Audit trail", "Syncabi data"],
      body: "Connect your Syncabi account and we assess your credit profile in real time. Businesses with consistent revenue, clean tax records, and complete audit trails qualify for higher limits and lower rates. No collateral required for qualifying businesses.",
    },
  },
  {
    title: "Apply in minutes",
    description: "Link your Syncabi account, review your pre-assessed credit offer, and activate your credit line — all from within Syncabi. Funds disbursed to your wallet within 48 hours.",
    phone: {
      type: "input",
      fundName: "Syncabi Credit Line",
      fundHandle: "@kapitalle.credit",
      initials: "NC",
      currency: "RWF",
      amount: "25M",
      buttonLabel: "Apply",
    },
  },
];

export default function NoeticCreditLinePage() {
  return (
    <DetailPage
      tabs={TABS}
      steps={STEPS}
      ctaLabel="Apply for credit"
      ctaHref="/login?next=/business/noetic-credit-line&context=credit"
    />
  );
}
