# Setup Checklist — Get Ready to Work (2 hours)

> **Start here if you've never used a terminal:** [DAY-ONE-TUTORIAL.md](./DAY-ONE-TUTORIAL.md) — copy-paste walkthrough, zero jargon, ~45 min. Come back to this checklist when you're ready for the full reference.

**Hey — welcome!** You're good with people. This checklist gets your computer ready so Cesar can show you the tech side on tonight's call. No rush. Do one box at a time.

**Total time:** about 2 hours (you can split it into two sessions if you want).

---

## What you'll learn on the call (preview)

Cesar will walk you through this live — you don't need to understand it all now:

- [ ] How client websites are built (same stack as The Barber Lounge: **Next.js**, **React**, **TypeScript**, **Tailwind**)
- [ ] How to use **Cursor** — Chat vs Agent, and how to accept AI-suggested changes
- [ ] How to **prompt** the AI clearly (like giving good instructions to a teammate)
- [ ] What a **database** is and why sites store info (appointments, products, etc.)
- [ ] Basic **Git** — save changes, push to GitHub, auto-deploy on **Vercel**
- [ ] How the agency workflow fits together: code → GitHub → live site

---

## Part 1 — Create accounts (~25 min)

Do these in order. Use the same email for everything if you can — easier to remember.

### GitHub (free — stores your code online)

