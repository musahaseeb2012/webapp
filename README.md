# CarCheck — Car Quality & Value Checker

A single-page web app for checking whether a new or used car is worth buying:
enter its details to get an estimated quality score and see how the price
compares to its estimated worth. Check a few cars and compare them side by
side.

## Features

- **New or used**, toggled per car:
  - **Used** — enter make, model, year, mileage, condition, title status, and
    asking price. Quality score is built from brand/model reliability
    reputation, age, mileage-per-year, condition, and title status.
    Estimated value comes from a depreciation curve plus mileage/condition
    adjustments.
  - **New** — enter make, model, year, MSRP, incentives/rebates, and the
    negotiated price. Quality score is built from reliability reputation and
    predicted resale value retention. Estimated fair price is ~5% off MSRP
    after incentives.
- Either way, results include a letter grade and a factor breakdown, and the
  price is labeled a Great Deal, Good Deal, Fair Price, Slightly Overpriced,
  or Overpriced.
- **Compare deals** — every car you check (new or used) is added to a
  comparison table so you can weigh several listings side by side, with the
  best quality score and best value automatically highlighted. Rows can be
  removed individually or cleared all at once.
- **Listing photo (optional)** — attach a photo of the listing (or take one
  on a phone/tablet) and it shows up in the results and comparison table for
  visual reference. It's resized and processed entirely in the browser —
  never uploaded anywhere — and it doesn't feed into the score or valuation;
  those always come from the details you enter.
- **Common issues to watch for** — known problem areas for the make/model,
  pulled from a curated reference dataset.
- **Buying checklist** — pre-purchase inspection, vehicle history report,
  title verification, test drive checklist.

## Getting Started

### Prerequisites

- Node.js installed on your system

### Installation & Running

1. Navigate to the project directory
2. Start the server:
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node server.js
   ```
3. Open your browser and go to: `http://localhost:3000`

## Usage

1. Pick **Used Car** or **New Car**.
2. Enter the make (a dropdown of recognized makes appears as you type) and,
   optionally, the model — if it's in the reference dataset, the estimate
   gets more precise.
3. Optionally attach a photo of the listing.
4. Fill in the rest: for a used car, year/mileage/condition/title/asking
   price; for a new car, year/MSRP/incentives/negotiated price.
5. Click "Check This Car" to see the quality score, common issues, and how
   the price compares to the estimated value. The car (and its photo, if you
   added one) is also added to the **Your Comparison** table below, so you
   can check several and compare them side by side.

## Files

- `index.html` — page structure and result rendering
- `car-styles.css` — styling
- `car-app.js` — quality score and valuation logic
- `car-data.js` — curated make/model reference data (reliability, base
  pricing, common issues)
- `server.js` — simple Node.js HTTP static file server

## Technologies

- HTML5, CSS3
- Vanilla JavaScript (ES6+)
- Node.js HTTP server (no external dependencies)

## Disclaimer

Estimates are generated from general reliability reputation and typical
depreciation trends — not live market listings, VIN-decoded data, or
manufacturer figures. Treat results as a starting point, not a substitute for
a professional inspection or a real-time valuation tool (e.g. KBB, Edmunds).
