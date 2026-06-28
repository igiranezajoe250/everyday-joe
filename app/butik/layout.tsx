import { Inter } from "next/font/google";
import "./butik.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Butik",
    template: "%s | Butik",
  },
  description: "The rebirth of commerce in Africa.",
};

export default function ButikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.variable} style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", overflowX: "hidden" }}>
      {children}
    </div>
  );
}
