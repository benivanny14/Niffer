import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tafuta",
  alternates: { canonical: "/tafuta" },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
