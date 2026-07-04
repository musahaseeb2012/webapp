# Car Quality & Value Checker

A small web app for checking whether a used car is worth buying: enter its
details and get a quality score plus a comparison between its asking price
and an estimated fair market value.

## Running it

```bash
cd car-quality-checker
npm start
```

Then open http://localhost:3000

## How it works

- **Quality score (0-100)** — a weighted blend of mileage-for-age, condition,
  accident history, service records, and number of previous owners.
- **Estimated fair value** — starts from a reference MSRP and a per-model
  depreciation ("retention") rate in `data.js`, then adjusts for the car's
  age, mileage, condition, accident history, service records, and owners.
  If the make/model isn't in the reference database, pick the closest
  vehicle category and provide the original MSRP to get a generic estimate.
- **Verdict** — asking price vs. estimated value: more than 10% below is a
  "Great Deal", within ±10% is "Fair Price", more than 10% above is
  "Overpriced".

This is a heuristic, illustrative estimate — not a live market valuation.
For a real purchase, cross-check with an independent inspection, a vehicle
history report, and a pricing guide (KBB, Edmunds, etc.).

## Files

- `index.html` — page structure
- `styles.css` — styling
- `data.js` — reference car database, depreciation rates, and scoring factors
- `app.js` — form handling, valuation math, and rendering
- `server.js` — simple static file server
