# AMG Configurator

A car configurator for AMG-style performance cars: pick a model, then build it up
through paint, wheels, brakes, exterior packages, interior, performance and technology,
watching the price and the performance figures move as you go.

> **Unofficial demo project.** Independent and non-commercial — not affiliated with,
> endorsed by, or connected to Mercedes-Benz AG or Mercedes-AMG GmbH. Every model name,
> option, specification and price in `app.js` is an illustrative placeholder invented for
> this demo and reflects no real product or offer.

## Running it

It is plain HTML/CSS/JS with no build step and no network calls, so either works:

```bash
npm start                      # from the repository root, then open /amg/
open amg/index.html            # or just open the file directly
```

## What it does

- **Six silhouettes** — sedan, coupe, roadster, SUV coupe and boxy SUV bodies, all drawn
  as parametric SVG rather than bitmaps, so a paint or wheel change re-renders instantly.
- **Live preview** with an exterior side profile and an interior cabin view. Paint colour
  and finish (metallic, solid, matte), wheel design and diameter, caliper colour, carbon
  fibre parts, the fixed rear wing, tinted glass, quad tailpipes, upholstery and interior
  trim all show up in the drawing.
- **Numbers that respond** — output, torque, 0–60 mph, top speed and curb weight are
  recomputed from the option deltas; figures better than the base car are highlighted.
- **Running price** with an options subtotal, destination charge and an illustrative
  monthly finance estimate.
- **Build sheet** on the Summary step, printable via the price bar (`Print summary`).
- **Save and share** — builds persist in `localStorage`, and the whole configuration is
  encoded in the URL hash so a link reopens the exact car, view and step.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell — the option panels are rendered by JS |
| `styles.css` | Layout, dark theme, responsive rules, print stylesheet |
| `app.js` | Vehicle/option data, pricing and spec maths, SVG renderer, UI |

## Where things live in `app.js`

Section comments mark each part:

1. **Vehicle data** — `MODELS`, `PAINTS`, `WHEELS`, `CALIPERS`, `EXTERIOR`, `INTERIORS`,
   `TRIMS`, `PERFORMANCE`, `TECH`. Options carry a `price` plus optional `hp`, `tq`,
   `sixty`, `vmax` and `weight` deltas, and `only` / `not` arrays limiting them to
   certain models.
2. **State**, **pricing/performance maths**, **formatting** and **colour utilities**.
3. **Silhouette geometry** — `SHAPES` holds the control points for each body style
   (`smooth`, `open`, `box`); `bodyPath`, `glassPath`, `spokes` and `wheelGroup` turn them
   into SVG paths.
4. **Rendering**, **persistence** (share links, saved builds) and **events**.

Adding a model is a matter of appending to `MODELS` and adding a matching entry to
`SHAPES`; adding an option is one object in the relevant array, with no other changes.
