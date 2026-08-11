import type { ReactNode } from "react";

import { BestBarberAntiochContent } from "./best-barber-antioch";
import { BeardTrimAntiochGroomingContent } from "./beard-trim-antioch-grooming";
import { BestFadesBarbershopAntiochContent } from "./best-fades-barbershop-antioch";
import { FadeVsTaperHaircutAntiochContent } from "./fade-vs-taper-haircut-antioch";
import { MaintainYourFadeKidsHaircutAntiochContent } from "./maintain-your-fade-kids-haircut-antioch";

const BLOG_CONTENT: Record<string, () => ReactNode> = {
  "best-fades-barbershop-antioch": BestFadesBarbershopAntiochContent,
  "best-barber-antioch": BestBarberAntiochContent,
  "fade-vs-taper-haircut-antioch": FadeVsTaperHaircutAntiochContent,
  "maintain-your-fade-kids-haircut-antioch": MaintainYourFadeKidsHaircutAntiochContent,
  "beard-trim-antioch-grooming": BeardTrimAntiochGroomingContent,
};

export function getBlogContent(slug: string): (() => ReactNode) | undefined {
  return BLOG_CONTENT[slug];
}
