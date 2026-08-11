import type { Metadata } from "next";
import Link from "next/link";

import { CopyBlock } from "@/components/onboarding/CopyBlock";
import { PlatformTabs } from "@/components/onboarding/PlatformTabs";

export const metadata: Metadata = {
  title: "Start Here — Agency Onboarding",
  description:
    "Get your Mac or PC ready for tonight's onboarding call. Copy each step, paste, press Enter — you're good.",
  robots: { index: false, follow: false },
};

const FIRST_CURSOR_PROMPT = `I'm brand new. I just installed Cursor. Explain what I should click first and what Agent vs Chat means. Keep it simple — 5 bullet points max.`;

const MAC_INSTALL = `# Install Homebrew if needed (see brew.sh)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install tools
brew install git node gh`;

const MAC_DEV_FOLDER = `mkdir -p ~/dev
cd ~/dev
pwd`;

const MAC_VERIFY = `node -v
npm -v
git --version
gh --version`;

const MAC_GH_AUTH = `gh auth login`;

const MAC_GH_STATUS = `gh auth status`;

const MAC_GIT_IDENTITY = `cd ~/dev
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
git config user.name
git config user.email`;

const WIN_GH_CLI = `winget install --id GitHub.cli`;

const WIN_DEV_FOLDER = `New-Item -ItemType Directory -Force -Path C:\\dev
cd C:\\dev
pwd`;

const WIN_VERIFY = `node -v
npm -v
git --version
gh --version`;

const WIN_GH_AUTH = `gh auth login`;

const WIN_GH_STATUS = `gh auth status`;

const WIN_GIT_IDENTITY = `cd C:\\dev
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
git config user.name
git config user.email`;

function Step({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`step-${number}`}
      className="scroll-mt-6 rounded-2xl border border-bone/10 bg-white/[0.03] p-6 sm:p-8"
    >
      <div className="mb-5 flex items-start gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass font-serif text-lg font-semibold text-charcoal"
          aria-hidden
        >
          {number}
        </span>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-bone sm:text-3xl">{title}</h2>
          <p className="mt-1 text-base leading-relaxed text-bone/70">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4 pl-0 sm:pl-14">{children}</div>
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-brass underline decoration-brass/40 underline-offset-2 transition hover:text-bone hover:decoration-bone"
    >
      {children}
    </a>
  );
}

