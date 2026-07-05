(function () {
  "use strict";

  var CURRENT_YEAR = new Date().getFullYear();
  var MIN_YEAR = 1998;

  var CATEGORY_ICON = {
    Sedan: "🚗",
    SUV: "🚙",
    Truck: "🛻",
    Coupe: "🏎️",
    Hatchback: "🚗",
    Minivan: "🚐",
    Van: "🚐",
    Convertible: "🚗"
  };

  var CONDITION_FACTORS = {
    excellent: 1.06,
    good: 1.0,
    fair: 0.88,
    poor: 0.72,
    salvage: 0.45
  };

  var ACCIDENT_FACTORS = {
    none: 1.0,
    minor: 0.94,
    moderate: 0.85,
    major: 0.72
  };

  var OWNERS_FACTORS = {
    "1": 1.03,
    "2": 1.0,
    "3": 0.96,
    "4": 0.92
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.make = document.getElementById("make");
    els.model = document.getElementById("model");
    els.year = document.getElementById("year");
    els.checkBtn = document.getElementById("check-btn");
    els.results = document.getElementById("results");

    els.qualityCard = document.getElementById("quality-card");
    els.valuationCard = document.getElementById("valuation-card");

    els.mileage = document.getElementById("mileage");
    els.condition = document.getElementById("condition");
    els.accidents = document.getElementById("accidents");
    els.owners = document.getElementById("owners");
    els.askingPrice = document.getElementById("asking-price");
    els.calcBtn = document.getElementById("calc-btn");
    els.valuationOutput = document.getElementById("valuation-output");

    populateMakes();
    populateYears();

    els.make.addEventListener("change", onMakeChange);
    els.checkBtn.addEventListener("click", onCheckCar);
    els.calcBtn.addEventListener("click", onCalculateValue);

    onMakeChange();
  }

  function uniqueMakes() {
    var seen = {};
    var makes = [];
    CAR_DATABASE.forEach(function (entry) {
      if (!seen[entry.make]) {
        seen[entry.make] = true;
        makes.push(entry.make);
      }
    });
    makes.sort();
    return makes;
  }

  function populateMakes() {
    var makes = uniqueMakes();
    els.make.innerHTML = "";
    makes.forEach(function (make) {
      var opt = document.createElement("option");
      opt.value = make;
      opt.textContent = make;
      els.make.appendChild(opt);
    });
  }

  function populateYears() {
    els.year.innerHTML = "";
    for (var y = CURRENT_YEAR + 1; y >= MIN_YEAR; y--) {
      var opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      els.year.appendChild(opt);
    }
    els.year.value = String(CURRENT_YEAR - 3);
  }

  function onMakeChange() {
    var make = els.make.value;
    var models = CAR_DATABASE.filter(function (e) {
      return e.make === make;
    }).map(function (e) {
      return e.model;
    }).sort();

    els.model.innerHTML = "";
    models.forEach(function (model) {
      var opt = document.createElement("option");
      opt.value = model;
      opt.textContent = model;
      els.model.appendChild(opt);
    });
  }

  function getSelectedEntry() {
    var make = els.make.value;
    var model = els.model.value;
    return CAR_DATABASE.filter(function (e) {
      return e.make === make && e.model === model;
    })[0];
  }

  var currentEntry = null;
  var currentYear = null;

  function onCheckCar() {
    var entry = getSelectedEntry();
    if (!entry) {
      return;
    }
    currentEntry = entry;
    currentYear = parseInt(els.year.value, 10);

    renderQualityReport(entry, currentYear);
    resetValuationForm();
    els.results.classList.add("visible");
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reliabilityInfo(score) {
    if (score >= 8.5) return { label: "Excellent", status: "good" };
    if (score >= 7) return { label: "Good", status: "good" };
    if (score >= 5.5) return { label: "Average", status: "warning" };
    if (score >= 4) return { label: "Below Average", status: "serious" };
    return { label: "Poor", status: "critical" };
  }

  var MAINTENANCE_INFO = {
    Low: { cost: 400, status: "good" },
    Medium: { cost: 650, status: "warning" },
    High: { cost: 950, status: "serious" },
    "Very High": { cost: 1400, status: "critical" }
  };

  function starString(rating, max) {
    max = max || 5;
    var filled = Math.round(rating);
    var html = "";
    for (var i = 0; i < max; i++) {
      html += i < filled ? "★" : '<span class="empty">★</span>';
    }
    return html;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function overallVerdict(entry) {
    if (entry.reliability >= 8) {
      return {
        status: "good",
        icon: "✓",
        title: "Worth Buying",
        sub: "This model has a strong reliability track record and should make a solid purchase with routine maintenance."
      };
    }
    if (entry.reliability >= 6.5) {
      return {
        status: "good",
        icon: "✓",
        title: "Generally Worth Buying",
        sub: "Solid overall reliability. Get a pre-purchase inspection and check for the common issues below."
      };
    }
    if (entry.reliability >= 5) {
      return {
        status: "warning",
        icon: "!",
        title: "Proceed With Research",
        sub: "Reliability is average. A pre-purchase inspection and vehicle history report are strongly recommended."
      };
    }
    return {
      status: "critical",
      icon: "⚠",
      title: "Buy With Caution",
      sub: "This model has a below-average reliability history. Budget for higher repair costs or consider alternatives."
    };
  }

  function renderQualityReport(entry, year) {
    var rel = reliabilityInfo(entry.reliability);
    var maint = MAINTENANCE_INFO[entry.maintenanceTier];
    var verdict = overallVerdict(entry);
    var pct = Math.max(0, Math.min(100, (entry.reliability / 10) * 100));

    var issuesHtml = entry.commonIssues.map(function (issue) {
      return '<li><span class="glyph">⚠</span><span>' + escapeHtml(issue) + "</span></li>";
    }).join("");

    var prosHtml = entry.pros.map(function (p) {
      return '<li><span class="glyph">✓</span><span>' + escapeHtml(p) + "</span></li>";
    }).join("");

    var consHtml = entry.cons.map(function (c) {
      return '<li><span class="glyph">✕</span><span>' + escapeHtml(c) + "</span></li>";
    }).join("");

    var icon = CATEGORY_ICON[entry.category] || "🚗";

    els.qualityCard.innerHTML =
      '<div class="card-title">' +
      "<h2>" + icon + " " + year + " " + escapeHtml(entry.make) + " " + escapeHtml(entry.model) + "</h2>" +
      '<span class="badge-category">' + escapeHtml(entry.category) + "</span>" +
      "</div>" +
      '<div class="quality-grid">' +
      '<div class="gauge" style="--pct:' + pct + '">' +
      '<div class="gauge-inner">' +
      '<div class="score">' + entry.reliability.toFixed(1) + '<span>/10</span></div>' +
      '<div class="label" style="color:var(--' + rel.status + ')">' + rel.label + "</div>" +
      "</div></div>" +
      '<div class="quality-meta">' +
      '<div class="meta-row"><span class="meta-label">Safety Rating</span><span class="stars">' + starString(entry.safety, 5) + "</span></div>" +
      '<div class="meta-row"><span class="meta-label">Maintenance Cost</span><span class="status-chip ' + maint.status + '">' + entry.maintenanceTier + " — ~$" + maint.cost + "/yr</span></div>" +
      '<div class="meta-row"><span class="meta-label">Reliability</span><span class="status-chip ' + rel.status + '">' + rel.label + "</span></div>" +
      "</div>" +
      "</div>" +
      '<div class="verdict-banner ' + verdict.status + '">' +
      '<span class="icon">' + verdict.icon + "</span>" +
      "<span>" + verdict.title + '<span class="sub">' + verdict.sub + "</span></span>" +
      "</div>" +
      '<div class="list-grid">' +
      '<div class="list-block pros"><h3>Pros</h3><ul>' + prosHtml + "</ul></div>" +
      '<div class="list-block cons"><h3>Cons</h3><ul>' + consHtml + "</ul></div>" +
      "</div>" +
      '<div class="issues-block list-block issues"><h3>Common Reported Issues</h3><ul>' + issuesHtml + "</ul></div>";
  }

  function resetValuationForm() {
    els.valuationOutput.innerHTML = "";
    els.mileage.value = "";
    els.askingPrice.value = "";
    els.condition.value = "good";
    els.accidents.value = "none";
    els.owners.value = "1";
  }

  function retentionFactor(age, brandFactor) {
    var firstYearRetention = 0.82;
    var laterYearRetention = 0.90;
    var floor = 0.12;
    var value;
    if (age <= 0) {
      value = 1;
    } else {
      value = firstYearRetention;
      for (var i = 1; i < age; i++) {
        value *= laterYearRetention;
      }
    }
    value *= brandFactor;
    return Math.max(value, floor);
  }

  function mileageAdjustment(age, mileage) {
    var expected = Math.max(age, 0.5) * 12000;
    var diff = mileage - expected;
    var adj = 1 - (diff / 1000) * 0.004;
    return Math.min(1.15, Math.max(0.65, adj));
  }

  function formatMoney(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function dealVerdict(ratio) {
    if (ratio <= 0.85) {
      return { status: "good", icon: "✓", title: "Great Deal" };
    }
    if (ratio <= 0.97) {
      return { status: "good", icon: "✓", title: "Good Deal" };
    }
    if (ratio <= 1.08) {
      return { status: "neutral", icon: "≈", title: "Fair Price" };
    }
    if (ratio <= 1.20) {
      return { status: "warning", icon: "!", title: "Slightly Overpriced" };
    }
    return { status: "critical", icon: "⚠", title: "Overpriced" };
  }

  function onCalculateValue() {
    if (!currentEntry) {
      return;
    }
    var mileage = parseFloat(els.mileage.value);
    var askingPrice = parseFloat(els.askingPrice.value);

    if (isNaN(mileage) || mileage < 0) {
      els.valuationOutput.innerHTML = '<p class="helper-text">Enter a valid mileage to calculate the estimated value.</p>';
      return;
    }

    var age = Math.max(0, CURRENT_YEAR - currentYear);
    var conditionFactor = CONDITION_FACTORS[els.condition.value];
    var accidentFactor = ACCIDENT_FACTORS[els.accidents.value];
    var ownersFactor = OWNERS_FACTORS[els.owners.value];

    var dep = retentionFactor(age, currentEntry.depreciationFactor);
    var mileageFactor = mileageAdjustment(age, mileage);

    var estimated = currentEntry.basePriceNew * dep * mileageFactor * conditionFactor * accidentFactor * ownersFactor;
    estimated = Math.max(estimated, currentEntry.basePriceNew * 0.05);

    var low = estimated * 0.92;
    var high = estimated * 1.08;

    var html =
      '<div class="value-numbers">' +
      '<div class="value-stat"><div class="num">' + formatMoney(low) + '</div><div class="cap">Low Estimate</div></div>' +
      '<div class="value-stat"><div class="num">' + formatMoney(estimated) + '</div><div class="cap">Fair Market Value</div></div>' +
      '<div class="value-stat"><div class="num">' + formatMoney(high) + '</div><div class="cap">High Estimate</div></div>' +
      "</div>";

    if (!isNaN(askingPrice) && askingPrice > 0) {
      var ratio = askingPrice / estimated;
      var verdict = dealVerdict(ratio);
      var diff = askingPrice - estimated;
      var diffPct = (diff / estimated) * 100;
      var diffLabel = diff >= 0
        ? formatMoney(Math.abs(diff)) + " (" + diffPct.toFixed(1) + "%) above fair value"
        : formatMoney(Math.abs(diff)) + " (" + Math.abs(diffPct).toFixed(1) + "%) below fair value";

      var rangeSpan = high - low;
      var markerPos = rangeSpan > 0 ? ((askingPrice - low) / rangeSpan) * 100 : 50;
      markerPos = Math.max(4, Math.min(96, markerPos));

      html +=
        '<div class="value-range">' +
        '<div class="value-range-track">' +
        '<div class="value-range-marker" style="left:' + markerPos + '%">' +
        '<span class="marker-label">Asking: ' + formatMoney(askingPrice) + "</span>" +
        "</div></div>" +
        '<div class="value-range-labels"><span>' + formatMoney(low) + '</span><span class="mid">Estimated Fair Range</span><span>' + formatMoney(high) + "</span></div>" +
        "</div>" +
        '<div class="verdict-banner ' + verdict.status + '" style="margin-top:20px">' +
        '<span class="icon">' + verdict.icon + "</span>" +
        "<span>" + verdict.title + '<span class="sub">Asking price is ' + diffLabel + "</span></span>" +
        "</div>";
    } else {
      html += '<p class="helper-text" style="margin-top:14px">Enter an asking price above to see how it compares to the estimated fair value.</p>';
    }

    els.valuationOutput.innerHTML = html;
    keepLabelInsideCard();
  }

  function keepLabelInsideCard() {
    var label = els.valuationOutput.querySelector(".marker-label");
    var card = els.valuationCard;
    if (!label || !card) {
      return;
    }
    var labelRect = label.getBoundingClientRect();
    var cardRect = card.getBoundingClientRect();
    var margin = 8;
    var overflowLeft = (cardRect.left + margin) - labelRect.left;
    var overflowRight = labelRect.right - (cardRect.right - margin);
    if (overflowLeft > 0) {
      label.style.transform = "translateX(calc(-50% + " + overflowLeft + "px))";
    } else if (overflowRight > 0) {
      label.style.transform = "translateX(calc(-50% - " + overflowRight + "px))";
    }
  }
})();
