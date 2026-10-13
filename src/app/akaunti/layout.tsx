import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akaunti yako",
  alternates: { canonical: "/akaunti" },
  robots: { index: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