export default function StartPage() {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-charcoal text-bone">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <header className="mb-10 text-center sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
            Copy, Paste, Win
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-bone sm:text-5xl">
            Get Ready for Tonight&apos;s Call
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-bone/80">
            Copy each step. Press Enter. You&apos;re good.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base text-bone/60">
            You won&apos;t break anything. Worst case — red text? Screenshot it and send to Cesar.
          </p>
        </header>

        {/* Progress nav */}
        <nav
          aria-label="Steps"
          className="mb-10 flex flex-wrap justify-center gap-2 text-xs font-semibold sm:text-sm"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`#step-${n}`}
              className="rounded-full border border-bone/15 px-3 py-1 text-bone/70 transition hover:border-brass hover:text-brass"
            >
              {n}
            </a>
          ))}
        </nav>

        <div className="space-y-8">
          {/* Step 1 */}
          <Step
            number={1}
            title="Create your accounts"
            subtitle="Use the same email for everything — easier to remember."
          >
            <ul className="space-y-4 text-base leading-relaxed text-bone/90">
              <li>
                <strong className="text-bone">GitHub</strong> — stores code online (like Google Drive
                for projects).{" "}
                <ExternalLink href="https://github.com/signup">Sign up →</ExternalLink>
              </li>
              <li>
                <strong className="text-bone">Cursor</strong> — the AI app where you&apos;ll work on
                sites.{" "}
                <ExternalLink href="https://cursor.com">Download →</ExternalLink>
              </li>
              <li>
                <strong className="text-bone">Vercel</strong> — puts websites on the internet (free
                Hobby plan).{" "}
                <ExternalLink href="https://vercel.com/signup">Sign up with GitHub →</ExternalLink>
              </li>
            </ul>
            <p className="text-sm text-bone/60">
              No Gmail yet?{" "}
              <ExternalLink href="https://accounts.google.com/signup">Create a Google account</ExternalLink>{" "}
              — you&apos;ll need it later for local business stuff.
            </p>
          </Step>

          {/* Step 2 */}
          <Step
            number={2}
            title="Install your tools"
            subtitle="Git saves your work, Node runs websites, GitHub CLI talks to GitHub."
          >
            <PlatformTabs
              mac={
                <div className="space-y-4">
                  <p className="text-base text-bone/80">
                    Easiest on Mac: install{" "}
                    <ExternalLink href="https://brew.sh">Homebrew</ExternalLink> first, then run
                    these one at a time. Close and reopen Terminal after installs.
                  </p>
                  <CopyBlock code={MAC_INSTALL} label="Install git, node, and gh" />
                  <p className="text-sm text-bone/60">
                    Prefer downloads? Get{" "}
                    <ExternalLink href="https://git-scm.com/download/mac">Git</ExternalLink>,{" "}
                    <ExternalLink href="https://nodejs.org">Node.js LTS</ExternalLink>, and{" "}
                    <ExternalLink href="https://cli.github.com">GitHub CLI</ExternalLink> instead.
                  </p>
                </div>
              }
              windows={
                <div className="space-y-4">
                  <ul className="space-y-3 text-base text-bone/80">
                    <li>
                      <ExternalLink href="https://git-scm.com/download/win">Git for Windows</ExternalLink>{" "}
                      — download, run installer, click Next through everything.
                    </li>
                    <li>
                      <ExternalLink href="https://nodejs.org">Node.js LTS</ExternalLink> — big green
                      button, NOT &quot;Current.&quot;
                    </li>
                  </ul>
                  <CopyBlock code={WIN_GH_CLI} label="GitHub CLI (paste in PowerShell)" />
                  <p className="text-sm text-bone/60">
                    Close and reopen PowerShell after each install — that refreshes things.
                  </p>
                </div>
              }
            />
          </Step>

          {/* Step 3 */}
          <Step
            number={3}
            title="Open your terminal"
            subtitle="A terminal is a window where you type instructions instead of clicking buttons."
          >
            <PlatformTabs
              mac={
                <div className="space-y-3 text-base leading-relaxed text-bone/80">
                  <p>
                    <strong className="text-bone">Spotlight:</strong> press{" "}
                    <kbd className="rounded bg-bone/10 px-2 py-0.5 font-mono text-sm">⌘ + Space</kbd>,
                    type <code className="text-brass">Terminal</code>, press Enter.
                  </p>
                  <p>
                    <strong className="text-bone">Or:</strong> Finder → Applications → Utilities →
                    Terminal.
                  </p>
                  <p className="text-sm text-bone/60">
                    <strong>Rules:</strong> one command at a time → paste → press Enter → read what
                    it says back.
                  </p>
                </div>
              }
              windows={
                <div className="space-y-3 text-base leading-relaxed text-bone/80">
                  <p>
                    Press the <strong className="text-bone">Windows key</strong>, type{" "}
                    <code className="text-brass">PowerShell</code>, press Enter.
                  </p>
                  <p>You&apos;ll see a blue or black window — that&apos;s your terminal.</p>
                  <p className="text-sm text-bone/60">
                    <strong>Paste:</strong> right-click inside the window, or{" "}
                    <kbd className="rounded bg-bone/10 px-2 py-0.5 font-mono text-sm">Ctrl+V</kbd>.
                    One command at a time, then Enter.
                  </p>
                </div>
              }
            />
          </Step>

          {/* Step 4 */}
          <Step
            number={4}
            title="Create your dev folder"
            subtitle="Where your projects live — not Desktop, not iCloud/OneDrive (sync breaks Git)."
          >
            <PlatformTabs
              mac={
                <div className="space-y-3">
                  <CopyBlock code={MAC_DEV_FOLDER} />
                  <p className="text-sm text-bone/60">
                    <code className="text-brass">mkdir</code> makes the folder.{" "}
                    <code className="text-brass">cd</code> goes into it.{" "}
                    <code className="text-brass">pwd</code> shows where you are — should say{" "}
                    <code className="text-brass">/Users/yourname/dev</code>.
                  </p>
                </div>
              }
              windows={
                <div className="space-y-3">
                  <CopyBlock code={WIN_DEV_FOLDER} />
                  <p className="text-sm text-bone/60">
                    Should print <code className="text-brass">C:\dev</code>. Mouse way: File Explorer
                    → This PC → Local Disk (C:) → New Folder → name it{" "}
                    <code className="text-brass">dev</code>.
                  </p>
                </div>
              }
            />
          </Step>

          {/* Step 5 */}
          <Step
            number={5}
            title="Verify everything installed"
            subtitle="Each command should show a version number — NOT 'not recognized' or red text."
          >
            <PlatformTabs
              mac={<CopyBlock code={MAC_VERIFY} />}
              windows={<CopyBlock code={WIN_VERIFY} />}
            />
            <p className="text-sm text-bone/60">
              Something failed? Screenshot the red text and send to Cesar — easy fix on the call.
            </p>
          </Step>

          {/* Step 6 */}
          <Step
            number={6}
            title="Log into GitHub from your computer"
            subtitle="Connects your machine to your GitHub account so you can push code later."
          >
            <PlatformTabs
              mac={
                <div className="space-y-4">
                  <CopyBlock code={MAC_GH_AUTH} />
                  <div className="overflow-x-auto rounded-xl border border-bone/10 bg-black/20">
                    <table className="w-full min-w-[280px] text-left text-sm text-bone/80">
                      <thead>
                        <tr className="border-b border-bone/10 text-bone">
                          <th className="px-4 py-2 font-semibold">It asks…</th>
                          <th className="px-4 py-2 font-semibold">You choose…</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bone/10">
                        <tr>
                          <td className="px-4 py-2">What account?</td>
                          <td className="px-4 py-2">GitHub.com</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Protocol?</td>
                          <td className="px-4 py-2">HTTPS</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Authenticate Git?</td>
                          <td className="px-4 py-2">Yes</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">How to authenticate?</td>
                          <td className="px-4 py-2">Login with a web browser</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">One-time code</td>
                          <td className="px-4 py-2">Copy code → Enter → authorize in browser</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <CopyBlock code={MAC_GH_STATUS} label="Confirm it worked" />
                </div>
              }
              windows={
                <div className="space-y-4">
                  <CopyBlock code={WIN_GH_AUTH} />
                  <div className="overflow-x-auto rounded-xl border border-bone/10 bg-black/20">
                    <table className="w-full min-w-[280px] text-left text-sm text-bone/80">
                      <thead>
                        <tr className="border-b border-bone/10 text-bone">
                          <th className="px-4 py-2 font-semibold">It asks…</th>
                          <th className="px-4 py-2 font-semibold">You choose…</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bone/10">
                        <tr>
                          <td className="px-4 py-2">What account?</td>
                          <td className="px-4 py-2">GitHub.com</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Protocol?</td>
                          <td className="px-4 py-2">HTTPS</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Authenticate Git?</td>
                          <td className="px-4 py-2">Yes</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">How to authenticate?</td>
                          <td className="px-4 py-2">Login with a web browser</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">One-time code</td>
                          <td className="px-4 py-2">Copy code → Enter → authorize in browser</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <CopyBlock code={WIN_GH_STATUS} label="Confirm it worked" />
                </div>
              }
            />
            <p className="text-sm text-bone/60">
              Should say: <em>Logged in to github.com as YOUR_USERNAME</em>
            </p>
          </Step>

          {/* Step 7 */}
          <Step
            number={7}
            title="Tell Git who you are"
            subtitle="Git needs your name and email when saving changes. Replace with yours."
          >
            <PlatformTabs
              mac={<CopyBlock code={MAC_GIT_IDENTITY} />}
              windows={<CopyBlock code={WIN_GIT_IDENTITY} />}
            />
            <p className="text-sm text-bone/60">
              When Cesar helps you clone a real project on the call, run those two{" "}
              <code className="text-brass">git config</code> lines again inside that project folder.
            </p>
          </Step>

          {/* Step 8 */}
          <Step
            number={8}
            title="Open Cursor & try your first prompt"
            subtitle="Cursor is ChatGPT built into a code editor — where you'll work on websites."
          >
            <ol className="list-inside list-decimal space-y-2 text-base text-bone/80">
              <li>
                Download from{" "}
                <ExternalLink href="https://cursor.com">cursor.com</ExternalLink> if you haven&apos;t
                yet.
              </li>
              <li>Sign in with GitHub.</li>
              <li>
                Open Chat:{" "}
                <kbd className="rounded bg-bone/10 px-2 py-0.5 font-mono text-sm">⌘+L</kbd> on Mac,{" "}
                <kbd className="rounded bg-bone/10 px-2 py-0.5 font-mono text-sm">Ctrl+L</kbd> on
                Windows.
              </li>
              <li>Paste this prompt and press Enter:</li>
            </ol>
            <CopyBlock code={FIRST_CURSOR_PROMPT} label="Your first Cursor prompt" />
            <p className="text-sm text-bone/60">
              You just used AI to learn AI. Nice.
            </p>
          </Step>

          {/* Step 9 */}
          <Step
            number={9}
            title="Tonight with Cesar — preview"
            subtitle="You don't need to understand all of this now. Cesar walks you through it live."
          >
            <ul className="space-y-3 text-base leading-relaxed text-bone/80">
              <li className="flex gap-3">
                <span className="text-brass" aria-hidden>
                  →
                </span>
                How client websites are built (Next.js, React, Tailwind — same stack as this site)
              </li>
              <li className="flex gap-3">
                <span className="text-brass" aria-hidden>
                  →
                </span>
                Cursor Chat vs Agent — ask questions vs let AI edit files
              </li>
              <li className="flex gap-3">
                <span className="text-brass" aria-hidden>
                  →
                </span>
                How to write good prompts (clear instructions = better results)
              </li>
              <li className="flex gap-3">
                <span className="text-brass" aria-hidden>
                  →
                </span>
                Basic Git — save changes, push to GitHub, auto-deploy on Vercel
              </li>
              <li className="flex gap-3">
                <span className="text-brass" aria-hidden>
                  →
                </span>
                The agency workflow: client says yes → site goes live
              </li>
            </ul>
          </Step>

          {/* Step 10 */}
          <Step
            number={10}
            title="Stuck?"
            subtitle="No dumb questions — that's what the call is for."
          >
            <ul className="space-y-3 text-base leading-relaxed text-bone/80">
              <li>
                <strong className="text-bone">Red text?</strong> Screenshot it (Mac:{" "}
                <kbd className="rounded bg-bone/10 px-2 py-0.5 font-mono text-sm">⌘+Shift+4</kbd>,
                Windows:{" "}
                <kbd className="rounded bg-bone/10 px-2 py-0.5 font-mono text-sm">
                  Win+Shift+S
                </kbd>
                ) and send to Cesar.
              </li>
              <li>
                <strong className="text-bone">Before the call:</strong> GitHub works, Cursor opens,
                version commands all show numbers, dev folder exists,{" "}
                <code className="text-brass">gh auth status</code> says logged in.
              </li>
              <li>
                <strong className="text-bone">Bring:</strong> your GitHub username, any error
                screenshots, and questions.
              </li>
            </ul>
            <p className="mt-4 text-base italic text-bone/60">
              ¿Algo no funciona? Pregunta a Cesar en la llamada — para eso estamos.
            </p>
          </Step>
        </div>

        <footer className="mt-12 border-t border-bone/10 pt-8 text-center text-sm text-bone/50">
          <p>One step at a time. You&apos;ve got this.</p>
          <p className="mt-2">
            <Link href="/" className="text-brass/80 hover:text-brass">
              ← Back to site
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
