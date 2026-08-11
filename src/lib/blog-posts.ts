export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  excerpt: string;
  relatedSlugs?: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-barber-antioch",
    title: "How to Find the Best Barber in Antioch, CA",
    description:
      "Looking for the best barber in Antioch? Learn what separates great barbershops from average ones — and book The Barber Lounge today.",
    publishedAt: "2026-08-08",
    excerpt:
      "Consultation, consistency, and local reputation — here's how to choose the best barber in Antioch and what to expect at The Barber Lounge.",
    relatedSlugs: ["best-fades-barbershop-antioch", "beard-trim-antioch-grooming"],
  },
  {
    slug: "best-fades-barbershop-antioch",
    title: "Discover the Best Fades in Antioch: Your Go-To Barbershop Antioch",
    description:
      "Searching for the best barbershop in Antioch? Get expert fades and personalized service at The Barber Lounge. Call us today!",
    publishedAt: "2026-08-08",
    excerpt:
      "If you're looking for the best fades in Antioch, CA, look no further than The Barber Lounge. We specialize in stylish fades and personalized grooming.",
    relatedSlugs: ["fade-vs-taper-haircut-antioch", "maintain-your-fade-kids-haircut-antioch"],
  },
  {
    slug: "fade-vs-taper-haircut-antioch",
    title: "Fade vs Taper Haircut in Antioch: The Ultimate Guide to Kids' Haircuts",
    description:
      "Discover the difference between fade and taper haircuts in Antioch. Get expert tips for your kids' haircuts at The Barber Lounge. Call today!",
    publishedAt: "2026-08-08",
    excerpt:
      "Choosing between a fade and taper for your child? This guide covers the differences, benefits, and what to expect at The Barber Lounge in Antioch.",
    relatedSlugs: ["maintain-your-fade-kids-haircut-antioch", "best-fades-barbershop-antioch"],
  },
  {
    slug: "maintain-your-fade-kids-haircut-antioch",
    title:
      "How to Maintain Your Fade: Expert Tips from The Barber Lounge for Kids' Haircuts in Antioch",
    description:
      "Learn expert tips on maintaining your child's fade hairstyle at The Barber Lounge in Antioch. Call us for the best kids haircut Antioch!",
    publishedAt: "2026-08-08",
    excerpt:
      "Keep your child's fade looking sharp between visits with brushing tips, product advice, and a regular haircut schedule from our Antioch barbers.",
    relatedSlugs: ["fade-vs-taper-haircut-antioch", "best-fades-barbershop-antioch"],
  },
  {
    slug: "beard-trim-antioch-grooming",
    title: "Why a Beard Trim Should Be Part of Your Grooming Routine in Antioch",
    description:
      "Discover why a beard trim in Antioch enhances your grooming routine. Call The Barber Lounge for expert care today!",
    publishedAt: "2026-08-08",
    excerpt:
      "Regular beard trims boost confidence, sharpen your look, and pair perfectly with a fresh haircut. Here's why Antioch men make it part of their routine.",
    relatedSlugs: ["best-fades-barbershop-antioch"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
