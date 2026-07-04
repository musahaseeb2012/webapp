/* Car Quality & Value Checker — reference data
 * MSRP figures are rough 2024 US base-trim list prices used only as a
 * starting point for the depreciation model. Retention is the estimated
 * fraction of value kept per year of age (compounded), based on typical
 * resale trends for that model. None of this is live market data — see
 * the disclaimer in the UI.
 */

const CAR_DATABASE = [
    { make: 'Toyota', model: 'Corolla', category: 'sedan', msrp: 23000, retention: 0.90 },
    { make: 'Toyota', model: 'Camry', category: 'sedan', msrp: 27000, retention: 0.89 },
    { make: 'Toyota', model: 'RAV4', category: 'suv', msrp: 29000, retention: 0.90 },
    { make: 'Toyota', model: 'Highlander', category: 'suv', msrp: 39000, retention: 0.89 },
    { make: 'Toyota', model: 'Tacoma', category: 'truck', msrp: 32000, retention: 0.92 },
    { make: 'Toyota', model: 'Prius', category: 'economy', msrp: 28000, retention: 0.87 },
    { make: 'Honda', model: 'Civic', category: 'sedan', msrp: 24000, retention: 0.89 },
    { make: 'Honda', model: 'Accord', category: 'sedan', msrp: 28000, retention: 0.88 },
    { make: 'Honda', model: 'CR-V', category: 'suv', msrp: 30000, retention: 0.90 },
    { make: 'Honda', model: 'Pilot', category: 'suv', msrp: 40000, retention: 0.87 },
    { make: 'Honda', model: 'Odyssey', category: 'minivan', msrp: 38000, retention: 0.84 },
    { make: 'Ford', model: 'F-150', category: 'truck', msrp: 38000, retention: 0.90 },
    { make: 'Ford', model: 'Mustang', category: 'sports', msrp: 32000, retention: 0.85 },
    { make: 'Ford', model: 'Explorer', category: 'suv', msrp: 39000, retention: 0.85 },
    { make: 'Ford', model: 'Escape', category: 'suv', msrp: 29000, retention: 0.83 },
    { make: 'Chevrolet', model: 'Silverado', category: 'truck', msrp: 38000, retention: 0.88 },
    { make: 'Chevrolet', model: 'Malibu', category: 'sedan', msrp: 26000, retention: 0.80 },
    { make: 'Chevrolet', model: 'Equinox', category: 'suv', msrp: 28000, retention: 0.83 },
    { make: 'Chevrolet', model: 'Tahoe', category: 'suv', msrp: 58000, retention: 0.87 },
    { make: 'Nissan', model: 'Altima', category: 'sedan', msrp: 27000, retention: 0.80 },
    { make: 'Nissan', model: 'Sentra', category: 'sedan', msrp: 22000, retention: 0.81 },
    { make: 'Nissan', model: 'Rogue', category: 'suv', msrp: 29000, retention: 0.83 },
    { make: 'Hyundai', model: 'Elantra', category: 'sedan', msrp: 22000, retention: 0.82 },
    { make: 'Hyundai', model: 'Tucson', category: 'suv', msrp: 28000, retention: 0.84 },
    { make: 'Hyundai', model: 'Santa Fe', category: 'suv', msrp: 32000, retention: 0.83 },
    { make: 'Kia', model: 'Forte', category: 'sedan', msrp: 21000, retention: 0.81 },
    { make: 'Kia', model: 'Sportage', category: 'suv', msrp: 27000, retention: 0.83 },
    { make: 'Kia', model: 'Sorento', category: 'suv', msrp: 33000, retention: 0.83 },
    { make: 'Kia', model: 'Telluride', category: 'suv', msrp: 38000, retention: 0.88 },
    { make: 'Mazda', model: 'Mazda3', category: 'sedan', msrp: 24000, retention: 0.85 },
    { make: 'Mazda', model: 'CX-5', category: 'suv', msrp: 29000, retention: 0.86 },
    { make: 'Subaru', model: 'Outback', category: 'suv', msrp: 30000, retention: 0.87 },
    { make: 'Subaru', model: 'Forester', category: 'suv', msrp: 28000, retention: 0.86 },
    { make: 'Subaru', model: 'Impreza', category: 'sedan', msrp: 23000, retention: 0.84 },
    { make: 'Jeep', model: 'Wrangler', category: 'suv', msrp: 35000, retention: 0.90 },
    { make: 'Jeep', model: 'Grand Cherokee', category: 'suv', msrp: 38000, retention: 0.83 },
    { make: 'Jeep', model: 'Cherokee', category: 'suv', msrp: 30000, retention: 0.80 },
    { make: 'Tesla', model: 'Model 3', category: 'electric', msrp: 42000, retention: 0.82 },
    { make: 'Tesla', model: 'Model Y', category: 'electric', msrp: 47000, retention: 0.83 },
    { make: 'BMW', model: '3 Series', category: 'luxury', msrp: 45000, retention: 0.78 },
    { make: 'BMW', model: '5 Series', category: 'luxury', msrp: 58000, retention: 0.76 },
    { make: 'BMW', model: 'X5', category: 'luxury', msrp: 68000, retention: 0.78 },
    { make: 'Mercedes-Benz', model: 'C-Class', category: 'luxury', msrp: 46000, retention: 0.76 },
    { make: 'Mercedes-Benz', model: 'E-Class', category: 'luxury', msrp: 60000, retention: 0.75 },
    { make: 'Mercedes-Benz', model: 'GLC', category: 'luxury', msrp: 48000, retention: 0.78 },
    { make: 'Audi', model: 'A4', category: 'luxury', msrp: 43000, retention: 0.76 },
    { make: 'Audi', model: 'Q5', category: 'luxury', msrp: 46000, retention: 0.78 },
    { make: 'Volkswagen', model: 'Jetta', category: 'sedan', msrp: 22000, retention: 0.80 },
    { make: 'Volkswagen', model: 'Tiguan', category: 'suv', msrp: 28000, retention: 0.81 },
    { make: 'Chrysler', model: 'Pacifica', category: 'minivan', msrp: 37000, retention: 0.78 },
    { make: 'Dodge', model: 'Charger', category: 'sports', msrp: 33000, retention: 0.80 },
    { make: 'Ram', model: '1500', category: 'truck', msrp: 40000, retention: 0.89 },
    { make: 'GMC', model: 'Sierra', category: 'truck', msrp: 38000, retention: 0.88 },
    { make: 'Lexus', model: 'RX', category: 'luxury', msrp: 48000, retention: 0.87 },
    { make: 'Lexus', model: 'ES', category: 'luxury', msrp: 44000, retention: 0.85 },
];

