# Day One — Copy, Paste, Win (Start Here)

**Hey — Cesar asked me to write this for you.**

You're good with people. That's the hard part. Tonight we're just getting your computer ready and teaching you one skill: **copy a command, paste it, press Enter.** That's it. I'll walk you through everything like an older brother would — no rushing, no judging.

---

## Section 1: What you're learning (30 sec read)

Here's the big picture:

- **You talk to clients.** You sell, you explain, you build relationships. That's your superpower.
- **Cesar (and Cursor, the AI app) build the websites.** You'll learn enough to follow along and ask smart questions — not to become a programmer overnight.
- **Your job tonight:** install a few free tools and practice pasting commands into a blue window called PowerShell.
- **You won't break anything by copy-pasting.** Worst case, you see red text (an error). Screenshot it. Send it to Cesar. Fixed in two minutes.

Take a breath. One step at a time.

---

## Section 2: What is PowerShell?

PowerShell is a **terminal** — a window where you type instructions and the computer runs them. Think of it like texting your computer instead of clicking buttons.

### How to open it

1. Press the **Windows key** on your keyboard (the one with the Windows logo).
2. Type: `PowerShell`
3. Click **Windows PowerShell** (or just press **Enter**).

You'll see a blue or black window with text. That's your terminal. You're in.

### The rules (memorize these three)

1. **One command at a time.** Paste one block, press Enter, wait for it to finish. Then do the next one.
2. **Press Enter after you paste.** Pasting alone doesn't run anything — Enter does.
3. **Read what it says back.** Sometimes it says "Success." Sometimes it asks a question. Sometimes it's red (error). All useful info.

### How to copy and paste

- **Copy from this doc:** highlight the text → **Ctrl+C**
- **Paste into PowerShell:** **right-click** inside the window (easiest), OR click inside and press **Ctrl+V**

### If you see red text

That's an error. **Don't panic.** It happens to everyone — even Cesar, every day.

1. Take a screenshot (Windows key + Shift + S, drag a box around the red text).
2. Send it to Cesar.
3. Move on or try again — we'll fix it on the call.

---

## Section 3: Download Cursor (step by step)

Cursor is the app where you'll talk to AI and (with Cesar's help) work on websites. It's like ChatGPT built into a code editor.

### Install it

1. Open your browser and go to **https://cursor.com**
2. Click **Download for Windows**
3. Run the installer when it finishes downloading — click **Next, Next, Next** like any normal app
4. Open **Cursor** from your Start menu when it's done

### Sign in

1. When Cursor opens, it will ask you to sign in
2. Click **Sign in with GitHub**
3. **Don't have GitHub yet?** No problem — we'll create it in Section 4. Come back here after that.

### What Cursor looks like (don't memorize — just know)

- **Left side** = files and folders (like File Explorer)
- **Middle** = the actual code or text
- **Right or bottom** = **Chat** — where you talk to the AI

### THE SAUCE — your first prompt

Open Cursor Chat with **Ctrl+L** (hold Ctrl, tap L). Paste this exactly:

```
I'm brand new. I just installed Cursor. Explain what I should click first and what Agent vs Chat means. Keep it simple — 5 bullet points max.
```

Press Enter. Read the answer. You just used AI to learn AI. Nice.

---

## Section 4: Create accounts (checkboxes + exact URLs)

Do these in order. Use the **same email** for everything — way easier to remember.

### GitHub (stores code online — like Google Drive for projects)

