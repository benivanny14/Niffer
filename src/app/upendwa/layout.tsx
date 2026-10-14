import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
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