// Fallback averages used when a make/model isn't in the database above.
const CATEGORY_DEFAULTS = {
    economy: { label: 'Economy car', retention: 0.85 },
    sedan: { label: 'Sedan', retention: 0.83 },
    suv: { label: 'SUV / Crossover', retention: 0.85 },
    truck: { label: 'Pickup truck', retention: 0.89 },
    minivan: { label: 'Minivan', retention: 0.80 },
    luxury: { label: 'Luxury', retention: 0.77 },
    sports: { label: 'Sports car', retention: 0.82 },
    electric: { label: 'Electric', retention: 0.82 },
};

const CONDITION_FACTORS = {
    excellent: { label: 'Excellent', value: 1.05, score: 100 },
    good: { label: 'Good', value: 1.00, score: 80 },
    fair: { label: 'Fair', value: 0.90, score: 55 },
    poor: { label: 'Poor', value: 0.75, score: 25 },
};

const ACCIDENT_FACTORS = {
    none: { label: 'No accidents', value: 1.00, score: 100 },
    minor: { label: 'Minor accident(s), repaired', value: 0.93, score: 65 },
    major: { label: 'Major accident / frame damage', value: 0.80, score: 20 },
};

const SERVICE_FACTORS = {
    full: { label: 'Full dealer/service records', value: 1.05, score: 100 },
    partial: { label: 'Partial records', value: 1.00, score: 65 },
    none: { label: 'No records / unknown', value: 0.90, score: 30 },
};

const OWNERS_FACTORS = {
    1: { label: '1 owner', value: 1.03, score: 100 },
    2: { label: '2 owners', value: 1.00, score: 75 },
    3: { label: '3+ owners', value: 0.95, score: 45 },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CAR_DATABASE,
        CATEGORY_DEFAULTS,
        CONDITION_FACTORS,
        ACCIDENT_FACTORS,
        SERVICE_FACTORS,
        OWNERS_FACTORS,
    };
}

// `const`/`let` at top level of a script don't become window properties
// (unlike `var`), so expose these explicitly for app.js to consume.
if (typeof window !== 'undefined') {
    window.CAR_DATABASE = CAR_DATABASE;
    window.CATEGORY_DEFAULTS = CATEGORY_DEFAULTS;
    window.CONDITION_FACTORS = CONDITION_FACTORS;
    window.ACCIDENT_FACTORS = ACCIDENT_FACTORS;
    window.SERVICE_FACTORS = SERVICE_FACTORS;
    window.OWNERS_FACTORS = OWNERS_FACTORS;
}
