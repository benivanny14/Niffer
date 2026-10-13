import type { Metadata } from "next";

type LayoutProps = {
  params: Promise<{ code: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Oda ${code}`,
    robots: { index: false, follow: false },
  };
}

export default function OrderLayout({ children }: LayoutProps) {
  return children;
}
