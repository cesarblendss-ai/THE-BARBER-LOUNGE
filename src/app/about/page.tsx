import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/Button";
import { EditableText } from "@/components/EditableText";
import { SectionLabel } from "@/components/SectionLabel";
import { instagramProfileUrl } from "@/lib/content";
import { getSiteContent } from "@/lib/get-site-content";
import { GALLERY } from "@/lib/gallery";
import { resolveGalleryImage } from "@/lib/gallery-files";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us — Barbershop Antioch CA",
  description:
    "Meet the team behind The Barber Lounge in Antioch, CA. Precision fades, consistent standards, and barbers who treat every chair like their reputation is on the line.",
  path: "/about",
});

export default async function AboutPage() {
  const content = await getSiteContent();
  const { ABOUT } = content;
  const { hero, story, values, team, finalCta } = ABOUT;
  const heroImage = resolveGalleryImage(GALLERY.hero);

  return (
    <>
      <section className="bg-bone px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>
              <EditableText path="ABOUT.hero.sectionLabel" defaultValue={hero.sectionLabel} as="span" />
            </SectionLabel>
            <EditableText
              path="ABOUT.hero.headline"
              defaultValue={hero.headline}
              as="h1"
              className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl"
            />
            <EditableText
              path="ABOUT.hero.subheadline"
              defaultValue={hero.subheadline}
              as="p"
              className="mt-4 text-lg leading-relaxed text-charcoal/70"
              multiline
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="story-heading">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>
            <EditableText path="ABOUT.story.sectionLabel" defaultValue={story.sectionLabel} as="span" />
          </SectionLabel>
          <h2 id="story-heading" className="sr-only">
            {story.heading}
          </h2>
          <EditableText
            path="ABOUT.story.body"
            defaultValue={story.body}
            as="p"
            className="mt-4 text-base leading-relaxed text-charcoal/70 sm:text-lg"
            multiline
          />
        </div>
      </section>

      <section className="border-t border-charcoal/10 bg-bone px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>
            <EditableText path="ABOUT.values.sectionLabel" defaultValue={values.sectionLabel} as="span" />
          </SectionLabel>
          <EditableText
            path="ABOUT.values.headline"
            defaultValue={values.headline}
            as="h2"
            id="values-heading"
            className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.items.map((value, index) => (
              <li
                key={value.title}
                className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm"
              >
                <EditableText
                  path={`ABOUT.values.items.${index}.title`}
                  defaultValue={value.title}
                  as="h3"
                  className="font-serif text-xl font-semibold text-charcoal"
                />
                <EditableText
                  path={`ABOUT.values.items.${index}.body`}
                  defaultValue={value.body}
                  as="p"
                  className="mt-3 text-sm leading-relaxed text-charcoal/65"
                  multiline
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bone px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="team-heading">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>
            <EditableText path="ABOUT.team.sectionLabel" defaultValue={team.sectionLabel} as="span" />
          </SectionLabel>
          <EditableText
            path="ABOUT.team.headline"
            defaultValue={team.headline}
            as="h2"
            id="team-heading"
            className="mt-2 font-serif text-3xl font-semibold text-charcoal sm:text-4xl"
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.members.map((member, index) => (
              <li
                key={member.name}
                className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm"
              >
                <EditableText
                  path={`ABOUT.team.members.${index}.name`}
                  defaultValue={member.name}
                  as="h3"
                  className="font-serif text-xl font-semibold text-charcoal"
                />
                {member.handle && (
                  <a
                    href={instagramProfileUrl(member.handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-medium text-brass-dark underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                    aria-label={`${member.name} on Instagram`}
                  >
                    @{member.handle}
                  </a>
                )}
                <EditableText
                  path={`ABOUT.team.members.${index}.bio`}
                  defaultValue={member.bio}
                  as="p"
                  className="mt-3 text-sm leading-relaxed text-charcoal/65"
                  multiline
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-charcoal/10 bg-bone px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <EditableText
            path="ABOUT.finalCta.headline"
            defaultValue={finalCta.headline}
            as="h2"
            className="font-serif text-2xl font-semibold text-charcoal sm:text-3xl"
          />
          <div className="mt-8">
            <Button href={finalCta.cta.href} external size="lg">
              <EditableText path="ABOUT.finalCta.cta.label" defaultValue={finalCta.cta.label} as="span" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
