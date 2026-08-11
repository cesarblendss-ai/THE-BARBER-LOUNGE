import type { MetadataRoute } from "next";
import { getAllAreaSlugs } from "@/lib/area-page-factory";
import { getAllBlogSlugs } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/constants";

const routes = [
  "",
  "/about",
  "/services",
  "/faq",
  "/testimonials",
  "/contact",
  "/blog",
  "/locations",
  "/kids-cuts",
  "/beard-studio",
  "/refer",
  ...getAllAreaSlugs().map((slug) => `/areas/${slug}`),
  ...getAllBlogSlugs().map((slug) => `/blog/${slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
