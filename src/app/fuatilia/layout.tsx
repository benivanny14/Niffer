import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order",
  alternates: { canonical: "/fuatilia" },
  robots: { index: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
