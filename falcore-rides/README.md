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
└── falcore-rides-standalone.html  ← generated, don't edit by hand
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

To publish, upload the whole `falcore-rides` folder to any static host
(GitHub Pages, Netlify, Cloudflare Pages, or plain shared hosting).

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
| Stats (cars detailed, years, %) | `data-count` attributes in `.stats` |
| Trust chips in the hero | `EDIT ME` above `.hero__chips` |

### The draft content

The origin story opens on the reader — the pride they already feel about their
own car, and how it quietly slips away — and only then turns to why the
business exists. That framing is deliberate; the specifics are still a draft.
Swap in your real first car, your real first customer, the real moment it
stopped being a hobby. Same for the stats and the trust chips: they're
placeholders shaped like the truth, and the real details always land better.

Visitors pick their vehicle above the two cards and both prices update in
place. The two services and the sedan prices ($76 interior, $150 full detail)
came from you. The other four sizes are scaled from those, using these steps:

| Size | Interior | Full detail |
| --- | --- | --- |
| Coupe | −$10 | −$15 |
| Sedan | base | base |
| Small SUV | +$15 | +$25 |
| SUV | +$30 | +$50 |
| 3-Row SUV | +$50 | +$85 |

That's a guess at your pricing, not your pricing. Set those four buttons to
what you actually charge before you share the link.

### The logo still says "Spotless Rides"

The badge in `assets/` is artwork — the old name is drawn into the image, so
renaming the business doesn't change it. Every piece of *text* on the site now
says Falcore Rides, but the logo in the header, the hero, the story panel and
the footer still reads Spotless Rides.

To fix it, export a Falcore Rides badge as a transparent PNG and replace both
files, keeping the names:

- `assets/logo.png` — around 1200px wide, used in the hero, story and footer
- `assets/logo-512.png` — the same artwork at 512px, used in the nav bar,
  the loading screen and the browser tab icon

Nothing else needs editing; every reference points at those two filenames.

### Colours

All of them are CSS variables at the top of `css/styles.css`, pulled off the
logo. Change `--yellow`, `--lime`, `--green` and the whole site follows.

## The booking form

There's no backend, so the form opens the visitor's email app with everything
pre-filled (a `mailto:` link). That works on any static host and needs no
account.

If you'd rather have submissions land in an inbox or a spreadsheet without the
visitor's email app opening, point the form at a form service — the submit
handler is at the bottom of `js/site.js` and is the only thing that needs to
change.

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
