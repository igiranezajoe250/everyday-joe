import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { slug: "manufacturing-operations" },
    { slug: "services-consumer-brands" },
  ];
}

export default function VenturePage() {
  redirect("/");
}
