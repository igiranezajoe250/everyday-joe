import { notFound } from "next/navigation";
import DetailPage, { type Step, type Tab } from "../../components/DetailPage";
import { authProviders } from "@/auth";

const TABS: Tab[] = [
  { label: "Inventory", href: "/business/inventory" },
  { label: "Point of Sale", href: "/business/point-of-sale" },
  { label: "Invoicing", href: "/business/invoicing" },
  { label: "Reports", href: "/business/financial-reports" },
  { label: "Tax", href: "/business/tax-compliance" },
  { label: "Audit Trail", href: "/business/audit-trail" },
];

interface ProductData { steps: Step[] }

const PRODUCTS: Record<string, ProductData> = {
  "inventory": {
    steps: [
      {
        title: "Eliminate stock waste and shortfalls",
        description: "Dead stock ties up capital. Stockouts stop operations. Syncabi gives you a single real-time view across every location so you can reduce waste, reorder at the right time, and never lose a sale to empty shelves.",
        phone: { type: "stats", title: "Inventory Efficiency", subtitle: "Syncabi · Stock Optimisation",
          stats: [
            { label: "Stock accuracy", value: "99.4%" },
            { label: "Waste reduced", value: "31%" },
            { label: "Reorder time", value: "–18 hrs" },
            { label: "Locations synced", value: "3" },
          ],
        },
      },
      {
        title: "Real-time sync across every location",
        description: "Sell at the counter, inventory updates instantly across all warehouses and stores. No manual counting. No spreadsheet reconciliation. Your team always has accurate numbers to work from.",
        phone: { type: "list", title: "Live Activity", items: [
          { name: "Rice (25kg)", initials: "R", detail: "Sold 3 · Kigali — stock updated" },
          { name: "Cooking Oil (5L)", initials: "CO", detail: "Restocked +50 · Warehouse synced" },
          { name: "Sugar (1kg)", initials: "S", detail: "Below threshold — reorder triggered" },
          { name: "Flour (10kg)", initials: "F", detail: "Transfer Musanze → Kigali · In transit" },
        ]},
      },
      {
        title: "Automated reorder and smart alerts",
        description: "Set minimum stock levels per product and per location. Syncabi triggers reorder alerts before you run out — by SMS, push, or email. Spend less time managing stock, more time running your business.",
        phone: { type: "text", title: "Smart Reordering", tags: ["Auto-alerts", "Threshold control", "Multi-location", "Supplier links"],
          body: "Configure reorder points once. Syncabi monitors stock levels in real-time and notifies the right person the moment action is needed. Reorder suggestions include supplier details and average lead times to cut procurement time in half." },
      },
      {
        title: "Try Syncabi Inventory",
        description: "Import your current stock from a spreadsheet and go live in minutes. Free for your first 100 products — no credit card required.",
        phone: { type: "input", fundName: "Syncabi Inventory", fundHandle: "@syncabi", initials: "SI", currency: "RWF", amount: "Free", buttonLabel: "Start" },
      },
    ],
  },
  "point-of-sale": {
    steps: [
      {
        title: "Faster checkout, zero errors",
        description: "Every second a transaction takes is friction. Syncabi POS processes sales in under 10 seconds — on any phone or tablet. Cash, MTN MoMo, Airtel, or card. No dedicated hardware. Works offline.",
        phone: { type: "stats", title: "POS Performance", subtitle: "Syncabi · Point of Sale",
          stats: [
            { label: "Avg. transaction", value: "8 sec" },
            { label: "Error rate", value: "0.02%" },
            { label: "Daily throughput", value: "+34%" },
            { label: "Payment methods", value: "4" },
          ],
        },
      },
      {
        title: "Every payment method, one flow",
        description: "MTN MoMo, Airtel Money, Visa, Mastercard, and cash — all in one checkout. Customers pay however they prefer. You get one unified report at the end of the day, not four separate reconciliations.",
        phone: { type: "list", title: "Payment Methods", items: [
          { name: "MTN MoMo", initials: "MM", detail: "Mobile money · Instant confirmation" },
          { name: "Airtel Money", initials: "AM", detail: "Mobile money · Instant confirmation" },
          { name: "Card Payment", initials: "CC", detail: "Visa & Mastercard · Tap or swipe" },
          { name: "Cash", initials: "C", detail: "With tamper-proof digital receipt" },
        ]},
      },
      {
        title: "End-of-day reconciliation in seconds",
        description: "Every transaction is logged automatically. Receipts go to customers via SMS or WhatsApp. Your daily summary is ready the moment you close — no manual counting, no discrepancies, no late nights.",
        phone: { type: "text", title: "Instant Reconciliation", tags: ["Auto-log", "Digital receipts", "Daily summary", "Multi-location"],
          body: "All payment channels are consolidated into a single end-of-day report. Compare performance by location, by cashier, and by product. Spot inefficiencies — slow-moving items, underperforming shifts, payment method trends — at a glance." },
      },
      {
        title: "Try Syncabi POS",
        description: "Start selling in under 5 minutes. No hardware required — just your phone. Free for your first 50 transactions per month.",
        phone: { type: "input", fundName: "Syncabi POS", fundHandle: "@syncabi", initials: "SP", currency: "RWF", amount: "Free", buttonLabel: "Start" },
      },
    ],
  },
  "invoicing": {
    steps: [
      {
        title: "Shorten your cash cycle",
        description: "The gap between delivering and getting paid is where businesses run into trouble. Syncabi invoices go out instantly — professional, branded, with a payment link — so the clock starts running the moment the work is done.",
        phone: { type: "stats", title: "Billing Efficiency", subtitle: "Syncabi · Invoicing",
          stats: [
            { label: "Avg. days to pay", value: "8 days" },
            { label: "Collection rate", value: "94%" },
            { label: "Manual tasks cut", value: "–80%" },
            { label: "Outstanding", value: "RWF 12.4M" },
          ],
        },
      },
      {
        title: "Know exactly what is outstanding",
        description: "Paid, pending, overdue — at a glance. Syncabi matches incoming MoMo and bank transfer payments to invoices automatically. No manual matching. No chasing down your accounts to know where you stand.",
        phone: { type: "list", title: "Invoice Status", items: [
          { name: "INV-0412 · Blessed Dairy", initials: "BD", detail: "RWF 2.4M · Paid · 6 days" },
          { name: "INV-0411 · Keza Hotel", initials: "KH", detail: "RWF 890K · Pending · due in 3 days" },
          { name: "INV-0410 · Isaro Foods", initials: "IF", detail: "RWF 1.8M · Overdue · 4 days" },
          { name: "INV-0409 · Urugwiro", initials: "UR", detail: "RWF 560K · Paid · 11 days" },
        ]},
      },
      {
        title: "Automated follow-ups, no awkward calls",
        description: "Syncabi sends polite, professional payment reminders automatically — before due date, on the day, and after. You get paid faster without spending time chasing. Escalation rules handle the persistent cases.",
        phone: { type: "text", title: "Auto Follow-ups", tags: ["Pre-due reminder", "Due-date nudge", "Overdue escalation", "Custom cadence"],
          body: "Configure reminder schedules once per client or globally. Syncabi handles the follow-up chain — SMS and email — so your team can focus on delivering work, not collecting payment. Average collection time drops from 18 days to 8." },
      },
      {
        title: "Try Syncabi Invoicing",
        description: "Send your first invoice in under 2 minutes. Free for up to 10 invoices per month. No credit card required.",
        phone: { type: "input", fundName: "Syncabi Invoicing", fundHandle: "@syncabi", initials: "SI", currency: "RWF", amount: "Free", buttonLabel: "Start" },
      },
    ],
  },
  "financial-reports": {
    steps: [
      {
        title: "Spot what is hurting your margins",
        description: "Most businesses find out they have a problem months too late. Syncabi updates your P&L, revenue, and expense data in real time — so you can identify underperforming products, locations, or cost centres before they become crises.",
        phone: { type: "stats", title: "Financial Performance", subtitle: "Syncabi · Analytics",
          stats: [
            { label: "Monthly revenue", value: "RWF 42M" },
            { label: "Gross margin", value: "38.4%" },
            { label: "Cost identified", value: "RWF 3.1M" },
            { label: "Reporting time", value: "–90%" },
          ],
        },
      },
      {
        title: "Automated P&L from real transactions",
        description: "No more end-of-month spreadsheet work. Every sale, payment, and expense flows directly into your P&L. Broken down by category, location, and time period — so you can see exactly what is working and what is not.",
        phone: { type: "list", title: "P&L Breakdown", items: [
          { name: "Revenue", initials: "+", detail: "RWF 42M · +12% vs last month" },
          { name: "Cost of Goods", initials: "-", detail: "RWF 22M · Margin opportunity: –4%" },
          { name: "Operating Costs", initials: "-", detail: "RWF 9M · Staff, rent, utilities" },
          { name: "Net Profit", initials: "=", detail: "RWF 11M · 26.2% — up from 22.1%" },
        ]},
      },
      {
        title: "Reports your bank and investors will trust",
        description: "Download export-ready reports formatted for RRA compliance, bank loan applications, and investor presentations. One click. No accountant dependency for routine reporting.",
        phone: { type: "text", title: "Export Ready", tags: ["PDF / Excel", "RRA format", "Investor deck", "Scheduled exports"],
          body: "Reports are pre-formatted for every audience. Banks see clean transaction records. Investors see operational margins and growth trends. RRA sees compliant filings. Schedule automatic monthly exports to your accountant and eliminate the end-of-year scramble." },
      },
      {
        title: "Try Syncabi Reports",
        description: "Connect your payment data and see your first report in minutes. Free dashboard for businesses processing under RWF 5M monthly.",
        phone: { type: "input", fundName: "Syncabi Reports", fundHandle: "@syncabi", initials: "SR", currency: "RWF", amount: "Free", buttonLabel: "Start" },
      },
    ],
  },
  "tax-compliance": {
    steps: [
      {
        title: "Compliance without the overhead",
        description: "Tax obligations managed manually are expensive and error-prone. Syncabi calculates VAT, PAYE, and income tax automatically from your live transactions — so you are always current, never scrambling before a deadline.",
        phone: { type: "stats", title: "Tax Efficiency", subtitle: "Syncabi · Tax · RRA",
          stats: [
            { label: "VAT collected", value: "RWF 6.3M" },
            { label: "Filing status", value: "Compliant" },
            { label: "Manual hours saved", value: "14/mo" },
            { label: "Next filing", value: "Jun 15" },
          ],
        },
      },
      {
        title: "Filing schedule, automated",
        description: "Syncabi tracks every obligation — VAT, PAYE, corporate income tax — and generates RRA-ready returns from your actual data. Review, approve, file. The whole process takes minutes instead of days.",
        phone: { type: "list", title: "Filing Schedule", items: [
          { name: "VAT Return · May", initials: "V", detail: "Filed · RWF 1.2M paid · on time" },
          { name: "VAT Return · Jun", initials: "V", detail: "Due Jun 15 · RWF 1.3M calculated" },
          { name: "PAYE · Q2", initials: "P", detail: "Due Jul 15 · Auto-calculating" },
          { name: "Income Tax · 2026", initials: "IT", detail: "Due Mar 2027 · Tracking live" },
        ]},
      },
      {
        title: "Direct RRA integration",
        description: "Syncabi connects directly to Rwanda Revenue Authority systems. EBM receipts are generated automatically at point of sale. No duplicate data entry. No re-keying. No missed submissions.",
        phone: { type: "text", title: "RRA Connected", tags: ["E-filing", "EBM receipts", "Auto-calculate", "Zero manual entry"],
          body: "Your tax position updates in real time as transactions flow through Syncabi. The system flags anomalies, alerts you to upcoming deadlines, and prevents the kind of errors that attract RRA scrutiny. Compliance becomes a background process, not a project." },
      },
      {
        title: "Try Syncabi Tax",
        description: "Get your tax obligations under control. Free compliance dashboard shows your current status and upcoming deadlines immediately.",
        phone: { type: "input", fundName: "Syncabi Tax", fundHandle: "@syncabi", initials: "ST", currency: "RWF", amount: "Free", buttonLabel: "Start" },
      },
    ],
  },
  "audit-trail": {
    steps: [
      {
        title: "Operational accountability at every level",
        description: "When you can see every transaction, by whom, at what time, and in what context — you can find exactly where your operations are breaking down. Syncabi logs everything. Nothing is hidden, nothing is lost.",
        phone: { type: "stats", title: "Operational Audit", subtitle: "Syncabi · Accountability",
          stats: [
            { label: "Records logged", value: "14,892" },
            { label: "Staff tracked", value: "8" },
            { label: "Anomalies flagged", value: "3" },
            { label: "Integrity", value: "100%" },
          ],
        },
      },
      {
        title: "Find bottlenecks, not just errors",
        description: "See performance by cashier, by shift, by location. Identify which team members are processing transactions correctly, which locations have the most refunds, and where discrepancies tend to cluster.",
        phone: { type: "list", title: "Performance by Staff", items: [
          { name: "Jean · Kigali store", initials: "J", detail: "47 txns · 0 errors · 8.2 sec avg" },
          { name: "Marie · Kigali store", initials: "M", detail: "39 txns · 1 refund · 9.1 sec avg" },
          { name: "Pierre · Warehouse", initials: "P", detail: "12 adj · all reconciled · verified" },
          { name: "Diane · Huye store", initials: "D", detail: "31 txns · 2 flags · review pending" },
        ]},
      },
      {
        title: "Bank, investor, and RRA ready",
        description: "When banks or investors ask for records, your complete audit trail exports in their required format — clean, signed, and verifiable. Proves financial discipline before they need to ask twice.",
        phone: { type: "text", title: "Due Diligence Ready", tags: ["Bank loans", "Investor DD", "RRA audit", "Tamper-proof"],
          body: "Every entry is cryptographically signed. No record can be modified after the fact. Banks see clean transaction records. Investors see operational discipline. RRA sees compliance. Your audit trail becomes your most valuable business asset when you need capital." },
      },
      {
        title: "Try Syncabi Audit Trail",
        description: "Every transaction you process through Syncabi is automatically logged and secured from day one.",
        phone: { type: "input", fundName: "Syncabi Audit", fundHandle: "@syncabi", initials: "SA", currency: "RWF", amount: "Free", buttonLabel: "Start" },
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { title: `${name} — Syncabi by Syncabi` };
  });
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = PRODUCTS[slug];
  if (!data) notFound();

  const tabs = TABS.map((t) => ({ ...t, active: t.href === `/business/${slug}` }));
  const showEmbeddedLogin = slug === "inventory";

  return (
    <DetailPage
      tabs={tabs}
      steps={data.steps}
      ctaLabel="Try Syncabi"
      ctaHref={`/login?next=/business/${slug}&context=syncabi`}
      authPanel={
        showEmbeddedLogin
          ? {
              title: "",
              body: "",
              redirectTo: `/business/${slug}`,
              providers: authProviders,
            }
          : undefined
      }
    />
  );
}
