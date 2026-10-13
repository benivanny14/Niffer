import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bidhaa za upendwa",
  alternates: { canonical: "/upendwa" },
  robots: { index: false },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
