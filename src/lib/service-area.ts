/**
 * East Bay service area — matches local_rank_scan.py + schema areaServed.
 * slug: URL segment for /areas/[slug]
 */
export const SERVICE_AREA_CITIES = [
  { slug: "antioch", name: "Antioch" },
  { slug: "pittsburg", name: "Pittsburg" },
  { slug: "brentwood", name: "Brentwood" },
  { slug: "oakley", name: "Oakley" },
  { slug: "concord", name: "Concord" },
  { slug: "martinez", name: "Martinez" },
  { slug: "bay-point", name: "Bay Point" },
  { slug: "discovery-bay", name: "Discovery Bay" },
  { slug: "pleasant-hill", name: "Pleasant Hill" },
  { slug: "walnut-creek", name: "Walnut Creek" },
  { slug: "clayton", name: "Clayton" },
  { slug: "danville", name: "Danville" },
  { slug: "san-ramon", name: "San Ramon" },
  { slug: "lafayette", name: "Lafayette" },
  { slug: "hercules", name: "Hercules" },
  { slug: "livermore", name: "Livermore" },
] as const;

export type ServiceAreaCity = (typeof SERVICE_AREA_CITIES)[number];
