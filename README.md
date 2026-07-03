# CarCheck — Car Quality & Value Checker

A single-page web app for checking whether a used car is worth buying: enter its
make, model, year, mileage, condition and asking price to get an estimated
quality score and see how the asking price compares to its estimated market
value.

## Features

- **Quality score (0-100)** built from brand/model reliability reputation, age,
  mileage-per-year, condition, and title status, with a letter grade and a
  breakdown of how each factor contributed.
- **Price vs. worth comparison** — estimates a market value using a
  depreciation curve plus mileage and condition adjustments, then labels the
  asking price as a Great Deal, Good Deal, Fair Price, Slightly Overpriced, or
  Overpriced.
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

1. Enter the car's make (a dropdown of recognized makes appears as you type).
2. Optionally enter the model — if it's in the reference dataset, the estimate
   gets more precise.
3. Enter year, mileage, condition, title status, and the asking price.
4. Click "Check This Car" to see the quality score, common issues, and how the
   asking price compares to the estimated value.

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
