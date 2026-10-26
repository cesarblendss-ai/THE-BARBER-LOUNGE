import Image from "next/image";

import { EditableText } from "@/components/EditableText";
import {
  BOOKING_URL,
  instagramProfileUrl,
  teamAvatarPath,
  type TeamMember,
} from "@/lib/content";
import { getBooksyStafferUrl } from "@/lib/booksy";

type BarberProfileGridProps = {
  members: TeamMember[];
};

export function BarberProfileGrid({ members }: BarberProfileGridProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, index) => {
        const handle = member.handle?.replace(/^@/, "").trim() ?? null;
        const profileUrl = handle ? instagramProfileUrl(handle) : null;
        const avatarSrc = handle ? teamAvatarPath(handle) : null;
        const bookingHref = member.booksyStafferId
          ? getBooksyStafferUrl(member.booksyStafferId)
          : BOOKING_URL;

        return (
          <li
            key={member.name}
            className="flex flex-col rounded-2xl border border-white/15 bg-white/[0.03] p-6 sm:p-7"
          >
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/10 sm:h-24 sm:w-24">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={`${member.name} — The Barber Lounge`}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority={index < 3}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-2xl text-white/40">
                    {member.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <EditableText
                  path={`ABOUT.team.members.${index}.name`}
                  defaultValue={member.name}
                  as="p"
                  className="font-serif text-xl font-semibold tracking-tight text-white sm:text-2xl"
                />
                {handle ? (
                  profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-white/55 transition hover:text-white"
                    >
                      @{handle}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-white/55">@{handle}</p>
                  )
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-1 flex-col gap-2">
              <a
                href={bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-label={`Book with ${member.name}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Book with {member.name.split(" ")[0]}
                <span aria-hidden>→</span>
              </a>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-white/25 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:border-white/50 hover:bg-white/5 hover:text-white"
                >
                  Instagram
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
