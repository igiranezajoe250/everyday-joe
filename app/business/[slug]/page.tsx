import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { slug: "inventory" },
    { slug: "point-of-sale" },
    { slug: "invoicing" },
    { slug: "financial-reports" },
    { slug: "tax-compliance" },
    { slug: "audit-trail" },
  ];
}

export default function BusinessPage() {
  redirect("/");
}
