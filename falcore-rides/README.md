# Falcore Rides — website

A single-page site for the Falcore Rides mobile detailing business, with an
animated 3D hero built on top of the logo.

```
falcore-rides/
├── index.html          all the copy, the prices, the contact details
├── css/styles.css      colours, layout, animations
├── js/scene.js         the 3D hero (three.js)
├── js/site.js          menu, scroll reveals, card tilt, booking form
├── assets/             the logo (background removed, web-sized)
├── vendor/three/       three.js, vendored — no CDN, works offline
├── build-single-file.js            bundles everything into one .html
├── falcore-rides-standalone.html  ← generated, don't edit by hand
│
├── admin.html              your bookings dashboard (sign-in required)
├── css/admin.css           dashboard styles
├── js/admin.js             sign-in + reading and updating bookings
│
├── js/firebase-config.js   your Firebase project id and web API key
├── firebase.json           hosting, rules and functions settings
├── firestore.rules         who may write bookings, and who may read them
├── firestore.indexes.json  empty; Firestore wants the file to exist
├── .firebaserc             which Firebase project to deploy to
└── functions/              optional: emails you when a booking arrives
```

## Running it

It's a plain static site — no build step, no npm install.

```bash
cd falcore-rides
python3 -m http.server 8000
# then open http://localhost:8000
```

You need a local server rather than double-clicking `index.html`, because the
3D scene loads as an ES module and browsers block modules on `file://`.

To publish, see **Firebase** below — or upload the whole `falcore-rides`
folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, plain
shared hosting); it's just files.

## The one-file version

`falcore-rides-standalone.html` is the entire site — markup, CSS, JavaScript,
three.js and the logo — inlined into a single file with no external requests.
Handy for emailing it to someone, hosting somewhere that can't do folders, or
opening it straight off a USB stick. Unlike the multi-file version it also
works by double-clicking, with no server.

It's generated, so don't edit it directly. Edit the real files, then:

```bash
node build-single-file.js
```

Skip it entirely if you're only ever deploying the folder.

It bundles the main page only. The dashboard needs Firebase to be reachable
anyway, so there's nothing a single-file copy of it could do offline.

## Firebase

Two things: the site is hosted on Firebase Hosting, and booking requests are
saved to a Firestore database instead of depending on the visitor's email app.

Everything is scaffolded. What's left needs your Google account, so it has to
be you.

### One-time setup

**1. Make a project** at <https://console.firebase.google.com> — call it
whatever you like. Note the **project ID** (it's under the name, something
like `falcore-rides-4d21`).

**2. Register a web app** inside it: ⚙ Project settings → General → "Your
apps" → the `</>` icon. Firebase shows you a config block; you need one value
from it, `apiKey`.

**3. Create the database**: Build → Firestore Database → Create database →
**production mode** (the rules in this repo replace the defaults) → pick a
region close to your customers.

**4. Fill in `js/firebase-config.js`** with the project ID and API key.

**5. Install the CLI and sign in:**

```bash
npm install -g firebase-tools
firebase login
```

**6. Point the repo at your project:**

```bash
firebase use --add
```

Pick your project from the list and it writes `.firebaserc` for you. (That
file ships with an empty project list on purpose — a placeholder ID in there
makes the CLI fail with a confusing "Invalid project id" before you can even
log in.)

### Deploying

From inside the `falcore-rides` folder:

```bash
firebase deploy
```

That publishes the site and the database rules together. Your site is then at
`https://YOUR_PROJECT_ID.web.app`. Deploy one piece at a time with
`firebase deploy --only hosting` or `--only firestore:rules`.

Re-run `firebase deploy` after any edit. There's no build step.

A domain you own can be attached under Hosting → Add custom domain; Firebase
issues the SSL certificate for free.

### Your bookings dashboard

`admin.html` is a private page listing every request: name, tap-to-call phone
number, vehicle, size, service and notes. You can mark a job done or delete it.
It lives at `/admin.html` on your site — bookmark it.

Three things make it work, and it stays empty until all three are true:

**1. Create your login.** Firebase console → Authentication → Sign-in method →
enable **Email/Password**. Then Users → Add user, with the email and password
you want to sign in with.

**2. Verify that email.** The rules require a verified address, so a typo can't
quietly become an account. Easiest way: sign in on the dashboard once, then use
Authentication → Users → ⋮ → Reset password, which sends a mail you can act on.

**3. Name yourself in the rules.** `firestore.rules` is already set to
`musa.haseeb2012@gmail.com` — if you sign in with a different address, change
it in the `isAdmin()` list. Then deploy:

```bash
firebase deploy --only firestore:rules
```

Until then the dashboard shows a permission error that repeats these steps back
to you, with your address already filled in.

> **Why an email list and not just "is signed in"?**
> Firebase's email/password provider lets anyone register an account against
> your project straight from a browser. `request.auth != null` would therefore
> mean *anyone who signs up*, not *you*. Naming the address is the difference
> between a private dashboard and a public one.

Signing in keeps you signed in — the browser holds a refresh token and renews
in the background, so you're not typing a password every hour. "Sign out"
clears it.

The Firebase console works too, if you'd rather read raw documents.

### Getting told about new bookings

`functions/` holds a Cloud Function that emails you the moment a request lands,
so you don't have to keep the dashboard open.

**It needs the Blaze plan.** Cloud Functions aren't available on the free Spark
plan. For a small detailing business the actual bill is around nothing — the
monthly free allowance is far more than you'll use — but Google wants a card on
file. Everything else on this site runs on Spark.

