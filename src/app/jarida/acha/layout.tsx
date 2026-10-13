import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiondoe kwenye jarida",
  alternates: { canonical: "/jarida/acha" },
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