- [ ] Go to **https://github.com/signup**
- [ ] Pick a username (your name is fine — you'll keep this forever)
- [ ] Verify your email when GitHub sends the link
- [ ] Write down your username and password somewhere safe (phone notes app works)

### Cursor (the AI app you just installed)

- [ ] You already downloaded it in Section 3
- [ ] Make sure you can log in at **https://cursor.com** with your GitHub account

### Vercel (puts websites on the internet — free to start)

- [ ] Go to **https://vercel.com/signup**
- [ ] Click **Continue with GitHub** (use the same GitHub account)
- [ ] You're on the free **Hobby** plan — that's all you need for now
- [ ] Cesar handles paid plans when real client work needs them — ignore pricing for now

### Google account (only if you don't already have Gmail)

- [ ] Already use Gmail? Skip this.
- [ ] Don't have one? Go to **https://accounts.google.com/signup** and create one. You'll need it later for Google Business stuff with local clients.

---

## Section 5: Install stuff — COPY THESE ONE AT A TIME

Open PowerShell (Windows key → type `PowerShell` → Enter). Close and reopen it after each install — that refreshes things.

---

### Git

**What it does:** Saves versions of your work — like Google Docs history, but for code. Lets you undo, track changes, and share with Cesar.

1. Go to **https://git-scm.com/download/win**
2. Download and run the installer
3. Click **Next** through everything — defaults are perfect
4. Close PowerShell and open it again when done

---

### Node.js

**What it does:** The engine that runs websites on your computer before they go live. Every modern web tool needs it.

1. Go to **https://nodejs.org**
2. Click the big green **LTS** button (NOT the "Current" one)
3. Run the installer — **Next, Next, Next**
4. Close PowerShell and open it again when done

---

### GitHub CLI

**What it does:** Lets your computer talk to GitHub without opening the browser every time. Makes login and uploads easier.

Copy this into PowerShell and press Enter:

```powershell
winget install --id GitHub.cli
```

If it asks "Do you agree?" — type **Y** and press Enter. Wait until it says it's done.

Close PowerShell and open it again when done.

---

### Verify everything worked

Copy and paste **one at a time**. Each should show a version number — NOT "not recognized" or red text.

Copy this:

```powershell
node -v
```

You should see something like `v20.11.0` or `v22.x.x` — a **v** followed by numbers.

Copy this:

```powershell
npm -v
```

You should see a number like `10.2.4`.

Copy this:

```powershell
git --version
```

You should see `git version 2.x.x`.

Copy this:

```powershell
gh --version
```

You should see `gh version 2.x.x`.

**If any say "not recognized" or show red text:** screenshot it, send to Cesar. Easy fix on the call.

---

## Section 6: Create C:\dev folder — THE EXACT STEPS

This is where your projects will live. **Not on Desktop. Not in OneDrive.** Plain and simple.

### Method A — PowerShell (preferred)

Copy this whole block, paste into PowerShell, press Enter after each line (or paste all three — PowerShell runs them one by one):

```powershell
New-Item -ItemType Directory -Force -Path C:\dev
cd C:\dev
pwd
```

**What each line does, in plain English:**

- `New-Item ...` → "Hey computer, make a folder called `dev` on my C: drive. If it already exists, that's fine."
- `cd C:\dev` → "Go into that folder." (cd = change directory)
- `pwd` → "Tell me where I am right now." Should print `C:\dev`.

### Method B — Mouse (if PowerShell feels weird)

1. Open **File Explorer** (folder icon on taskbar)
2. Click **This PC** on the left
3. Double-click **Local Disk (C:)**
4. Right-click empty space → **New** → **Folder**
5. Name it exactly: `dev`

### Why not Desktop or OneDrive?

OneDrive syncs files to the cloud and can **break Git** (the version-saving tool). `C:\dev` stays on your computer, plain and simple — no surprises.

---

## Section 7: Log into GitHub from your computer

This connects your computer to your GitHub account so you can push code later.

Copy this:

```powershell
gh auth login
```

Press Enter. Now follow the prompts — here's exactly what to click:

| It asks... | You choose... |
|------------|---------------|
| **What account?** | `GitHub.com` (use arrow keys, press Enter) |
| **Preferred protocol?** | `HTTPS` |
| **Authenticate Git credentials?** | `Yes` |
| **How to authenticate?** | `Login with a web browser` |
| **One-time code** | Copy the code it shows, press Enter — browser opens |
| **In the browser** | Paste the code, click **Authorize**, approve if Windows asks |

When you're back in PowerShell, copy this to confirm it worked:

```powershell
gh auth status
```

You should see: **Logged in to github.com as YOUR_USERNAME**

If not — screenshot and send to Cesar.

---

## Section 8: Git identity (copy paste, replace name/email)

Git needs to know who you are when you save changes. This only applies inside the folder you're working in — safe while you're learning.

Copy these one at a time. **Replace the name and email with yours.**

```powershell
cd C:\dev
```

```powershell
git config user.name "YOUR NAME HERE"
```

```powershell
git config user.email "your.email@gmail.com"
```

Check it worked:

```powershell
git config user.name
git config user.email
```

Should print back exactly what you typed. When Cesar helps you clone a real project on the call, you'll run those two `git config` lines again **inside that project folder**.

---

## Section 9: CURSOR PROMPTS TO USE ON TONIGHT'S CALL (THE SAUCE)

Open Cursor Chat (**Ctrl+L**). Copy and paste these during your call with Cesar. These are your cheat codes.

---

**1. Understand the project**

```
Explain this codebase like I'm 18 and never coded. What are the main folders and what does each one do? Keep it simple.
```

---

**2. Understand how we ship work**

```
What is git push and why do we use ship.cmd? Explain like I'm new — no jargon without defining it.
```

---

**3. Make a tiny change and go live**

```
Walk me through making a one-line change to a homepage and deploying it. Step by step — what do I click, what do I paste, what do I tell the client when it's live?
```

---

**4. Understand where data lives**

```
What is a database and where does our client data live? Explain with a real-world analogy — like a filing cabinet or spreadsheet.
```

---

**5. Get better at talking to AI**

```
How do I write a good prompt so the AI does what I want? Give me 3 before/after examples of bad vs good prompts.
```

---

**6. Talk to clients confidently**

```
What should I say to a client when they ask how long a website takes? Give me a simple, honest script I can use on a sales call.
```

---

**7. Understand the tools**

```
Explain Vercel vs GitHub vs Cursor in one analogy — like comparing a kitchen, a recipe book, and a chef. Keep it to one paragraph.
```

---

**8. When you're stuck**

```
I'm stuck — [paste your error message or screenshot description here]. What do I do step by step? Assume I've never seen this before.
```

---

**9. Learn the workflow (bonus)**

```
Walk me through our agency workflow from "client says yes" to "site is live." What happens at each step and who does what — me vs Cesar vs the AI?
```

---

**10. Practice accepting AI changes (bonus)**

```
Show me how to use Agent mode to make a small text change in a file. Walk me through seeing the diff and clicking Accept or Reject.
```

---

## Section 10: Before the call — 5-minute checklist

Right before you hop on with Cesar, quick scan:

- [ ] GitHub account works — you can log in on your phone
- [ ] Cursor opens and you're signed in
- [ ] Vercel account created (signed in with GitHub)
- [ ] `node -v`, `npm -v`, `git --version`, `gh --version` all show version numbers
- [ ] `C:\dev` folder exists
- [ ] `gh auth status` says you're logged in
- [ ] You tried Cursor Chat at least once (Section 3 prompt)
- [ ] Phone charged, Wi‑Fi good, PowerShell ready to go

**Bring:** your GitHub username, any error screenshots, and questions. Seriously — no dumb questions. That's what the call is for.

---

## Section 11: Cierre

*¿Algo no funciona o no entiendes un paso? **Pregunta a Cesar en la llamada** — para eso estamos. Lo estás haciendo bien.*

---

**Done?** When you're ready for the full reference (more detail, Week 2 stuff), see [FRIEND-SETUP-CHECKLIST.md](./FRIEND-SETUP-CHECKLIST.md). But if this is your first night — you started in the right place.
