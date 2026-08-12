import { ABOUT, BOOKING_URL, FAQ, HOME, HOURS, SERVICES, SITE as SITE_META } from "./content";
import type { SiteContent } from "./site-content-types";

/** Default editable site copy — seeded from content.ts so CMS and source stay in sync. */
export function getDefaultSiteContent(): SiteContent {
  return {
    SITE: {
      name: SITE_META.name,
      address: SITE_META.address,
      phone: SITE_META.phone,
      email: SITE_META.email,
      instagram: SITE_META.instagram,
    },
    HOURS,
    HEADER: {
      callNow: "Call Now",
      bookNow: "Book Now",
    },
    FOOTER: {
      hoursLabel: "Hours",
      quickLinksLabel: "Quick Links",
      callNow: "Call Now",
      bookOnline: "Book Online",
      copyright: "All rights reserved.",
      updateHeroVideos: "Update Hero Videos",
      manageGallery: "Manage Gallery",
      editSiteText: "Edit site text",
    },
    HOME: {
      hero: HOME.hero,
      valueProps: HOME.valueProps,
      featuredServices: HOME.featuredServices,
      servicesSection: {
        viewAll: "View All Services",
        bookNow: "Book Now",
      },
      aboutTeaser: HOME.aboutTeaser,
      finalCta: HOME.finalCta,
    },
    ABOUT: {
      team: {
        members: ABOUT.team.map((member) => ({
          name: member.name,
          handle: member.handle,
        })),
      },
    },
    SERVICES: {
      hero: {
        sectionLabel: "Services & Pricing",
        headline: SERVICES.hero.headline,
        subheadline: SERVICES.hero.subheadline,
      },
      list: SERVICES.list,
      addOns: {
        sectionLabel: "Add-Ons",
        headline: "Extras",
        body: SERVICES.addOns,
      },
      note: SERVICES.note,
      cta: SERVICES.cta,
    },
    FAQ_PAGE: {
      sectionLabel: "Questions & Answers",
      headline: "Frequently Asked Questions",
      subheadline: "Everything you need to know before your visit to our Antioch barbershop.",
      ctaHeadline: "Still have questions?",
      ctaBody: "Book online or give us a call — we're happy to help.",
      bookNow: "Book Now",
      contactUs: "Contact Us",
    },
    FAQ,
    CONTACT: {
      hero: {
        sectionLabel: "Get in Touch",
        headline: "Let's Get You Booked.",
        subheadline: "Walk in, call, or book online — however you reach us, we'll get you in the chair.",
        callNow: "Call Now",
        bookNow: "Book Now",
      },
      visit: {
        sectionLabel: "Visit Us",
        hoursHeadline: "Hours",
        openInMaps: "Open in Google Maps",
      },
      form: {
        sectionLabel: "Send a Message",
        headline: "Contact Form",
        body: "Prefer to book directly?",
        bookOnlineLink: "Book online",
      },
      cta: { label: "Book Your Appointment", href: BOOKING_URL },
    },
  };
}
