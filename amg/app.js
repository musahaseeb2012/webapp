/* ============================================================
   AMG Configurator — unofficial demo project.
   Vanilla JS. No build step, no dependencies, no network calls.

   NOTE: every model, option, specification and price below is an
   illustrative placeholder invented for this demo.
   ============================================================ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. Vehicle data
     ──────────────────────────────────────────────────────────── */

  var MODELS = [
    {
      id: 'c63', name: 'C 63 S E PERFORMANCE', body: 'Performance sedan',
      price: 85900, silhouette: 'sedanC',
      engine: '2.0L turbo inline-4 + electric drive unit',
      trans: '9-speed multi-clutch', drive: 'Performance 4MATIC+',
      hp: 671, tq: 752, sixty: 3.3, vmax: 174, weight: 4740, wheelBase: 20
    },
    {
      id: 'e53', name: 'E 53 HYBRID 4MATIC+', body: 'Executive sedan',
      price: 89900, silhouette: 'sedanE',
      engine: '3.0L turbo inline-6 + electric drive unit',
      trans: '9-speed multi-clutch', drive: '4MATIC+',
      hp: 577, tq: 553, sixty: 3.7, vmax: 155, weight: 5170, wheelBase: 20
    },
    {
      id: 'gt63', name: 'GT 63 4MATIC+ COUPE', body: 'Grand tourer',
      price: 166900, silhouette: 'coupe',
      engine: '4.0L biturbo V8',
      trans: '9-speed multi-clutch', drive: 'Performance 4MATIC+',
      hp: 577, tq: 590, sixty: 3.1, vmax: 196, weight: 4343, wheelBase: 20
    },
    {
      id: 'sl63', name: 'SL 63 4MATIC+ ROADSTER', body: 'Roadster',
      price: 183000, silhouette: 'roadster',
      engine: '4.0L biturbo V8',
      trans: '9-speed multi-clutch', drive: 'Performance 4MATIC+',
      hp: 577, tq: 590, sixty: 3.5, vmax: 196, weight: 4266, wheelBase: 20
    },
    {
      id: 'glc63', name: 'GLC 63 S E PERFORMANCE', body: 'Performance SUV coupe',
      price: 87500, silhouette: 'suvCoupe',
      engine: '2.0L turbo inline-4 + electric drive unit',
      trans: '9-speed multi-clutch', drive: 'Performance 4MATIC+',
      hp: 671, tq: 752, sixty: 3.4, vmax: 171, weight: 5290, wheelBase: 21
    },
    {
      id: 'g63', name: 'G 63', body: 'Off-road icon',
      price: 186900, silhouette: 'boxSUV',
      engine: '4.0L biturbo V8',
      trans: '9-speed multi-clutch', drive: 'Permanent all-wheel drive',
      hp: 577, tq: 627, sixty: 4.4, vmax: 137, weight: 5820, wheelBase: 22
    }
  ];

  var PAINTS = [
    { id: 'polar',    name: 'Polar White',            finish: 'Solid',     hex: '#e9ebec', price: 0 },
    { id: 'obsidian', name: 'Obsidian Black',         finish: 'Metallic',  hex: '#15181b', price: 750 },
    { id: 'hightech', name: 'High-Tech Silver',       finish: 'Metallic',  hex: '#b9bfc4', price: 750 },
    { id: 'selenite', name: 'Selenite Grey',          finish: 'Metallic',  hex: '#767d84', price: 750 },
    { id: 'spectral', name: 'Spectral Blue',          finish: 'Metallic',  hex: '#1d3f78', price: 1150 },
    { id: 'patagonia',name: 'Patagonia Red',          finish: 'Metallic',  hex: '#8c1220', price: 1150 },
    { id: 'sun',      name: 'Sun Yellow',             finish: 'Solid',     hex: '#e8b400', price: 1750 },
    { id: 'graphite', name: 'Graphite Grey Magno',    finish: 'Matte',     hex: '#4a4f54', price: 5900, matte: true },
    { id: 'greenhell',name: 'Green Hell Magno',       finish: 'Matte',     hex: '#5a6a3a', price: 5900, matte: true },
    { id: 'opalite',  name: 'Opalite White Magno',    finish: 'Matte',     hex: '#dcdcd6', price: 5900, matte: true }
  ];

  var WHEELS = [
    { id: 'w19_5',   name: '19" 5-twin-spoke',        design: '5spoke', size: 19, face: '#c3c8cd', rim: '#9aa0a6',
      price: 0,    weight: -14, sixty: 0.03 },
    { id: 'w20_mul', name: '20" multi-spoke',         design: 'multi',  size: 20, face: '#8f959b', rim: '#767c82',
      price: 1250 },
    { id: 'w20_crs', name: '20" cross-spoke',         design: 'cross',  size: 20, face: '#2a2d31', rim: '#3a3e43',
      price: 1750 },
    { id: 'w21_frg', name: '21" forged cross-spoke',  design: 'cross',  size: 21, face: '#232629', rim: '#c9ced3',
      price: 3500, weight: 12, sixty: 0.03 },
    { id: 'w21_y',   name: '21" forged Y-spoke',      design: 'y',      size: 21, face: '#8a6a35', rim: '#6f5429',
      price: 4500, weight: 6 },
    { id: 'w21_aer', name: '21" aero disc',           design: 'aero',   size: 21, face: '#4d5257', rim: '#5b6166',
      price: 2900, vmax: 2 }
  ];

  var CALIPERS = [
    { id: 'silver',  name: 'Silver painted calipers',   color: '#b6bbc0', price: 0 },
    { id: 'black',   name: 'Black painted calipers',    color: '#1e2124', price: 400 },
    { id: 'red',     name: 'Red painted calipers',      color: '#b81f2a', price: 700 },
    { id: 'ceramic', name: 'Ceramic composite brakes',  color: '#c69a2e', price: 8950,
      meta: 'Gold calipers, larger discs', weight: -35, sixty: -0.05 }
  ];

  var EXTERIOR = [
    { id: 'night1',  name: 'Night Package',            price: 750,
      meta: 'Window surrounds, mirror caps and badging in gloss black' },
    { id: 'night2',  name: 'Night Package II',         price: 850,
      meta: 'Front splitter, side sills and diffuser trim in gloss black' },
    { id: 'carbon',  name: 'Carbon fibre exterior package', price: 4500,
      meta: 'Splitter, side skirt inserts, mirror caps, diffuser', weight: -18 },
    { id: 'aero',    name: 'AERO package',             price: 6500,
      meta: 'Fixed rear wing and front aero flics', vmax: -3, sixty: -0.02, not: ['g63'] },
    { id: 'roof',    name: 'Carbon fibre roof',        price: 3200,
      meta: 'Lowers centre of gravity', weight: -22, not: ['sl63', 'g63'] },
    { id: 'tint',    name: 'Dark privacy glass',       price: 400 }
  ];

  var INTERIORS = [
    { id: 'blk',   name: 'Black Nappa leather',        price: 0,
      base: '#1b1d20', bolster: '#111315', stitch: '#4a4f55' },
    { id: 'blkred',name: 'Black Nappa / red stitching',price: 1600,
      base: '#1b1d20', bolster: '#111315', stitch: '#c2242f' },
    { id: 'sienna',name: 'Sienna Brown Nappa',         price: 2500,
      base: '#6b3b23', bolster: '#4e2a18', stitch: '#c9a071' },
    { id: 'macch', name: 'Macchiato Beige Nappa',      price: 2500,
      base: '#c3b299', bolster: '#a7947a', stitch: '#5d4f3d' },
    { id: 'pepper',name: 'Red Pepper / Black Nappa',   price: 2500,
      base: '#8a1f24', bolster: '#141618', stitch: '#e2c9a0' },
    { id: 'micro', name: 'Performance seats, Nappa & microfibre', price: 3900,
      base: '#232629', bolster: '#0f1113', stitch: '#c2242f', meta: 'Deeper bolsters, cut-out backrests',
      weight: -28 }
  ];

  var TRIMS = [
    { id: 'piano',  name: 'Piano lacquer black',       price: 0,    color: '#0f1113', gloss: true },
    { id: 'alu',    name: 'Engine-turned aluminium',   price: 450,  color: '#a8aeb4', gloss: true },
    { id: 'wood',   name: 'Open-pore brown ash',       price: 750,  color: '#5c3a22' },
    { id: 'carbon', name: 'Carbon fibre',              price: 1750, color: '#22262a', carbon: true, weight: -6 },
    { id: 'carbonm',name: 'Matte carbon fibre',        price: 2600, color: '#1a1d20', carbon: true, weight: -6 }
  ];

  var PERFORMANCE = [
    { id: 'drivers', name: "Driver's Package",         price: 2500,
      meta: 'Raises the electronically limited top speed', vmax: 12 },
    { id: 'exhaust', name: 'Performance exhaust system', price: 1250,
      meta: 'Switchable flap control, quad tailpipes', hp: 8 },
    { id: 'rearsteer', name: 'Rear-axle steering',     price: 1800,
      meta: 'Up to 2.5° of rear steering angle' },
    { id: 'track',   name: 'Track package',            price: 3900,
      meta: 'Roll-over bar, harnesses, track cooling', weight: -55, sixty: -0.1, not: ['g63'] },
    { id: 'susp',    name: 'Adaptive coilover suspension', price: 2900,
      meta: 'Manually adjustable rebound and compression', sixty: -0.03, not: ['g63'] }
  ];

  var TECH = [
    { id: 'sound',  name: '4D surround sound system',  price: 4500, meta: '17 speakers, resonance transducers', weight: 24 },
    { id: 'hud',    name: 'Head-up display',           price: 1100, meta: 'Race mode with shift indicator' },
    { id: 'pace',   name: 'Track Pace telemetry',      price: 250,  meta: 'Lap timing and 80+ live data channels' },
    { id: 'light',  name: 'Digital projection headlamps', price: 2000 },
    { id: 'assist', name: 'Driver assistance package', price: 1950 },
    { id: 'seats',  name: 'Climate-controlled front seats', price: 1250 }
  ];

  var DESTINATION = 1150;
  var APR = 0.069, TERM = 60, DOWN = 0.10;

  var STEPS = [
    { id: 'model',       label: 'Model' },
    { id: 'paint',       label: 'Paint' },
    { id: 'wheels',      label: 'Wheels' },
    { id: 'brakes',      label: 'Brakes' },
    { id: 'exterior',    label: 'Exterior' },
    { id: 'interior',    label: 'Interior' },
    { id: 'performance', label: 'Performance' },
    { id: 'technology',  label: 'Technology' },
    { id: 'summary',     label: 'Summary' }
  ];

  /* ────────────────────────────────────────────────────────────
     2. State
     ──────────────────────────────────────────────────────────── */

  var state = defaults();
  var step = 0;
  var view = 'exterior';

  function defaults() {
    return {
      model: 'gt63', paint: 'obsidian', wheel: 'w20_crs', caliper: 'red',
      ext: ['night1'], interior: 'blk', trim: 'carbon',
      perf: ['exhaust'], tech: ['pace']
    };
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function model()    { return byId(MODELS, state.model)    || MODELS[0]; }
  function paint()    { return byId(PAINTS, state.paint)    || PAINTS[0]; }
  function wheel()    { return byId(WHEELS, state.wheel)    || WHEELS[0]; }
  function caliper()  { return byId(CALIPERS, state.caliper)|| CALIPERS[0]; }
  function interior() { return byId(INTERIORS, state.interior) || INTERIORS[0]; }
  function trim()     { return byId(TRIMS, state.trim)      || TRIMS[0]; }

  function available(opt) {
    var m = state.model;
    if (opt.only && opt.only.indexOf(m) === -1) return false;
    if (opt.not && opt.not.indexOf(m) !== -1) return false;
    return true;
  }

  function optionsOf(list) { return list.filter(available); }

  function has(group, id) { return state[group].indexOf(id) !== -1; }

  function toggle(group, id) {
    var i = state[group].indexOf(id);
    if (i === -1) state[group].push(id); else state[group].splice(i, 1);
  }

  /** Every selected option object, in display order. */
  function selectedOptions() {
    var out = [];
    if (paint().price)   out.push({ label: 'Paint', name: paint().name + ' (' + paint().finish + ')', o: paint() });
    out.push({ label: 'Wheels', name: wheel().name, o: wheel() });
    if (caliper().price) out.push({ label: 'Brakes', name: caliper().name, o: caliper() });
    EXTERIOR.filter(available).forEach(function (o) {
      if (has('ext', o.id)) out.push({ label: 'Exterior', name: o.name, o: o });
    });
    out.push({ label: 'Interior', name: interior().name, o: interior() });
    out.push({ label: 'Trim', name: trim().name, o: trim() });
    PERFORMANCE.filter(available).forEach(function (o) {
      if (has('perf', o.id)) out.push({ label: 'Performance', name: o.name, o: o });
    });
    TECH.filter(available).forEach(function (o) {
      if (has('tech', o.id)) out.push({ label: 'Technology', name: o.name, o: o });
    });
    return out;
  }

  /** Drop selections that the current model does not offer. */
  function pruneForModel() {
    ['ext', 'perf', 'tech'].forEach(function (g) {
      var src = g === 'ext' ? EXTERIOR : g === 'perf' ? PERFORMANCE : TECH;
      state[g] = state[g].filter(function (id) {
        var o = byId(src, id);
        return o && available(o);
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     3. Pricing and performance maths
     ──────────────────────────────────────────────────────────── */

  function optionsTotal() {
    return selectedOptions().reduce(function (sum, row) { return sum + (row.o.price || 0); }, 0);
  }

  function totals() {
    var base = model().price;
    var opts = optionsTotal();
    var subtotal = base + opts;
    var total = subtotal + DESTINATION;
    return { base: base, options: opts, subtotal: subtotal, destination: DESTINATION, total: total };
  }

  function monthlyPayment(total) {
    var principal = total * (1 - DOWN);
    var r = APR / 12;
    return principal * r / (1 - Math.pow(1 + r, -TERM));
  }

  function specs() {
    var m = model();
    var s = { hp: m.hp, tq: m.tq, sixty: m.sixty, vmax: m.vmax, weight: m.weight };
    selectedOptions().forEach(function (row) {
      var o = row.o;
      s.hp     += o.hp     || 0;
      s.tq     += o.tq     || 0;
      s.sixty  += o.sixty  || 0;
      s.vmax   += o.vmax   || 0;
      s.weight += o.weight || 0;
    });
    // Every 100 lb saved is worth roughly a tenth on the sprint.
    s.sixty += (s.weight - m.weight) * 0.0009;
    s.sixty = Math.max(2.4, Math.round(s.sixty * 10) / 10);
    s.vmax = Math.round(s.vmax);
    s.weight = Math.round(s.weight);
    return s;
  }

  /* ────────────────────────────────────────────────────────────
     4. Formatting helpers
     ──────────────────────────────────────────────────────────── */

  var money = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  });

  function usd(n) { return money.format(Math.round(n)); }
  function priceTag(n) { return n ? '+' + usd(n) : 'Included'; }
  function num(n) { return n.toLocaleString('en-US'); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Human-readable summary of an option's effect on the numbers. */
  function deltaText(o) {
    var bits = [];
    if (o.hp)     bits.push((o.hp > 0 ? '+' : '') + o.hp + ' hp');
    if (o.tq)     bits.push((o.tq > 0 ? '+' : '') + o.tq + ' lb-ft');
    if (o.sixty)  bits.push((o.sixty < 0 ? '−' : '+') + Math.abs(o.sixty).toFixed(2) + 's to 60');
    if (o.vmax)   bits.push((o.vmax > 0 ? '+' : '−') + Math.abs(o.vmax) + ' mph V-max');
    if (o.weight) bits.push((o.weight < 0 ? '−' : '+') + Math.abs(o.weight) + ' lb');
    return bits.join(' · ');
  }

  /* ────────────────────────────────────────────────────────────
     5. Colour utilities
     ──────────────────────────────────────────────────────────── */

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function clamp(n) { return Math.max(0, Math.min(255, Math.round(n))); }

  function mix(hex, target, amount) {
    var a = hexToRgb(hex), b = hexToRgb(target);
    return 'rgb(' + clamp(a.r + (b.r - a.r) * amount) + ',' +
                    clamp(a.g + (b.g - a.g) * amount) + ',' +
                    clamp(a.b + (b.b - a.b) * amount) + ')';
  }

  function lighten(hex, amount) { return mix(hex, '#ffffff', amount); }
  function darken(hex, amount)  { return mix(hex, '#000000', amount); }

  /* ────────────────────────────────────────────────────────────
     6. Silhouette geometry
     Coordinate space: 1000 x 420, ground line at y = 352.
     ──────────────────────────────────────────────────────────── */

  var GROUND = 352;

  var SHAPES = {
    coupe: {
      style: 'smooth', noseX: 46, tailX: 958, fx: 248, rx: 768, sill: 300,
      hoodTipY: 224, cowlX: 392, hoodY: 200, roofFX: 500, roofY: 120, roofRX: 636, roofRY: 118,
      glassBaseX: 838, deckY: 186, deckX: 906, tailY: 214, beltY: 190,
      pillars: [572], doors: [408], handles: [516], mirrorX: 452, skirt: [316, 700]
    },
    sedanC: {
      style: 'smooth', noseX: 52, tailX: 952, fx: 246, rx: 760, sill: 298,
      hoodTipY: 218, cowlX: 372, hoodY: 196, roofFX: 470, roofY: 112, roofRX: 668, roofRY: 112,
      glassBaseX: 806, deckY: 176, deckX: 898, tailY: 208, beltY: 184,
      pillars: [548, 640], doors: [392, 606], handles: [500, 690], mirrorX: 430, skirt: [310, 692]
    },
    sedanE: {
      style: 'smooth', noseX: 44, tailX: 960, fx: 236, rx: 776, sill: 296,
      hoodTipY: 214, cowlX: 368, hoodY: 190, roofFX: 468, roofY: 104, roofRX: 700, roofRY: 106,
      glassBaseX: 828, deckY: 172, deckX: 906, tailY: 202, beltY: 180,
      pillars: [556, 656], doors: [388, 618], handles: [502, 706], mirrorX: 428, skirt: [304, 706]
    },
    roadster: {
      style: 'open', noseX: 46, tailX: 956, fx: 250, rx: 766, sill: 302,
      hoodTipY: 228, cowlX: 408, hoodY: 208, roofFX: 512, roofY: 138, roofRX: 640, roofRY: 138,
      glassBaseX: 820, deckY: 196, deckX: 902, tailY: 220, beltY: 196,
      pillars: [], doors: [420], handles: [534], mirrorX: 462, skirt: [318, 700]
    },
    suvCoupe: {
      style: 'smooth', noseX: 100, tailX: 906, fx: 254, rx: 740, sill: 250,
      hoodTipY: 178, cowlX: 344, hoodY: 146, roofFX: 436, roofY: 56, roofRX: 600, roofRY: 62,
      glassBaseX: 774, deckY: 130, deckX: 848, tailY: 160, beltY: 140,
      pillars: [508, 596], doors: [366, 562], handles: [470, 646], mirrorX: 404, skirt: [306, 676]
    },
    boxSUV: {
      style: 'box', noseX: 96, tailX: 858, fx: 254, rx: 726, sill: 258,
      hoodTipY: 164, cowlX: 344, hoodY: 158, roofFX: 372, roofY: 60, roofRX: 846, roofRY: 60,
      glassBaseX: 838, deckY: 152, deckX: 850, tailY: 180, beltY: 152,
      pillars: [534, 648], doors: [372, 590], handles: [486, 694], mirrorX: 366, skirt: [300, 690]
    }
  };

  function bodyPath(s) {
    if (s.style === 'box')  return boxBody(s);
    if (s.style === 'open') return openBody(s);
    return smoothBody(s);
  }

  function smoothBody(s) {
    return [
      'M', s.noseX + 4, s.sill - 20,
      'C', s.noseX - 6, s.sill - 58, s.noseX - 4, s.hoodTipY + 48, s.noseX + 12, s.hoodTipY + 26,
      'C', s.noseX + 28, s.hoodTipY + 6, s.noseX + 46, s.hoodTipY - 2, s.noseX + 78, s.hoodTipY - 6,
      'C', s.noseX + 160, s.hoodTipY - 18, s.cowlX - 118, s.hoodY - 8, s.cowlX, s.hoodY,
      'C', s.cowlX + 34, s.hoodY - 22, s.roofFX - 60, s.roofY + 26, s.roofFX, s.roofY,
      'C', s.roofFX + 62, s.roofY - 8, s.roofRX - 58, s.roofRY - 8, s.roofRX, s.roofRY,
      'C', s.roofRX + 62, s.roofRY + 24, s.glassBaseX - 54, s.deckY - 26, s.glassBaseX, s.deckY,
      'L', s.deckX, s.deckY + 4,
      'C', s.tailX - 12, s.deckY + 10, s.tailX, s.tailY - 24, s.tailX, s.tailY,
      'L', s.tailX - 2, s.sill - 24,
      'C', s.tailX - 4, s.sill - 6, s.tailX - 18, s.sill, s.tailX - 40, s.sill,
      'L', s.noseX + 42, s.sill,
      'C', s.noseX + 20, s.sill, s.noseX + 6, s.sill - 6, s.noseX + 4, s.sill - 20,
      'Z'
    ].join(' ');
  }

  function openBody(s) {
    var tonneau = s.roofFX + 118;
    return [
      'M', s.noseX + 4, s.sill - 20,
      'C', s.noseX - 6, s.sill - 58, s.noseX - 4, s.hoodTipY + 48, s.noseX + 12, s.hoodTipY + 26,
      'C', s.noseX + 28, s.hoodTipY + 6, s.noseX + 46, s.hoodTipY - 2, s.noseX + 78, s.hoodTipY - 6,
      'C', s.noseX + 170, s.hoodTipY - 20, s.cowlX - 120, s.hoodY - 10, s.cowlX, s.hoodY,
      'C', s.cowlX + 30, s.hoodY - 24, s.roofFX - 46, s.roofY + 22, s.roofFX, s.roofY,
      'L', s.roofFX + 12, s.roofY + 8,
      'C', s.roofFX + 34, s.roofY + 16, s.roofFX + 62, s.beltY - 10, tonneau, s.beltY - 2,
      'C', tonneau + 90, s.beltY + 6, s.glassBaseX, s.deckY - 4, s.deckX, s.deckY + 2,
      'C', s.tailX - 12, s.deckY + 8, s.tailX, s.tailY - 22, s.tailX, s.tailY,
      'L', s.tailX - 2, s.sill - 24,
      'C', s.tailX - 4, s.sill - 6, s.tailX - 18, s.sill, s.tailX - 40, s.sill,
      'L', s.noseX + 42, s.sill,
      'C', s.noseX + 20, s.sill, s.noseX + 6, s.sill - 6, s.noseX + 4, s.sill - 20,
      'Z'
    ].join(' ');
  }

  function boxBody(s) {
    return [
      'M', s.noseX, s.sill - 16,
      'L', s.noseX, s.hoodTipY + 6,
      'L', s.noseX + 8, s.hoodTipY,
      'L', s.cowlX, s.hoodY,
      'L', s.cowlX + 6, s.hoodY - 2,
      'L', s.roofFX - 4, s.roofY + 6,
      'L', s.roofFX + 10, s.roofY,
      'L', s.roofRX, s.roofRY,
      'L', s.tailX - 6, s.roofRY + 4,
      'L', s.tailX, s.roofRY + 16,
      'L', s.tailX, s.sill - 16,
      'L', s.tailX - 16, s.sill,
      'L', s.noseX + 16, s.sill,
      'Z'
    ].join(' ');
  }

  function glassPath(s) {
    var wsBase = s.cowlX + 24;
    if (s.style === 'box') {
      return [
        'M', wsBase, s.beltY,
        'L', s.roofFX + 6, s.roofY + 12,
        'L', s.roofRX - 24, s.roofRY + 12,
        'L', s.glassBaseX - 30, s.beltY,
        'Z'
      ].join(' ');
    }
    return [
      'M', wsBase, s.beltY,
      'C', wsBase + 26, s.beltY - 30, s.roofFX - 42, s.roofY + 30, s.roofFX + 18, s.roofY + 14,
      'L', s.roofRX - 14, s.roofRY + 14,
      'C', s.roofRX + 44, s.roofRY + 36, s.glassBaseX - 46, s.deckY - 4, s.glassBaseX - 26, s.beltY,
      'Z'
    ].join(' ');
  }

  /* ── Wheels ─────────────────────────────────────────────────── */

  function polar(r, deg) {
    var a = deg * Math.PI / 180;
    return (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2);
  }

  /** A tapered spoke between radii r0 (inner) and r1 (outer). */
  function spoke(deg, r0, r1, w0, w1) {
    var d0 = Math.atan2(w0 / 2, r0) * 180 / Math.PI;
    var d1 = Math.atan2(w1 / 2, r1) * 180 / Math.PI;
    return 'M' + polar(r0, deg - d0) +
           'L' + polar(r1, deg - d1) +
           'A' + r1 + ' ' + r1 + ' 0 0 1 ' + polar(r1, deg + d1) +
           'L' + polar(r0, deg + d0) +
           'A' + r0 + ' ' + r0 + ' 0 0 0 ' + polar(r0, deg - d0) + 'Z';
  }

  function spokes(design, r) {
    var out = '', i, a;
    var inner = r * 0.24, outer = r * 0.94;
    if (design === '5spoke') {
      for (i = 0; i < 5; i++) out += '<path d="' + spoke(i * 72 - 90, inner, outer, r * 0.30, r * 0.34) + '"/>';
    } else if (design === 'multi') {
      for (i = 0; i < 10; i++) out += '<path d="' + spoke(i * 36 - 90, inner, outer, r * 0.15, r * 0.17) + '"/>';
    } else if (design === 'cross') {
      for (i = 0; i < 5; i++) {
        a = i * 72 - 90;
        out += '<path d="' + spoke(a - 10, inner, outer, r * 0.16, r * 0.13) + '"/>';
        out += '<path d="' + spoke(a + 10, inner, outer, r * 0.16, r * 0.13) + '"/>';
      }
    } else if (design === 'y') {
      for (i = 0; i < 5; i++) {
        a = i * 72 - 90;
        out += '<path d="' + spoke(a, inner, r * 0.58, r * 0.30, r * 0.30) + '"/>';
        out += '<path d="' + spoke(a - 14, r * 0.52, outer, r * 0.20, r * 0.20) + '"/>';
        out += '<path d="' + spoke(a + 14, r * 0.52, outer, r * 0.20, r * 0.20) + '"/>';
      }
    } else { // aero disc: solid face with slot cut-outs
      out += '<circle cx="0" cy="0" r="' + (r * 0.94).toFixed(1) + '"/>';
      for (i = 0; i < 5; i++) {
        out += '<path d="' + spoke(i * 72 - 90, r * 0.42, r * 0.86, r * 0.20, r * 0.26) + '" fill="#0d0f11"/>';
      }
    }
    return out;
  }

  function wheelGroup(cx, cy, r, w, caliperColor, idx) {
    var gid = 'rim' + idx;
    return '' +
      '<g transform="translate(' + cx + ',' + cy + ')">' +
        '<circle r="' + r + '" fill="#0f1113"/>' +
        '<circle r="' + (r * 0.995) + '" fill="none" stroke="#26292d" stroke-width="' + (r * 0.05).toFixed(1) + '"/>' +
        '<circle r="' + (r * 0.78).toFixed(1) + '" fill="url(#' + gid + ')"/>' +
        '<circle r="' + (r * 0.74).toFixed(1) + '" fill="#101215"/>' +
        // brake disc + caliper sit behind the spokes
        '<circle r="' + (r * 0.60).toFixed(1) + '" fill="#3c4045"/>' +
        '<circle r="' + (r * 0.60).toFixed(1) + '" fill="none" stroke="#55595e" stroke-width="1"/>' +
        '<path d="M' + polar(r * 0.52, 128) + 'A' + (r * 0.52).toFixed(1) + ' ' + (r * 0.52).toFixed(1) +
          ' 0 0 1 ' + polar(r * 0.52, 232) + '" fill="none" stroke="' + caliperColor +
          '" stroke-width="' + (r * 0.17).toFixed(1) + '" stroke-linecap="round"/>' +
        '<g fill="url(#' + gid + ')" stroke="rgba(0,0,0,.35)" stroke-width="0.6">' + spokes(w.design, r * 0.76) + '</g>' +
        '<circle r="' + (r * 0.15).toFixed(1) + '" fill="#1a1c1f" stroke="' + w.rim + '" stroke-width="1.2"/>' +
      '</g>';
  }

  /* ── Exterior scene ─────────────────────────────────────────── */

  function exteriorSVG(opts) {
    opts = opts || {};
    var m = opts.model || model();
    var s = SHAPES[m.silhouette];
    var p = opts.paint || paint();
    var w = opts.wheel || wheel();
    var cal = opts.caliper || caliper();
    var night = opts.night !== undefined ? opts.night : (has('ext', 'night1') || has('ext', 'night2'));
    var carbon = opts.carbon !== undefined ? opts.carbon : has('ext', 'carbon');
    var wing = opts.wing !== undefined ? opts.wing : (has('ext', 'aero') && available(byId(EXTERIOR, 'aero')));
    var croof = opts.croof !== undefined ? opts.croof : has('ext', 'roof');
    var tint = opts.tint !== undefined ? opts.tint : has('ext', 'tint');
    var quad = opts.quad !== undefined ? opts.quad : has('perf', 'exhaust');
    var uid = opts.uid || 'x';

    var r = ({ 19: 60, 20: 65, 21: 70 })[w.size] || 65;
    var wy = GROUND - r;

    var bodyTop = lighten(p.hex, p.matte ? 0.14 : 0.30);
    var bodyMid = p.hex;
    var bodyLow = darken(p.hex, p.matte ? 0.34 : 0.52);
    var chrome = night ? '#17191c' : '#c8ced4';
    var skirtFill = carbon ? 'url(#weave' + uid + ')' : darken(p.hex, 0.62);
    var glassFill = tint ? 'url(#glassDark' + uid + ')' : 'url(#glass' + uid + ')';

    var svg = [];
    svg.push('<svg viewBox="0 0 1000 420" xmlns="http://www.w3.org/2000/svg">');

    // defs
    svg.push('<defs>');
    svg.push('<linearGradient id="paint' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + bodyTop + '"/>' +
      '<stop offset="0.42" stop-color="' + bodyMid + '"/>' +
      '<stop offset="1" stop-color="' + bodyLow + '"/></linearGradient>');
    svg.push('<linearGradient id="glass' + uid + '" x1="0" y1="0" x2="0.4" y2="1">' +
      '<stop offset="0" stop-color="#3b444d"/><stop offset="1" stop-color="#171b20"/></linearGradient>');
    svg.push('<linearGradient id="glassDark' + uid + '" x1="0" y1="0" x2="0.4" y2="1">' +
      '<stop offset="0" stop-color="#1e2429"/><stop offset="1" stop-color="#0c0f12"/></linearGradient>');
    svg.push('<linearGradient id="rimF' + uid + '" x1="0" y1="0" x2="0.3" y2="1">' +
      '<stop offset="0" stop-color="' + lighten(w.face, 0.28) + '"/>' +
      '<stop offset="1" stop-color="' + darken(w.face, 0.36) + '"/></linearGradient>');
    svg.push('<linearGradient id="rimR' + uid + '" x1="0" y1="0" x2="0.3" y2="1">' +
      '<stop offset="0" stop-color="' + lighten(w.face, 0.28) + '"/>' +
      '<stop offset="1" stop-color="' + darken(w.face, 0.36) + '"/></linearGradient>');
    svg.push('<linearGradient id="head' + uid + '" x1="0" y1="0" x2="1" y2="0.4">' +
      '<stop offset="0" stop-color="#6f86a3"/><stop offset="0.55" stop-color="#dce7f4"/>' +
      '<stop offset="1" stop-color="#8ea6c2"/></linearGradient>');
    svg.push('<linearGradient id="hl' + uid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="rgba(255,255,255,0)"/>' +
      '<stop offset="0.28" stop-color="rgba(255,255,255,.20)"/>' +
      '<stop offset="0.72" stop-color="rgba(255,255,255,.16)"/>' +
      '<stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>');
    svg.push('<linearGradient id="tail' + uid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#7c1119"/><stop offset="1" stop-color="#e0303c"/></linearGradient>');
    svg.push('<pattern id="weave' + uid + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="6" height="6" fill="#131518"/>' +
      '<rect width="3" height="3" fill="#1e2226"/>' +
      '<rect x="3" y="3" width="3" height="3" fill="#1e2226"/></pattern>');
    svg.push('<clipPath id="glassClip' + uid + '"><path d="' + glassPath(s) + '"/></clipPath>');
    svg.push('<clipPath id="bodyClip' + uid + '"><path d="' + bodyPath(s) + '"/></clipPath>');
    svg.push('<radialGradient id="shadow' + uid + '" cx="0.5" cy="0.5" r="0.5">' +
      '<stop offset="0" stop-color="rgba(0,0,0,.62)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>');
    svg.push('</defs>');

    // ground shadow
    svg.push('<ellipse cx="500" cy="' + (GROUND + 8) + '" rx="430" ry="26" fill="url(#shadow' + uid + ')"/>');
    svg.push('<rect x="60" y="' + (GROUND + 1) + '" width="880" height="1" fill="rgba(255,255,255,.07)"/>');

    // spare wheel carrier on the boxy SUV's tailgate
    if (s.style === 'box') {
      var spx = s.tailX + 26, spy = s.sill - 76;
      svg.push('<rect x="' + (s.tailX - 6) + '" y="' + (spy - 8) + '" width="30" height="16" rx="4" fill="' +
        darken(p.hex, 0.3) + '"/>');
      svg.push('<circle cx="' + spx + '" cy="' + spy + '" r="50" fill="' + darken(p.hex, 0.1) +
        '" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>');
      svg.push('<circle cx="' + spx + '" cy="' + spy + '" r="37" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>');
      svg.push('<circle cx="' + spx + '" cy="' + spy + '" r="9" fill="' + darken(p.hex, 0.45) + '"/>');
    }

    // fixed rear wing sits behind the body
    if (wing) {
      var wingX = s.tailX - 208, wingY = s.deckY - 44;
      var wingFill = carbon ? 'url(#weave' + uid + ')' : darken(p.hex, 0.5);
      svg.push('<g fill="' + wingFill + '" stroke="rgba(255,255,255,.14)" stroke-width="1">' +
        '<path d="M' + wingX + ' ' + (wingY + 12) + ' L' + (wingX + 138) + ' ' + wingY +
          ' L' + (wingX + 138) + ' ' + (wingY + 13) + ' L' + wingX + ' ' + (wingY + 25) + ' Z"/>' +
        // the uprights run well into the body, which hides them below its top edge
        '<rect x="' + (wingX + 20) + '" y="' + (wingY + 16) + '" width="11" height="' + (s.sill - 50 - wingY) + '" rx="3"/>' +
        '<rect x="' + (wingX + 108) + '" y="' + (wingY + 12) + '" width="11" height="' + (s.sill - 46 - wingY) + '" rx="3"/>' +
        '</g>');
    }

    // body
    svg.push('<path d="' + bodyPath(s) + '" fill="url(#paint' + uid + ')" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>');

    svg.push('<g clip-path="url(#bodyClip' + uid + ')">');
    // shoulder highlight / character line
    if (!p.matte) {
      svg.push('<path d="M' + (s.cowlX - 40) + ' ' + (s.beltY + 30) + ' C ' + (s.cowlX + 60) + ' ' + (s.beltY + 18) +
        ' ' + (s.rx - 140) + ' ' + (s.beltY + 24) + ' ' + (s.rx + 40) + ' ' + (s.beltY + 18) +
        '" fill="none" stroke="url(#hl' + uid + ')" stroke-width="7" stroke-linecap="round"/>');
    }
    svg.push('<path d="M' + (s.noseX + 60) + ' ' + (s.beltY + 52) + ' C ' + (s.fx + 40) + ' ' + (s.beltY + 46) +
      ' ' + (s.rx - 60) + ' ' + (s.beltY + 54) + ' ' + (s.tailX - 30) + ' ' + (s.beltY + 42) +
      '" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="3"/>');
    // lower shading
    svg.push('<rect x="0" y="' + (s.sill - 34) + '" width="1000" height="40" fill="rgba(0,0,0,.20)"/>');
    // side skirt / rocker
    svg.push('<path d="M' + s.skirt[0] + ' ' + (s.sill - 20) + ' L' + s.skirt[1] + ' ' + (s.sill - 20) +
      ' L' + (s.skirt[1] - 14) + ' ' + s.sill + ' L' + (s.skirt[0] + 14) + ' ' + s.sill + ' Z" fill="' + skirtFill + '"/>');
    // front splitter + rear diffuser hint
    svg.push('<rect x="' + s.noseX + '" y="' + (s.sill - 10) + '" width="120" height="12" fill="' + skirtFill + '"/>');
    svg.push('<rect x="' + (s.tailX - 130) + '" y="' + (s.sill - 12) + '" width="130" height="14" fill="' + skirtFill + '"/>');
    svg.push('</g>');

    // carbon roof
    if (croof && s.style !== 'open') {
      svg.push('<path d="M' + (s.roofFX + 6) + ' ' + (s.roofY + 4) + ' L' + (s.roofRX - 4) + ' ' + (s.roofRY + 4) +
        ' L' + (s.roofRX - 10) + ' ' + (s.roofRY + 15) + ' L' + (s.roofFX + 16) + ' ' + (s.roofY + 15) +
        ' Z" fill="url(#weave' + uid + ')"/>');
    }

    // glass + pillars
    if (s.style === 'open') {
      // open cockpit: dark interior recess behind the windscreen
      svg.push('<path d="M' + (s.cowlX + 26) + ' ' + s.beltY + ' C' + (s.cowlX + 46) + ' ' + (s.beltY - 34) +
        ' ' + (s.roofFX - 30) + ' ' + (s.roofY + 22) + ' ' + s.roofFX + ' ' + (s.roofY + 4) +
        ' L' + (s.roofFX + 12) + ' ' + (s.roofY + 12) +
        ' C' + (s.roofFX + 30) + ' ' + (s.roofY + 26) + ' ' + (s.roofFX + 60) + ' ' + (s.beltY - 6) + ' ' +
        (s.roofFX + 118) + ' ' + s.beltY + ' Z" fill="#0e1114"/>');
      svg.push('<path d="M' + (s.cowlX + 30) + ' ' + (s.beltY - 4) + ' C' + (s.cowlX + 50) + ' ' + (s.beltY - 36) +
        ' ' + (s.roofFX - 28) + ' ' + (s.roofY + 24) + ' ' + (s.roofFX - 2) + ' ' + (s.roofY + 8) +
        '" fill="none" stroke="' + glassFill.replace('url(#', '').replace(')', '') + '" stroke-width="0"/>');
      // windscreen glass
      svg.push('<path d="M' + (s.cowlX + 34) + ' ' + (s.beltY - 6) + ' C' + (s.cowlX + 54) + ' ' + (s.beltY - 38) +
        ' ' + (s.roofFX - 26) + ' ' + (s.roofY + 26) + ' ' + (s.roofFX - 4) + ' ' + (s.roofY + 10) +
        ' L' + (s.roofFX + 6) + ' ' + (s.roofY + 20) + ' C' + (s.roofFX - 30) + ' ' + (s.roofY + 40) +
        ' ' + (s.cowlX + 66) + ' ' + (s.beltY - 26) + ' ' + (s.cowlX + 46) + ' ' + (s.beltY - 2) +
        ' Z" fill="' + (tint ? '#141a1f' : '#2c343c') + '"/>');
      // head restraint humps in the rear deck
      svg.push('<g fill="' + darken(p.hex, 0.16) + '" stroke="rgba(0,0,0,.30)" stroke-width="1">' +
        '<path d="M' + (s.roofFX + 58) + ' ' + (s.beltY + 2) + ' q4 -20 30 -20 q26 0 30 20 z"/>' +
        '<path d="M' + (s.roofFX + 6) + ' ' + (s.beltY + 4) + ' q4 -18 27 -18 q23 0 27 18 z"/></g>');
    } else {
      svg.push('<g clip-path="url(#glassClip' + uid + ')">');
      svg.push('<path d="' + glassPath(s) + '" fill="' + glassFill + '"/>');
      svg.push('<path d="M' + (s.cowlX - 20) + ' ' + (s.beltY + 20) + ' L' + (s.roofFX + 90) + ' ' + (s.roofY - 20) +
        ' L' + (s.roofFX + 150) + ' ' + (s.roofY - 20) + ' L' + (s.cowlX + 40) + ' ' + (s.beltY + 20) +
        ' Z" fill="rgba(255,255,255,.07)"/>');
      s.pillars.forEach(function (px) {
        svg.push('<path d="M' + px + ' ' + (s.beltY + 6) + ' L' + (px + 12) + ' ' + (s.beltY + 6) +
          ' L' + (px + 22) + ' ' + (s.roofY - 6) + ' L' + (px + 10) + ' ' + (s.roofY - 6) +
          ' Z" fill="' + (night ? '#101214' : darken(p.hex, 0.45)) + '"/>');
      });
      svg.push('</g>');
      svg.push('<path d="' + glassPath(s) + '" fill="none" stroke="' + chrome + '" stroke-width="2.4"/>');
    }

    // door shut lines + handles
    svg.push('<g stroke="rgba(0,0,0,.4)" stroke-width="1.6" fill="none">');
    s.doors.forEach(function (dx) {
      svg.push('<path d="M' + dx + ' ' + (s.beltY + 4) + ' L' + (dx - 8) + ' ' + (s.sill - 16) + '"/>');
    });
    svg.push('</g>');
    svg.push('<g fill="' + chrome + '">');
    s.handles.forEach(function (hx) {
      svg.push('<rect x="' + hx + '" y="' + (s.beltY + 22) + '" width="38" height="7" rx="3.5"/>');
    });
    svg.push('</g>');

    // mirror
    svg.push('<path d="M' + s.mirrorX + ' ' + (s.beltY + 2) + ' l30 -4 l10 12 l-32 4 z" fill="' +
      (night || carbon ? '#16181b' : darken(p.hex, 0.2)) + '"/>');

    // lights — clipped to the body so they follow the nose and tail
    svg.push('<g clip-path="url(#bodyClip' + uid + ')">');
    if (s.style === 'box') {
      // round lamps and a vertical tail lamp for the boxy SUV
      svg.push('<circle cx="' + (s.noseX + 30) + '" cy="' + (s.hoodTipY + 34) + '" r="19" fill="url(#head' + uid + ')"/>');
      svg.push('<circle cx="' + (s.noseX + 30) + '" cy="' + (s.hoodTipY + 34) + '" r="19" fill="none" stroke="' + chrome + '" stroke-width="2.5"/>');
      svg.push('<rect x="' + (s.tailX - 26) + '" y="' + (s.deckY + 32) + '" width="26" height="58" rx="6" fill="url(#tail' + uid + ')"/>');
    } else {
      var hx0 = s.noseX + 48, hy0 = s.hoodTipY + 26;
      svg.push('<path d="M' + hx0 + ' ' + hy0 + ' L' + (hx0 + 62) + ' ' + (hy0 - 13) +
        ' L' + (hx0 + 67) + ' ' + (hy0 - 1) + ' L' + (hx0 + 4) + ' ' + (hy0 + 13) +
        ' Z" fill="url(#head' + uid + ')"/>');
      svg.push('<path d="M' + (hx0 - 8) + ' ' + (hy0 + 6) + ' L' + (hx0 + 58) + ' ' + (hy0 - 10) +
        ' L' + (hx0 + 59) + ' ' + (hy0 - 6) + ' L' + (hx0 - 7) + ' ' + (hy0 + 10) +
        ' Z" fill="rgba(226,240,255,.6)"/>');
      svg.push('<path d="M' + (s.tailX - 92) + ' ' + (s.deckY + 20) + ' L' + (s.tailX + 8) + ' ' + (s.deckY + 10) +
        ' L' + (s.tailX + 8) + ' ' + (s.deckY + 38) + ' L' + (s.tailX - 88) + ' ' + (s.deckY + 44) +
        ' Z" fill="url(#tail' + uid + ')"/>');
    }
    svg.push('</g>');

    // exhaust tips, clipped so they sit in the rear valance rather than float
    var ex = s.tailX - 168, ey = s.sill - 16;
    svg.push('<g fill="#9aa0a6" clip-path="url(#bodyClip' + uid + ')">');
    if (quad) {
      svg.push('<rect x="' + ex + '" y="' + ey + '" width="30" height="13" rx="6"/>');
      svg.push('<rect x="' + (ex + 38) + '" y="' + ey + '" width="30" height="13" rx="6"/>');
      svg.push('<rect x="' + (ex + 4) + '" y="' + (ey + 3) + '" width="22" height="7" rx="3" fill="#15181b"/>');
      svg.push('<rect x="' + (ex + 42) + '" y="' + (ey + 3) + '" width="22" height="7" rx="3" fill="#15181b"/>');
    } else {
      svg.push('<rect x="' + ex + '" y="' + ey + '" width="68" height="13" rx="6"/>');
      svg.push('<rect x="' + (ex + 5) + '" y="' + (ey + 3) + '" width="58" height="7" rx="3" fill="#15181b"/>');
    }
    svg.push('</g>');

    // wheel arches (drawn over the body so they read as cut-outs)
    [[s.fx, 'F'], [s.rx, 'R']].forEach(function (pair) {
      var ax = pair[0];
      svg.push('<path d="M' + (ax - r - 12) + ' ' + (GROUND) + ' A' + (r + 12) + ' ' + (r + 12) +
        ' 0 0 1 ' + (ax + r + 12) + ' ' + GROUND + ' Z" fill="#0a0c0e"/>');
    });

    svg.push(wheelGroup(s.fx, wy, r, w, cal.color, 'F' + uid));
    svg.push(wheelGroup(s.rx, wy, r, w, cal.color, 'R' + uid));

    svg.push('</svg>');
    return svg.join('');
  }

  /* ── Interior scene ─────────────────────────────────────────── */

  /**
   * Front view of a performance bucket seat: one-piece shell with a cut-out
   * head restraint, quilted centre panel and a separate cushion.
   */
  function seat(cx, top, w, h, t, id) {
    var half = w / 2, out = [];
    var hrW = w * 0.30;
    var shoulderY = top + h * 0.30;
    var backBottom = top + h * 0.74;
    var panelW = w * 0.46;
    var f = function (n) { return n.toFixed(1); };

    // shell
    out.push('<path d="' + [
      'M', f(cx - hrW), f(top + 16),
      'Q', f(cx - hrW), f(top), f(cx - hrW + 16), f(top),
      'L', f(cx + hrW - 16), f(top),
      'Q', f(cx + hrW), f(top), f(cx + hrW), f(top + 16),
      'L', f(cx + hrW), f(top + h * 0.16),
      'Q', f(cx + half), f(top + h * 0.18), f(cx + half), f(shoulderY),
      'L', f(cx + half), f(backBottom - 14),
      'Q', f(cx + half), f(backBottom), f(cx + half - 16), f(backBottom),
      'L', f(cx - half + 16), f(backBottom),
      'Q', f(cx - half), f(backBottom), f(cx - half), f(backBottom - 14),
      'L', f(cx - half), f(shoulderY),
      'Q', f(cx - half), f(top + h * 0.18), f(cx - hrW), f(top + h * 0.16),
      'Z'
    ].join(' ') + '" fill="url(#seatG' + id + ')" stroke="rgba(0,0,0,.42)" stroke-width="1.2"/>');

    // head restraint cut-out
    out.push('<path d="M' + f(cx - hrW * 0.62) + ' ' + f(top + h * 0.145) + ' h' + f(hrW * 1.24) +
      ' v9 q0 6 -8 6 h-' + f(hrW * 1.24 - 16) + ' q-8 0 -8 -6 z" fill="#08090b" opacity=".8"/>');

    // quilted centre panel
    out.push('<path d="M' + f(cx - panelW / 2) + ' ' + f(top + h * 0.26) + ' h' + f(panelW) +
      ' v' + f(h * 0.42) + ' q0 10 -12 10 h-' + f(panelW - 24) + ' q-12 0 -12 -10 z" fill="' +
      t.base + '" stroke="' + t.stitch + '" stroke-width="1.2"/>');
    for (var i = 1; i <= 4; i++) {
      out.push('<path d="M' + f(cx - panelW / 2 + 5) + ' ' + f(top + h * 0.26 + (h * 0.42) * (i / 5)) +
        ' h' + f(panelW - 10) + '" stroke="' + t.stitch +
        '" stroke-width="1.3" stroke-dasharray="6 6" fill="none" opacity=".8"/>');
    }

    // bolster seams and a soft top light
    out.push('<path d="M' + f(cx - half + 13) + ' ' + f(shoulderY) + ' V' + f(backBottom - 12) +
      ' M' + f(cx + half - 13) + ' ' + f(shoulderY) + ' V' + f(backBottom - 12) +
      '" stroke="rgba(0,0,0,.28)" stroke-width="1.4" fill="none"/>');
    out.push('<path d="M' + f(cx - hrW + 7) + ' ' + f(top + 8) + ' h' + f(hrW * 2 - 14) +
      '" stroke="rgba(255,255,255,.14)" stroke-width="3" fill="none" stroke-linecap="round"/>');

    // cushion
    out.push('<path d="M' + f(cx - half * 0.94) + ' ' + f(backBottom + 5) + ' h' + f(w * 0.94) +
      ' q15 0 15 15 v' + f(h * 0.09) + ' q0 12 -16 12 h-' + f(w * 0.94 - 2) +
      ' q-16 0 -16 -12 v-' + f(h * 0.09) + ' q0 -15 15 -15 z" fill="url(#seatG' + id +
      ')" stroke="rgba(0,0,0,.42)" stroke-width="1.2"/>');
    out.push('<rect x="' + f(cx - panelW / 2) + '" y="' + f(backBottom + 13) + '" width="' + f(panelW) +
      '" height="' + f(h * 0.10) + '" rx="4" fill="' + t.base + '" stroke="' + t.stitch + '" stroke-width="1.1"/>');

    return out.join('');
  }

  function interiorSVG() {
    var t = interior(), tr = trim(), m = model();
    var trimFill = tr.carbon ? 'url(#weaveI)' : tr.color;
    var svg = [];
    svg.push('<svg viewBox="0 0 1000 420" xmlns="http://www.w3.org/2000/svg">');

    svg.push('<defs>');
    svg.push('<pattern id="weaveI" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="6" height="6" fill="#131518"/><rect width="3" height="3" fill="#222629"/>' +
      '<rect x="3" y="3" width="3" height="3" fill="#222629"/></pattern>');
    svg.push('<linearGradient id="cabin" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + darken(t.base, 0.55) + '"/>' +
      '<stop offset="1" stop-color="#08090b"/></linearGradient>');
    svg.push('<linearGradient id="dashG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + darken(t.base, 0.18) + '"/>' +
      '<stop offset="1" stop-color="' + darken(t.base, 0.62) + '"/></linearGradient>');
    svg.push('<linearGradient id="seatG1" x1="0" y1="0" x2="0.15" y2="1">' +
      '<stop offset="0" stop-color="' + lighten(t.bolster, 0.20) + '"/>' +
      '<stop offset="0.55" stop-color="' + t.bolster + '"/>' +
      '<stop offset="1" stop-color="' + darken(t.bolster, 0.35) + '"/></linearGradient>');
    svg.push('<linearGradient id="seatG2" x1="0" y1="0" x2="0.15" y2="1">' +
      '<stop offset="0" stop-color="' + lighten(t.bolster, 0.20) + '"/>' +
      '<stop offset="0.55" stop-color="' + t.bolster + '"/>' +
      '<stop offset="1" stop-color="' + darken(t.bolster, 0.35) + '"/></linearGradient>');
    svg.push('<linearGradient id="screen" x1="0" y1="0" x2="0.6" y2="1">' +
      '<stop offset="0" stop-color="#1c2c3b"/><stop offset="1" stop-color="#0a0e13"/></linearGradient>');
    svg.push('<radialGradient id="cabinLight" cx="0.5" cy="0.1" r="0.8">' +
      '<stop offset="0" stop-color="rgba(255,255,255,.10)"/>' +
      '<stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>');
    svg.push('</defs>');

    svg.push('<rect width="1000" height="420" fill="url(#cabin)"/>');
    svg.push('<rect width="1000" height="420" fill="url(#cabinLight)"/>');

    // dashboard
    svg.push('<path d="M26 18 h948 q26 0 26 26 v72 q0 20 -26 20 h-948 q-26 0 -26 -20 v-72 q0 -26 26 -26 z" fill="url(#dashG)"/>');
    svg.push('<rect x="40" y="112" width="920" height="24" rx="11" fill="' + trimFill + '"/>');
    if (tr.gloss) svg.push('<rect x="46" y="115" width="908" height="7" rx="4" fill="rgba(255,255,255,.16)"/>');
    svg.push('<rect x="40" y="136" width="920" height="8" rx="4" fill="rgba(0,0,0,.35)"/>');

    // instrument cluster + centre display
    svg.push('<rect x="86" y="34" width="298" height="70" rx="12" fill="url(#screen)" stroke="rgba(255,255,255,.06)"/>');
    svg.push('<rect x="404" y="30" width="326" height="76" rx="12" fill="url(#screen)" stroke="rgba(255,255,255,.06)"/>');
    svg.push('<text x="104" y="66" fill="#9dc4e4" font-family="Helvetica,Arial" font-size="17" letter-spacing="3">' +
      esc(m.name.split(' ').slice(0, 2).join(' ')) + '</text>');
    svg.push('<text x="104" y="92" fill="#5f7f9c" font-family="Helvetica,Arial" font-size="14" letter-spacing="4">RACE MODE</text>');
    svg.push('<text x="424" y="62" fill="#8fb0cc" font-family="Helvetica,Arial" font-size="15" letter-spacing="2">' +
      (has('tech', 'pace') ? 'TRACK PACE · LAP 3 · 1:42.8' : 'NAVIGATION · MEDIA') + '</text>');
    svg.push('<text x="424" y="90" fill="#4e6b85" font-family="Helvetica,Arial" font-size="13" letter-spacing="2">' +
      esc(trim().name) + '</text>');

    // turbine vents
    [790, 858, 926].forEach(function (vx) {
      svg.push('<circle cx="' + vx + '" cy="70" r="27" fill="#0d0f12" stroke="' + trimFill + '" stroke-width="5"/>');
      svg.push('<circle cx="' + vx + '" cy="70" r="11" fill="#1b1f23"/>');
      svg.push('<circle cx="' + (vx - 8) + '" cy="62" r="4" fill="rgba(255,255,255,.10)"/>');
    });

    // steering wheel, flat-bottomed, overlapping the dash
    svg.push('<g transform="translate(236,258)">' +
      '<path d="M-94 0 A94 94 0 1 1 -94 26 L-52 46 A70 70 0 0 0 52 46 L94 26 A94 94 0 0 1 94 0" ' +
        'fill="none" stroke="' + darken(t.bolster, 0.25) + '" stroke-width="21" stroke-linecap="round"/>' +
      '<path d="M-94 0 A94 94 0 0 1 94 0" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="5"/>' +
      '<rect x="-78" y="-9" width="156" height="19" rx="9" fill="' + darken(t.bolster, 0.3) + '"/>' +
      '<rect x="-16" y="0" width="32" height="52" rx="8" fill="' + darken(t.bolster, 0.3) + '"/>' +
      '<circle r="25" fill="' + trimFill + '" stroke="rgba(0,0,0,.4)"/>' +
      '<rect x="-64" y="-6" width="46" height="13" rx="6" fill="' + t.base + '"/>' +
      '<rect x="18" y="-6" width="46" height="13" rx="6" fill="' + t.stitch + '"/>' +
      '<path d="M-7 -94 h14 l-2 -16 h-10 z" fill="' + t.stitch + '"/>' +
      '</g>');

    // seats and console
    svg.push(seat(614, 150, 148, 232, t, '1'));
    svg.push(seat(852, 150, 148, 232, t, '2'));
    svg.push('<path d="M700 236 h64 q10 0 10 12 v160 h-84 v-160 q0 -12 10 -12 z" fill="' + trimFill +
      '" stroke="rgba(0,0,0,.4)"/>');
    svg.push('<rect x="708" y="252" width="48" height="15" rx="7" fill="#0e1013"/>');
    svg.push('<circle cx="732" cy="300" r="15" fill="' + darken(t.bolster, 0.2) + '" stroke="rgba(255,255,255,.12)"/>');
    svg.push('<rect x="716" y="330" width="32" height="42" rx="8" fill="' + t.base + '" stroke="' + t.stitch + '" stroke-width="1"/>');

    // door card at the left edge for depth
    svg.push('<path d="M0 168 h96 q10 0 10 12 v240 h-106 z" fill="' + darken(t.bolster, 0.15) + '"/>');
    svg.push('<rect x="8" y="196" width="92" height="18" rx="9" fill="' + trimFill + '"/>');
    svg.push('<rect x="14" y="236" width="74" height="12" rx="6" fill="' + t.stitch + '" opacity=".55"/>');

    svg.push('</svg>');
    return svg.join('');
  }

  /* ────────────────────────────────────────────────────────────
     7. Rendering the UI
     ──────────────────────────────────────────────────────────── */

  var $ = function (sel) { return document.querySelector(sel); };

  function renderSteps() {
    $('#steps').innerHTML = STEPS.map(function (s, i) {
      return '<button type="button" class="step' + (i === step ? ' is-active' : '') + '" data-step="' + i +
        '"><span class="step__idx">' + String(i + 1).padStart(2, '0') + '</span>' + esc(s.label) + '</button>';
    }).join('');
  }

  function renderPreview() {
    $('#preview').innerHTML = view === 'interior' ? interiorSVG() : exteriorSVG();
    var caption = view === 'interior'
      ? interior().name + ' · ' + trim().name
      : paint().name + ' ' + paint().finish + ' · ' + wheel().name;
    $('#canvasCaption').textContent = caption;
  }

  function renderHeader() {
    var m = model(), s = specs();
    $('#modelName').textContent = 'AMG ' + m.name;
    $('#modelSub').textContent = m.body + ' · ' + m.engine + ' · ' + m.drive;

    var cells = [
      { k: 'Output',    v: num(s.hp),   u: 'hp',    base: m.hp },
      { k: 'Torque',    v: num(s.tq),   u: 'lb-ft', base: m.tq },
      { k: '0–60 mph', v: s.sixty.toFixed(1), u: 'sec', base: m.sixty, invert: true },
      { k: 'Top speed', v: num(s.vmax), u: 'mph',   base: m.vmax },
      { k: 'Weight',    v: num(s.weight), u: 'lb',  base: m.weight, invert: true }
    ];
    $('#specs').innerHTML = cells.map(function (c) {
      var raw = parseFloat(String(c.v).replace(/,/g, ''));
      var better = c.invert ? raw < c.base : raw > c.base;
      return '<div class="specs__cell' + (better ? ' is-boosted' : '') + '"><dt>' + c.k +
        '</dt><dd>' + c.v + '<span>' + c.u + '</span></dd></div>';
    }).join('');
  }

  function renderPrice() {
    var t = totals();
    $('#grandTotal').textContent = usd(t.total);
    $('#monthly').innerHTML = 'Est. ' + usd(monthlyPayment(t.total)) + '/mo' +
      '<span class="fine-more"> · ' + TERM + ' mo, ' + (DOWN * 100) + '% down, ' +
      (APR * 100).toFixed(1) + '% APR · illustrative only</span>';
  }

  /* ── Option card builders ───────────────────────────────────── */

  function card(o, selected, extra) {
    var delta = deltaText(o);
    return '<button type="button" class="opt' + (selected ? ' is-selected' : '') + '" ' + (extra || '') + '>' +
      '<span class="opt__body"><span class="opt__name">' + esc(o.name) + '</span>' +
      (o.meta ? '<span class="opt__meta">' + esc(o.meta) + '</span>' : '') +
      (delta ? '<span class="delta">' + delta + '</span>' : '') +
      '</span>' +
      '<span class="opt__price' + (o.price ? '' : ' is-free') + '">' + priceTag(o.price) + '</span>' +
      '</button>';
  }

  function multiCard(group, o) {
    var on = has(group, o.id), delta = deltaText(o);
    return '<button type="button" class="opt' + (on ? ' is-selected' : '') +
      '" data-group="' + group + '" data-id="' + o.id + '" aria-pressed="' + on + '">' +
      '<span class="opt__check">✓</span>' +
      '<span class="opt__body"><span class="opt__name">' + esc(o.name) + '</span>' +
      (o.meta ? '<span class="opt__meta">' + esc(o.meta) + '</span>' : '') +
      (delta ? '<span class="delta">' + delta + '</span>' : '') +
      '</span>' +
      '<span class="opt__price' + (o.price ? '' : ' is-free') + '">' + priceTag(o.price) + '</span>' +
      '</button>';
  }

  function head(title, hint) {
    return '<div class="section__head"><h2 class="section__title">' + esc(title) + '</h2>' +
      (hint ? '<p class="section__hint">' + esc(hint) + '</p>' : '') + '</div>';
  }

  function renderStep() {
    var id = STEPS[step].id, html = '';

    if (id === 'model') {
      html = head('Choose your AMG', 'Six starting points. Everything after this adapts to what you pick.') +
        '<div class="opts opts--2">' + MODELS.map(function (m) {
          var art = exteriorSVG({
            model: m, paint: byId(PAINTS, 'selenite'), wheel: byId(WHEELS, 'w20_crs'),
            caliper: byId(CALIPERS, 'silver'), night: true, carbon: false, wing: false,
            croof: false, tint: false, quad: true, uid: 'm' + m.id
          });
          return '<button type="button" class="opt opt--model' + (state.model === m.id ? ' is-selected' : '') +
            '" data-set="model" data-id="' + m.id + '">' +
            '<span class="modelart">' + art + '</span>' +
            '<span class="opt__info">' +
              '<span class="opt__name">AMG ' + esc(m.name) + '</span>' +
              '<span class="opt__meta">' + esc(m.body) + ' · ' + esc(m.engine) + '</span>' +
              '<span class="modelstats">' +
                '<span><strong>' + num(m.hp) + '</strong> hp</span>' +
                '<span><strong>' + m.sixty.toFixed(1) + '</strong> s 0–60</span>' +
                '<span><strong>' + num(m.vmax) + '</strong> mph</span>' +
                '<span><strong>' + usd(m.price) + '</strong> base</span>' +
              '</span>' +
            '</span></button>';
        }).join('') + '</div>';

    } else if (id === 'paint') {
      html = head('Exterior paint', 'MAGNO finishes are matte and hand-applied.') +
        '<div class="opts opts--swatch">' + PAINTS.map(function (p) {
          var g = p.matte
            ? 'linear-gradient(160deg,' + lighten(p.hex, .10) + ',' + p.hex + ' 55%,' + darken(p.hex, .18) + ')'
            : 'linear-gradient(160deg,' + lighten(p.hex, .42) + ',' + p.hex + ' 46%,' + darken(p.hex, .45) + ')';
          return '<button type="button" class="opt opt--swatch' + (state.paint === p.id ? ' is-selected' : '') +
            '" data-set="paint" data-id="' + p.id + '">' +
            '<span class="chip' + (p.matte ? ' chip--matte' : '') + '" style="background:' + g + '"></span>' +
            '<span class="opt__name">' + esc(p.name) + '</span>' +
            '<span class="opt__row"><span class="opt__meta">' + esc(p.finish) + '</span>' +
            '<span class="opt__price' + (p.price ? '' : ' is-free') + '">' + priceTag(p.price) + '</span></span>' +
            '</button>';
        }).join('') + '</div>';

    } else if (id === 'wheels') {
      html = head('Wheels', 'Wheel diameter changes unsprung mass — the numbers above move with it.') +
        '<div class="opts opts--swatch">' + WHEELS.map(function (w) {
          var art = '<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><linearGradient id="sw' + w.id + '" x1="0" y1="0" x2="0.3" y2="1">' +
            '<stop offset="0" stop-color="' + lighten(w.face, .3) + '"/>' +
            '<stop offset="1" stop-color="' + darken(w.face, .35) + '"/></linearGradient></defs>' +
            '<circle r="46" fill="#0f1113"/><circle r="36" fill="#141619"/>' +
            '<circle r="28" fill="#3c4045"/>' +
            '<g fill="url(#sw' + w.id + ')" stroke="rgba(0,0,0,.35)" stroke-width="0.5">' +
            spokes(w.design, 36) + '</g>' +
            '<circle r="6" fill="#1a1c1f" stroke="' + w.rim + '"/></svg>';
          return '<button type="button" class="opt opt--swatch' + (state.wheel === w.id ? ' is-selected' : '') +
            '" data-set="wheel" data-id="' + w.id + '">' +
            '<span class="chip-wheel">' + art + '</span>' +
            '<span class="opt__name">' + esc(w.name) + '</span>' +
            '<span class="opt__row"><span class="opt__meta">' + w.size + '-inch</span>' +
            '<span class="opt__price' + (w.price ? '' : ' is-free') + '">' + priceTag(w.price) + '</span></span>' +
            (deltaText(w) ? '<span class="delta">' + deltaText(w) + '</span>' : '') +
            '</button>';
        }).join('') + '</div>';

    } else if (id === 'brakes') {
      html = head('Brakes', 'Ceramic composite discs shed unsprung weight and resist fade.') +
        '<div class="opts">' + CALIPERS.map(function (c) {
          return card(c, state.caliper === c.id, 'data-set="caliper" data-id="' + c.id + '"');
        }).join('') + '</div>' +
        '<p class="note">Caliper colour shows in the preview — switch to the exterior view to see it through the spokes.</p>';

    } else if (id === 'exterior') {
      html = head('Exterior packages', 'Combine as many as you like.') +
        '<div class="opts">' + optionsOf(EXTERIOR).map(function (o) {
          return multiCard('ext', o);
        }).join('') + '</div>';
      if (EXTERIOR.some(function (o) { return !available(o); })) {
        html += '<p class="note">Some packages are not offered on the ' + esc(model().name) + '.</p>';
      }

    } else if (id === 'interior') {
      html = head('Upholstery', 'Leather, stitching and seat shape.') +
        '<div class="opts">' + INTERIORS.map(function (o) {
          var swatch = '<span class="opt__check" style="border-color:transparent;background:' + o.base +
            ';box-shadow:inset 0 0 0 2px ' + o.stitch + '"></span>';
          var on = state.interior === o.id;
          return '<button type="button" class="opt' + (on ? ' is-selected' : '') +
            '" data-set="interior" data-id="' + o.id + '">' + swatch +
            '<span class="opt__body"><span class="opt__name">' + esc(o.name) + '</span>' +
            (o.meta ? '<span class="opt__meta">' + esc(o.meta) + '</span>' : '') +
            (deltaText(o) ? '<span class="delta">' + deltaText(o) + '</span>' : '') + '</span>' +
            '<span class="opt__price' + (o.price ? '' : ' is-free') + '">' + priceTag(o.price) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="group"><h3 class="group__title">Interior trim</h3><div class="opts">' +
        TRIMS.map(function (o) {
          return card(o, state.trim === o.id, 'data-set="trim" data-id="' + o.id + '"');
        }).join('') + '</div></div>' +
        '<p class="note">Switch the preview above to <strong>Interior</strong> to see the cabin.</p>';

    } else if (id === 'performance') {
      html = head('Performance', 'These options move the numbers in the spec strip.') +
        '<div class="opts">' + optionsOf(PERFORMANCE).map(function (o) {
          return multiCard('perf', o);
        }).join('') + '</div>';

    } else if (id === 'technology') {
      html = head('Technology & comfort', 'Cabin equipment and driver aids.') +
        '<div class="opts">' + optionsOf(TECH).map(function (o) {
          return multiCard('tech', o);
        }).join('') + '</div>';

    } else {
      html = renderSummary();
    }

    $('#stepBody').innerHTML = html;
    $('#stepBody').scrollTop = 0;
  }

  function renderSummary() {
    var m = model(), t = totals(), s = specs();
    var rows = selectedOptions().map(function (row) {
      return '<div class="sum__row"><span>' + esc(row.label) + ' — ' + esc(row.name) + '</span><strong>' +
        (row.o.price ? usd(row.o.price) : 'Incl.') + '</strong></div>';
    }).join('');

    var html =
      head('Your build', 'Everything you have selected, priced out.') +
      '<div class="sum">' +
        '<div class="sum__row sum__row--head"><span>Vehicle</span><span></span></div>' +
        '<div class="sum__row"><span>AMG ' + esc(m.name) + ' — ' + esc(m.engine) + '</span><strong>' +
          usd(m.price) + '</strong></div>' +
        '<div class="sum__row sum__row--head"><span>Options &amp; packages</span><span></span></div>' +
        (rows || '<div class="sum__row"><span>No extra-cost options selected</span><strong>' + usd(0) + '</strong></div>') +
        '<div class="sum__row sum__row--head"><span>Totals</span><span></span></div>' +
        '<div class="sum__row"><span>Options subtotal</span><strong>' + usd(t.options) + '</strong></div>' +
        '<div class="sum__row"><span>Destination &amp; delivery</span><strong>' + usd(t.destination) + '</strong></div>' +
        '<div class="sum__row sum__row--total"><span>Total as configured</span><strong>' + usd(t.total) + '</strong></div>' +
      '</div>' +
      '<div class="group"><h3 class="group__title">As configured</h3><div class="sum">' +
        '<div class="sum__row"><span>Output</span><strong>' + num(s.hp) + ' hp / ' + num(s.tq) + ' lb-ft</strong></div>' +
        '<div class="sum__row"><span>0–60 mph</span><strong>' + s.sixty.toFixed(1) + ' sec</strong></div>' +
        '<div class="sum__row"><span>Top speed</span><strong>' + num(s.vmax) + ' mph</strong></div>' +
        '<div class="sum__row"><span>Curb weight</span><strong>' + num(s.weight) + ' lb</strong></div>' +
        '<div class="sum__row"><span>Transmission</span><strong>' + esc(m.trans) + '</strong></div>' +
        '<div class="sum__row"><span>Drivetrain</span><strong>' + esc(m.drive) + '</strong></div>' +
      '</div></div>' +
      '<div class="group"><h3 class="group__title">Saved builds</h3>' +
        '<div class="saved" id="savedList"></div></div>' +
      '<p class="note">Prices, specifications and equipment on this page are invented for a demo and are not a real offer.</p>';
    return html;
  }

  function renderSaved() {
    var host = $('#savedList');
    if (!host) return;
    var list = loadBuilds();
    if (!list.length) {
      host.innerHTML = '<p class="section__hint">Nothing saved yet — use <strong>Save build</strong> in the price bar.</p>';
      return;
    }
    host.innerHTML = list.map(function (b, i) {
      return '<div class="saved__item"><span>' + esc(b.name) + '<br><small>' + esc(b.summary) + '</small></span>' +
        '<button type="button" class="btn btn--sm" data-load="' + i + '">Load</button>' +
        '<button type="button" class="btn btn--sm btn--danger" data-del="' + i + '">Delete</button></div>';
    }).join('');
  }

  function renderAll() {
    pruneForModel();
    renderSteps();
    renderPreview();
    renderHeader();
    renderPrice();
    renderStep();
    renderSaved();
    writeHash();
  }

  /* ────────────────────────────────────────────────────────────
     8. Persistence: share links + saved builds
     ──────────────────────────────────────────────────────────── */

  var STORE_KEY = 'amg.builds.v1';
  var LAST_KEY = 'amg.last.v1';

  function encode(obj) {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) { return ''; }
  }

  function decode(str) {
    try {
      var s = str.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return JSON.parse(decodeURIComponent(escape(atob(s))));
    } catch (e) { return null; }
  }

  function sanitize(obj) {
    if (!obj || typeof obj !== 'object') return null;
    var d = defaults();
    var out = {
      model:    byId(MODELS, obj.model)       ? obj.model    : d.model,
      paint:    byId(PAINTS, obj.paint)       ? obj.paint    : d.paint,
      wheel:    byId(WHEELS, obj.wheel)       ? obj.wheel    : d.wheel,
      caliper:  byId(CALIPERS, obj.caliper)   ? obj.caliper  : d.caliper,
      interior: byId(INTERIORS, obj.interior) ? obj.interior : d.interior,
      trim:     byId(TRIMS, obj.trim)         ? obj.trim     : d.trim,
      ext:  filterIds(obj.ext,  EXTERIOR),
      perf: filterIds(obj.perf, PERFORMANCE),
      tech: filterIds(obj.tech, TECH)
    };
    return out;
  }

  function filterIds(arr, src) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(function (id) { return !!byId(src, id); });
  }

  function writeHash() {
    var hash = '#b=' + encode(state) + '&v=' + view + '&s=' + step;
    if (window.location.hash !== hash) {
      try { history.replaceState(null, '', hash); } catch (e) { /* file:// */ }
    }
    try { localStorage.setItem(LAST_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function readHash() {
    var m = /[#&]b=([A-Za-z0-9\-_]+)/.exec(window.location.hash || '');
    return m ? sanitize(decode(m[1])) : null;
  }

  function loadBuilds() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }

  function storeBuilds(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function summaryLine() {
    return paint().name + ' · ' + wheel().name + ' · ' + usd(totals().total);
  }

  function saveBuild() {
    var list = loadBuilds();
    list.unshift({
      name: 'AMG ' + model().name,
      summary: summaryLine(),
      state: JSON.parse(JSON.stringify(state)),
      at: Date.now()
    });
    storeBuilds(list.slice(0, 12));
    renderSaved();
    toast('Build saved');
  }

  /* ────────────────────────────────────────────────────────────
     9. Events
     ──────────────────────────────────────────────────────────── */

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2200);
  }

  function goStep(i) {
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    renderSteps();
    renderStep();
    renderSaved();
    var panel = $('.panel');
    if (panel && window.innerWidth <= 1080) {
      window.scrollTo({ top: panel.offsetTop - 70, behavior: 'smooth' });
    }
  }

  function setView(v) {
    view = v;
    Array.prototype.forEach.call(document.querySelectorAll('.viewtab'), function (b) {
      var on = b.dataset.view === v;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    renderPreview();
  }

  document.addEventListener('click', function (e) {
    var el;

    if ((el = e.target.closest('[data-step]'))) { goStep(+el.dataset.step); return; }
    if ((el = e.target.closest('[data-view]'))) { setView(el.dataset.view); return; }

    if ((el = e.target.closest('[data-set]'))) {
      var key = el.dataset.set;
      if (state[key] === el.dataset.id) return;
      state[key] = el.dataset.id;
      renderAll();
      return;
    }

    if ((el = e.target.closest('[data-group]'))) {
      toggle(el.dataset.group, el.dataset.id);
      renderAll();
      return;
    }

    if ((el = e.target.closest('[data-load]'))) {
      var b = loadBuilds()[+el.dataset.load];
      if (b) { state = sanitize(b.state); renderAll(); toast('Build loaded'); }
      return;
    }

    if ((el = e.target.closest('[data-del]'))) {
      var list = loadBuilds();
      list.splice(+el.dataset.del, 1);
      storeBuilds(list);
      renderSaved();
      return;
    }

    if ((el = e.target.closest('[data-action]'))) {
      var a = el.dataset.action;
      if (a === 'next')    goStep(step + 1);
      else if (a === 'prev') goStep(step - 1);
      else if (a === 'summary') goStep(STEPS.length - 1);
      else if (a === 'save') saveBuild();
      else if (a === 'print') window.print();
      else if (a === 'reset') { state = defaults(); step = 0; renderAll(); toast('Reset to the default build'); }
      else if (a === 'share') shareLink();
    }
  });

  function shareLink() {
    writeHash();
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { toast('Build link copied'); },
        function () { toast('Copy failed — the link is in the address bar'); }
      );
    } else {
      toast('The build link is in the address bar');
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight' && e.altKey) goStep(step + 1);
    if (e.key === 'ArrowLeft' && e.altKey) goStep(step - 1);
  });

  window.addEventListener('hashchange', function () {
    var s = readHash();
    if (s && encode(s) !== encode(state)) { state = s; renderAll(); }
  });

  /* ── Boot ───────────────────────────────────────────────────── */

  var initial = readHash();
  if (/[#&]v=interior/.test(window.location.hash || '')) view = 'interior';
  var stepMatch = /[#&]s=(\d+)/.exec(window.location.hash || '');
  if (stepMatch) step = Math.min(STEPS.length - 1, +stepMatch[1]);
  if (!initial) {
    try { initial = sanitize(JSON.parse(localStorage.getItem(LAST_KEY))); } catch (e) { initial = null; }
  }
  if (initial) state = initial;

  renderAll();
  setView(view);
})();
