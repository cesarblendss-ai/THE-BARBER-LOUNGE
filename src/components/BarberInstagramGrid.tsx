import Image from "next/image";

import { EditableText } from "@/components/EditableText";
import {
  BOOKING_URL,
  instagramProfileUrl,
  teamAvatarPath,
  type TeamMember,
} from "@/lib/content";

type BarberInstagramGridProps = {
  members: TeamMember[];
};

export function BarberInstagramGrid({ members }: BarberInstagramGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => {
        const handle = member.handle?.replace(/^@/, "").trim() ?? null;
        const profileUrl = handle ? instagramProfileUrl(handle) : null;
        const avatarSrc = handle ? teamAvatarPath(handle) : null;

        return (
          <li
            key={member.name}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03]"
          >
            <div className="flex flex-1 flex-col items-center px-6 pb-6 pt-8 text-center">
              <div className="relative h-36 w-36 overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-[0_0_0_6px_rgba(255,255,255,0.04)] sm:h-40 sm:w-40">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={`${member.name} profile photo`}
                    fill
                    sizes="160px"
                    className="object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-3xl text-white/40">
                    {member.name.slice(0, 1)}
                  </span>
                )}
              </div>

              <EditableText
                path={`ABOUT.team.members.${index}.name`}
                defaultValue={member.name}
                as="p"
                className="mt-5 font-serif text-2xl font-semibold text-white"
              />
              {handle ? <p className="mt-1 text-sm text-white/55">@{handle}</p> : null}

              <div className="mt-6 flex w-full flex-col gap-2">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-label={`Book with ${member.name}`}
                  className="inline-flex items-center justify-center rounded-md bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90"
                >
                  Book Appointment
                </a>
                {profileUrl ? (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
                  >
                    Instagram
                  </a>
                ) : null}
              </div>
            </div>

            {handle ? (
              <iframe
                title={`${member.name} Instagram preview`}
                src={`https://www.instagram.com/${encodeURIComponent(handle)}/embed`}
                className="h-[22rem] w-full border-0 border-t border-white/10 bg-black"
                loading="lazy"
                allow="encrypted-media; clipboard-write"
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
