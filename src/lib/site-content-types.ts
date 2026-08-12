export type CtaLink = {
  label: string;
  href: string;
};

export type ValueProp = {
  title: string;
  body: string;
};

export type FeaturedService = {
  name: string;
  price: string;
  time: string;
};

export type TeamMemberContent = {
  name: string;
  handle: string | null;
};

export type ServiceItem = {
  name: string;
  price: string;
  time: string;
  description: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type HourRow = {
  day: string;
  hours: string;
};

export type SiteContent = {
  SITE: {
    name: string;
    address: string;
    phone: string;
    email: string;
    instagram: string;
  };
  HOURS: HourRow[];
  HEADER: {
    callNow: string;
    bookNow: string;
  };
  FOOTER: {
    hoursLabel: string;
    quickLinksLabel: string;
    callNow: string;
    bookOnline: string;
    copyright: string;
    updateHeroVideos: string;
    manageGallery: string;
    editSiteText: string;
  };
  HOME: {
    hero: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      ctaPrimary: CtaLink;
      ctaSecondary: CtaLink;
      trustBar: string;
    };
    valueProps: ValueProp[];
    featuredServices: FeaturedService[];
    servicesSection: {
      viewAll: string;
      bookNow: string;
    };
    aboutTeaser: {
      headline: string;
      body: string;
      cta: CtaLink;
    };
    finalCta: {
      headline: string;
      cta: CtaLink;
    };
  };
  ABOUT: {
    team: {
      members: TeamMemberContent[];
    };
  };
  SERVICES: {
    hero: {
      sectionLabel: string;
      headline: string;
      subheadline: string;
    };
    list: ServiceItem[];
    addOns: {
      sectionLabel: string;
      headline: string;
      body: string;
    };
    note: string;
    cta: CtaLink;
  };
  FAQ_PAGE: {
    sectionLabel: string;
    headline: string;
    subheadline: string;
    ctaHeadline: string;
    ctaBody: string;
    bookNow: string;
    contactUs: string;
  };
  FAQ: FaqItem[];
  CONTACT: {
    hero: {
      sectionLabel: string;
      headline: string;
      subheadline: string;
      callNow: string;
      bookNow: string;
    };
    visit: {
      sectionLabel: string;
      hoursHeadline: string;
      openInMaps: string;
    };
    form: {
      sectionLabel: string;
      headline: string;
      body: string;
      bookOnlineLink: string;
    };
    cta: CtaLink;
  };
};
