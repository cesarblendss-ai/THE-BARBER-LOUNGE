import Image from "next/image";

import { EditableText } from "@/components/EditableText";
import { instagramProfileUrl, type TeamMember } from "@/lib/content";

type BarberInstagramGridProps = {
  members: TeamMember[];
};

export function BarberInstagramGrid({ members }: BarberInstagramGridProps) {
  return (
    <ul className="grid gap-8 lg:grid-cols-2">
      {members.map((member, index) => {
        const handle = member.handle?.replace(/^@/, "").trim() ?? null;
        const profileUrl = handle ? instagramProfileUrl(handle) : null;
        const avatarUrl = handle
          ? `https://unavatar.io/instagram/${encodeURIComponent(handle)}`
          : null;

        return (
          <li
            key={member.name}
            className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03]"
          >
            <div className="flex items-center gap-4 border-b border-white/10 p-5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <EditableText
                  path={`ABOUT.team.members.${index}.name`}
                  defaultValue={member.name}
                  as="p"
                  className="truncate font-serif text-xl font-semibold text-white"
                />
                {handle ? <p className="truncate text-sm text-white/55">@{handle}</p> : null}
              </div>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md border border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
                >
                  Instagram
                </a>
              ) : null}
            </div>
            {handle ? (
              <iframe
                title={`${member.name} Instagram preview`}
                src={`https://www.instagram.com/${encodeURIComponent(handle)}/embed`}
                className="h-[32rem] w-full border-0 bg-black"
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
