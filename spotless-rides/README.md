# Spotless Rides — website

A single-page site for the Spotless Rides mobile detailing business, with an
animated 3D hero built on top of the logo.

```
spotless-rides/
├── index.html          all the copy, the prices, the contact details
├── css/styles.css      colours, layout, animations
├── js/scene.js         the 3D hero (three.js)
├── js/site.js          menu, scroll reveals, card tilt, booking form
├── assets/             the logo (background removed, web-sized)
└── vendor/three/       three.js, vendored — no CDN, works offline
```

## Running it

It's a plain static site — no build step, no npm install.

```bash
cd spotless-rides
python3 -m http.server 8000
# then open http://localhost:8000
```

You need a local server rather than double-clicking `index.html`, because the
3D scene loads as an ES module and browsers block modules on `file://`.

To publish, upload the whole `spotless-rides` folder to any static host
(GitHub Pages, Netlify, Cloudflare Pages, or plain shared hosting).

## What you'll want to change

Everything below lives in `index.html`, marked with `EDIT ME` comments.

| What | Where |
| --- | --- |
| Phone, email, service area, hours | `EDIT ME — CONTACT DETAILS`, near the bottom. Change them in the contact list **and** in the footer. |
| Where the booking form sends | `data-email` on `<form id="bookForm">` |
| The origin story | `EDIT ME — THE ORIGIN STORY` |
| Package names and prices | the four `<article class="card">` blocks |
| The full price list | `EDIT ME — PRICING` — three `.price-group` lists |
| Size upcharges | the `.size-note` chips |
| Membership price | the `.member` block |
| Stats (cars detailed, years, %) | `data-count` attributes in `.stats` |
| Trust chips in the hero | `EDIT ME` above `.hero__chips` |

### The draft content

The origin story is written as a believable first-person draft, not as your
actual history — swap in your real car, your real town, your real first
customer. Same for the stats and the trust chips: they're placeholders shaped
like the truth, and the real numbers will always land better.

The prices are a complete, market-plausible menu so the page works the moment
it's live. Check every number against what you actually charge before you
share the link.

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
  burning battery while someone reads the price list.

`vendor/three/` is three.js r169 (MIT, license included), vendored so the site
has zero external requests: nothing to break if a CDN goes down, and it works
on a laptop with no internet.
