import type { Metadata } from "next";

import { EditableText } from "@/components/EditableText";
import { instagramProfileUrl } from "@/lib/content";
import { getSiteContent } from "@/lib/get-site-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us — Barbershop Antioch CA",
  description:
    "Follow The Barber Lounge team on Instagram — precision fades and clean cuts in Antioch, CA.",
  path: "/about",
});

export default async function AboutPage() {
  const content = await getSiteContent();
  const { team } = content.ABOUT;

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-xl">
        <ul className="grid gap-4">
          {team.members.map((member, index) => (
            <li key={member.name}>
              {member.handle ? (
                <a
                  href={instagramProfileUrl(member.handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline justify-between gap-4 rounded-2xl border border-charcoal/10 bg-white px-6 py-4 shadow-sm transition-colors hover:border-brass/40 focus-visible:rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                  aria-label={`${member.name} on Instagram`}
                >
                  <EditableText
                    path={`ABOUT.team.members.${index}.name`}
                    defaultValue={member.name}
                    as="span"
                    className="font-serif text-lg font-semibold text-charcoal"
                  />
                  <span className="text-sm font-medium text-brass-dark">@{member.handle}</span>
                </a>
              ) : (
                <div className="rounded-2xl border border-charcoal/10 bg-white px-6 py-4 shadow-sm">
                  <EditableText
                    path={`ABOUT.team.members.${index}.name`}
                    defaultValue={member.name}
                    as="span"
                    className="font-serif text-lg font-semibold text-charcoal"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