- [ ] Go to **https://github.com/signup**
- [ ] Pick a username you'll keep (your name or brand is fine)
- [ ] Verify your email when GitHub asks
- [ ] Write down: username + password (or save in your phone's password manager)

### Cursor (free tier is enough to start)

- [ ] Go to **https://cursor.com**
- [ ] Click **Download** and create an account (Sign in with GitHub works great)
- [ ] Confirm you can log in at cursor.com

### Vercel (Hobby / free — hosts websites)

- [ ] Go to **https://vercel.com/signup**
- [ ] Sign up with the **same GitHub account** you just made
- [ ] You're on the free **Hobby** plan — perfect for learning
- [ ] **Note for later:** when you work on real client sites commercially, the agency may use **Vercel Pro** — Cesar will handle that when the time comes

### Google account (only if you don't have one)

- [ ] If you already use Gmail, you're good — skip this
- [ ] If not: go to **https://accounts.google.com/signup**
- [ ] You'll need this later for **Google Business Profile** (GBP) work with local clients

---

## Part 2 — Install software on Windows (~30 min)

Open **PowerShell**: press the Windows key, type `PowerShell`, press Enter.

### Git for Windows (tracks changes in your code)

- [ ] Download from **https://git-scm.com/download/win**
- [ ] Run the installer — **default options are fine** (just keep clicking Next)
- [ ] Close and reopen PowerShell when done

### GitHub CLI (talks to GitHub from your terminal)

Pick one:

- [ ] **Easy way:** in PowerShell, paste and press Enter:
  ```powershell
  winget install --id GitHub.cli
  ```
- [ ] **Or download:** **https://github.com/cli/cli** → follow Windows install steps

Close and reopen PowerShell after install.

### Node.js LTS (runs the website tools)

- [ ] Go to **https://nodejs.org**
- [ ] Download the **LTS** version (the big green button — not "Current")
- [ ] Run the installer — defaults are fine
- [ ] Close and reopen PowerShell when done

### Verify everything installed

Paste these one at a time. Each should print a version number (not an error):

- [ ] Check Node:
  ```powershell
  node -v
  ```
- [ ] Check npm (comes with Node):
  ```powershell
  npm -v
  ```
- [ ] Check Git:
  ```powershell
  git --version
  ```
- [ ] Check GitHub CLI:
  ```powershell
  gh --version
  ```

**If something fails:** screenshot the error and send it to Cesar — easy fix on the call.

---

## Part 3 — Set up your workspace (~15 min)

**Important:** Do **not** put code projects inside **OneDrive** (Desktop, Documents synced to cloud). OneDrive can break Git. Use a plain folder instead.

- [ ] Create your dev folder:
  ```powershell
  New-Item -ItemType Directory -Force -Path C:\dev
  ```
- [ ] Open that folder in File Explorer — bookmark it mentally as "where my projects live"

You'll clone repos into `C:\dev\` on the call with Cesar. For now, just having the folder ready is enough.

---

## Part 4 — Cursor setup (~20 min)

### Install and sign in

- [ ] Open the Cursor app you downloaded
- [ ] Sign in (GitHub login recommended)
- [ ] Click **File → Open Folder** and choose `C:\dev`
- [ ] Confirm Cursor opens with that folder on the left sidebar

### Learn the basics (5 min read)

- [ ] **Chat** — ask questions, get explanations, no automatic file changes
- [ ] **Agent** — AI can edit files for you; you'll see a diff (green/red) and click **Accept** or **Reject**
- [ ] Rule of thumb: use **Chat** to understand; use **Agent** when you're ready to change code
- [ ] Skim the official docs (bookmark for later): **https://cursor.com/docs**

### Quick practice (optional but helpful)

- [ ] In Cursor, open Chat and ask: *"Explain what Node.js is in one paragraph for a beginner"*
- [ ] Try Agent on an empty folder: ask it to create a simple `hello.txt` — practice accepting the change

---

## Part 5 — Git basics to verify before the call (~20 min)

Stay in PowerShell. Replace `Your Name` and `your.email@example.com` with your real info.

### Log into GitHub from your computer

- [ ] Run:
  ```powershell
  gh auth login
  ```
- [ ] Choose: **GitHub.com** → **HTTPS** → **Login with a web browser**
- [ ] Copy the one-time code, press Enter, authorize in the browser
- [ ] Confirm it worked:
  ```powershell
  gh auth status
  ```
  You should see **Logged in to github.com as YOUR_USERNAME**

### Tell Git who you are (this project only — not global yet)

We set **local** config so it only applies inside one project folder. Cesar will explain **global** vs **local** on the call — for now, local is safer while you're learning.

- [ ] Pick a practice folder (we'll use `C:\dev`):
  ```powershell
  cd C:\dev
  ```
- [ ] Set your name **for this folder only** (after you clone a repo, run these inside that repo):
  ```powershell
  git config user.name "Your Name"
  ```
- [ ] Set your email **for this folder only**:
  ```powershell
  git config user.email "your.email@example.com"
  ```
- [ ] Verify (should show your name and email):
  ```powershell
  git config user.name
  git config user.email
  ```

**Note:** When Cesar helps you clone the real project, run those two `git config` commands again **inside that project folder**.

---

## Part 6 — Week 2 (optional — skip for tonight)

These power The Barber Lounge site. Cesar will set them up with you when you're ready — **don't create these yet** unless he asks.

- [ ] **Neon Postgres** (database) — https://neon.tech
- [ ] **Twilio** (SMS/text messages for clients) — https://www.twilio.com/try-twilio
- [ ] **ntfy** (push notifications) — https://ntfy.sh

---

## Before tonight's call with Cesar — final checklist

All boxes should be checked before you hop on:

- [ ] GitHub account created and email verified
- [ ] Cursor installed and signed in
- [ ] Vercel account created (signed in with GitHub)
- [ ] Google account ready (or skipped — you already have one)
- [ ] Git, GitHub CLI, and Node.js LTS installed
- [ ] `node -v`, `npm -v`, `git --version`, and `gh --version` all work
- [ ] `C:\dev` folder exists — **no code in OneDrive**
- [ ] `gh auth login` done — `gh auth status` shows you're logged in
- [ ] You know your GitHub username and can log in on your phone
- [ ] Cursor opens and you've tried Chat at least once
- [ ] Phone charged, decent Wi‑Fi, PowerShell handy

**Bring:** your GitHub username, any error screenshots, and questions — there are no dumb questions.

---

## Quick glossary (optional peek)

| Word | Plain English |
|------|----------------|
| **Repo** | A project folder tracked by Git |
| **Commit** | A saved snapshot of your changes |
| **Push** | Upload your commits to GitHub |
| **Deploy** | Put the site live on the internet (Vercel does this) |
| **Prompt** | The message you type to tell the AI what you want |
| **Database** | Where a site remembers data (appointments, products, etc.) |

---

## Stack you'll work with (same as the agency)

For reference — you don't need to memorize this tonight:

- **Next.js + React + TypeScript** — how pages and features are built
- **Tailwind CSS** — styling (colors, spacing, mobile layout)
- **Prisma + Neon Postgres** — database layer
- **Vercel** — hosting; updates go live when you push to GitHub
- **Twilio / ntfy** — texts and alerts (Week 2+)

---

*¿Algo no funciona o no entiendes un paso? **Pregunta a Cesar en la llamada** — para eso estamos.*