If you'd rather not, skip the folder entirely; the dashboard doesn't depend on
it. Firebase's no-code **Trigger Email** extension is another route, though it
wants Blaze as well.

```bash
cd functions && npm install

firebase functions:secrets:set SMTP_HOST   # smtp.gmail.com
firebase functions:secrets:set SMTP_PORT   # 465
firebase functions:secrets:set SMTP_USER   # the mailbox to send from
firebase functions:secrets:set SMTP_PASS   # an app password
firebase functions:secrets:set ALERT_TO    # where alerts should land

firebase deploy --only functions
```

With Gmail that has to be an App Password (Google account → Security → 2-Step
Verification → App passwords), not your normal password. The credentials go
into Google's Secret Manager, never into this repo.

### About that API key

It's fine that it's in the page. Firebase web API keys are public identifiers,
not passwords — they ship to every visitor's browser no matter how you deploy.
Anyone can read yours off the site, and that's how Firebase is designed.

What actually protects the data is `firestore.rules`, which says:

- anyone may **create** a booking
- **nobody** may read, edit or delete one from a browser
- a document must look like a booking — the right fields, the right types,
  sensible length limits — or it's rejected

That last rule is what stops an open collection from becoming free storage for
whoever finds it. Don't loosen it to `allow read, write: if true`, even
briefly; that publishes your customers' phone numbers.

### If Firebase isn't set up yet

The form notices and opens the visitor's email app instead — the behaviour the
site had before. It does the same thing if a write fails for any reason
(offline, rules rejection, a browser blocking the request), rather than
telling someone their booking went through when it didn't.

So the site is safe to share right now, before you've touched Firebase at all.

### Why there's no Firebase SDK

The form talks to Firestore's REST API with one `fetch`. Loading the Firebase
JS SDK would have added an external dependency to a site that otherwise makes
zero outside requests, for the sake of a single POST. The rules, the console
and the data are identical either way.

## What you'll want to change

Everything below lives in `index.html`, marked with `EDIT ME` comments.

| What | Where |
| --- | --- |
| Phone, email, service area, hours | `EDIT ME — CONTACT DETAILS`, near the bottom. Change them in the contact list **and** in the footer. |
| Where the booking form sends | `data-email` on `<form id="bookForm">` |
| The origin story | `EDIT ME — THE ORIGIN STORY` |
| **Every price** | `EDIT ME — SERVICES AND PRICES` — the five `.size-btn` buttons. Each one carries that vehicle's two prices and durations, and the cards read from them. Prices appear nowhere else. |
| Service names and what's included | the two `<article class="card">` blocks in the same section |
| Which size the page opens on | move `aria-pressed="true"` to a different `.size-btn` |
| Adding or removing a vehicle size | add or delete a `.size-btn`; nothing else needs touching |
| What the name means | the `.namecard` block inside the story |
| Trust chips in the hero | `EDIT ME` above `.hero__chips` |

### The draft content

The origin story opens on the reader — the pride they already feel about their
own car, and how it quietly slips away — and only then turns to why the
business exists. That framing is deliberate; the specifics are still a draft.
Swap in your real first car, your real first customer, the real moment it
stopped being a hobby. Same for the trust chips in the hero: they're
placeholders shaped like the truth, and the real details always land better.

The one part that isn't guesswork is the name card partway through — Falcon +
Core, set like a dictionary entry, because that's what the name is made of.

Visitors pick their vehicle above the two cards and both prices update in
place. Every price below is the owner's own:

| Vehicle size | Interior only | Full detail |
| --- | ---: | ---: |
| Coupe | $60 | $100 |
| Sedan | $75 | $120 |
| Small SUV | $91 | $140 |
| SUV | $106 | $160 |
| 3-Row SUV | $106 | $180 |

The durations beside them (`data-hrs-interior`, `data-hrs-full`) are still
estimates — set them to how long the work actually takes you.

### Replacing the logo

Two files carry the badge, and everything on the site points at those two
filenames — swap them and nothing else needs editing:

- `assets/logo.png` — 1200px wide, used in the hero, the story panel and the
  footer
- `assets/logo-512.png` — the same artwork at 512px, used in the nav bar, the
  loading screen and the browser tab icon

Export new artwork as a transparent PNG. If yours has a solid background,
knock it out first — a flat colour behind the badge shows up as a rectangle
against the dark page.

### Colours

All of them are CSS variables at the top of `css/styles.css`, pulled off the
logo. Change `--yellow`, `--lime`, `--green` and the whole site follows.

## The booking form

Submissions go to Firestore (see **Firebase** above), and fall back to opening
the visitor's email app whenever that isn't possible. The submit handler near
the bottom of `js/site.js` is the whole of it — swap it if you'd rather use a
form service instead.

## The 3D hero

`js/scene.js` builds the whole scene in code — a reflective floor, two neon
rings orbiting the badge, rising soap bubbles and drifting sparkles. There are
no model or texture files to load.

It degrades on purpose:

- **No WebGL** (old browser, GPU blocklisted) — the canvas stays empty and the
  CSS hero carries the page on its own.
- **Phones and low-power machines** skip the planar reflection, run a cheaper
  bloom and render fewer bubbles.
- **`prefers-reduced-motion`** stops the camera drift and every CSS animation.
- **Offscreen or backgrounded** — rendering pauses entirely, so it isn't
  burning battery while someone reads the prices.

`vendor/three/` is three.js r169 (MIT, license included), vendored so the site
has zero external requests: nothing to break if a CDN goes down, and it works
on a laptop with no internet.
