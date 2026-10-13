import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Malipo",
  alternates: { canonical: "/ukoko" },
  robots: { index: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
