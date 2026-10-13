import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kikapu",
  alternates: { canonical: "/kikapu" },
  robots: { index: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
