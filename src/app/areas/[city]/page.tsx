import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingPageLayout } from "@/components/LandingPageLayout";
import { getAllAreaSlugs, getAreaConfigBySlug } from "@/lib/area-page-factory";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return getAllAreaSlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const page = getAreaConfigBySlug(city);
  if (!page) return {};
  return buildPageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: page.path,
  });
}

export default async function AreaLandingPage({ params }: Props) {
  const { city } = await params;
  const page = getAreaConfigBySlug(city);
  if (!page) notFound();
  return <LandingPageLayout config={page} />;
}
