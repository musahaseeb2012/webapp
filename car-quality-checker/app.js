/* Car Quality & Value Checker — client logic */

(function () {
    'use strict';

    const CURRENT_YEAR = new Date().getFullYear();

    const form = document.getElementById('car-form');
    const makeInput = document.getElementById('make');
    const modelInput = document.getElementById('model');
    const categoryGroup = document.getElementById('category-group');
    const categorySelect = document.getElementById('category');
    const yearInput = document.getElementById('year');
    const mileageInput = document.getElementById('mileage');
    const priceInput = document.getElementById('price');
    const msrpInput = document.getElementById('msrp-override');
    const conditionSelect = document.getElementById('condition');
    const accidentSelect = document.getElementById('accident');
    const serviceSelect = document.getElementById('service');
    const ownersSelect = document.getElementById('owners');

    const resultsSection = document.getElementById('results');
    const emptyState = document.getElementById('empty-state');
    const errorBox = document.getElementById('form-error');

    populateSelect(conditionSelect, window.CONDITION_FACTORS, 'good');
    populateSelect(accidentSelect, window.ACCIDENT_FACTORS, 'none');
    populateSelect(serviceSelect, window.SERVICE_FACTORS, 'partial');
    populateSelect(ownersSelect, window.OWNERS_FACTORS, '1');
    populateCategorySelect();
    populateMakeList();

    yearInput.max = CURRENT_YEAR + 1;
    yearInput.placeholder = `e.g. ${CURRENT_YEAR - 5}`;

    let matchedCar = null;

    makeInput.addEventListener('input', tryMatchCar);
    modelInput.addEventListener('input', tryMatchCar);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSubmit();
    });

    function populateSelect(select, factors, defaultKey) {
        select.innerHTML = '';
        Object.keys(factors).forEach(function (key) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = factors[key].label;
            if (key === defaultKey) opt.selected = true;
            select.appendChild(opt);
        });
    }

    function populateCategorySelect() {
        categorySelect.innerHTML = '';
        Object.keys(window.CATEGORY_DEFAULTS).forEach(function (key) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = window.CATEGORY_DEFAULTS[key].label;
            categorySelect.appendChild(opt);
        });
    }

    function populateMakeList() {
        const list = document.getElementById('make-list');
        const makes = Array.from(new Set(window.CAR_DATABASE.map(function (c) { return c.make; }))).sort();
        makes.forEach(function (make) {
            const opt = document.createElement('option');
            opt.value = make;
            list.appendChild(opt);
        });
    }

    function findCar(make, model) {
        if (!make || !model) return null;
        const m = make.trim().toLowerCase();
        const mo = model.trim().toLowerCase();
        return window.CAR_DATABASE.find(function (c) {
            return c.make.toLowerCase() === m && c.model.toLowerCase() === mo;
        }) || null;
    }

    function tryMatchCar() {
        matchedCar = findCar(makeInput.value, modelInput.value);
        if (matchedCar) {
            categoryGroup.classList.add('is-hidden');
            msrpInput.placeholder = `Auto-detected (~$${matchedCar.msrp.toLocaleString()})`;
        } else {
            categoryGroup.classList.remove('is-hidden');
            msrpInput.placeholder = 'e.g. 28000';
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function handleSubmit() {
        hideError();

        const make = makeInput.value.trim();
        const model = modelInput.value.trim();
        const year = parseInt(yearInput.value, 10);
        const mileage = parseFloat(mileageInput.value);
        const askingPrice = parseFloat(priceInput.value);
        const msrpOverride = msrpInput.value ? parseFloat(msrpInput.value) : null;

        if (!make || !model) {
            return showError('Please enter both a make and model.');
        }
        if (!year || year < 1980 || year > CURRENT_YEAR + 1) {
            return showError(`Please enter a valid year between 1980 and ${CURRENT_YEAR + 1}.`);
        }
        if (isNaN(mileage) || mileage < 0) {
            return showError('Please enter a valid mileage.');
        }
        if (isNaN(askingPrice) || askingPrice <= 0) {
            return showError('Please enter a valid asking / current price.');
        }

        const car = findCar(make, model);
        let msrp, retention, category;

        if (car) {
            msrp = msrpOverride || car.msrp;
            retention = car.retention;
            category = car.category;
        } else {
            category = categorySelect.value;
            const catDefault = window.CATEGORY_DEFAULTS[category];
            retention = catDefault.retention;
            if (!msrpOverride) {
                return showError(
                    `We don't have "${make} ${model}" in our database. Please select the closest ` +
                    'vehicle category and enter its approximate original MSRP so we can estimate its value.'
                );
            }
            msrp = msrpOverride;
        }

        const result = computeValuation({
            msrp,
            retention,
            year,
            mileage,
            askingPrice,
            condition: conditionSelect.value,
            accident: accidentSelect.value,
            service: serviceSelect.value,
            owners: ownersSelect.value,
        });

        renderResults(Object.assign({ make, model, year, mileage, askingPrice, matched: !!car, category }, result));
    }

    function computeValuation(inputs) {
        const age = clamp(CURRENT_YEAR - inputs.year, 0, 60) + 0.5; // +0.5 avoids div-by-zero for brand new cars
        const baseValue = inputs.msrp * Math.pow(inputs.retention, age);

        const expectedMileage = age * 12000;
        const mileageDelta = inputs.mileage - expectedMileage;
        // Every 100k miles over/under the age-expected mileage shifts value ~12%, capped.
        const mileageFactor = clamp(1 - (mileageDelta / 100000) * 0.12, 0.65, 1.20);

        const conditionFactor = window.CONDITION_FACTORS[inputs.condition];
        const accidentFactor = window.ACCIDENT_FACTORS[inputs.accident];
        const serviceFactor = window.SERVICE_FACTORS[inputs.service];
        const ownersFactor = window.OWNERS_FACTORS[inputs.owners];

        const estimatedValue = baseValue * mileageFactor * conditionFactor.value *
            accidentFactor.value * serviceFactor.value * ownersFactor.value;

        // Quality score: weighted blend of condition, mileage-vs-age, accidents, service, owners.
        const mileageScore = clamp(100 - (Math.abs(mileageDelta) / 150000) * 100, 0, 100);
        const qualityScore = Math.round(
            mileageScore * 0.25 +
            conditionFactor.score * 0.25 +
            accidentFactor.score * 0.20 +
            serviceFactor.score * 0.15 +
            ownersFactor.score * 0.15
        );

        const diff = inputs.askingPrice - estimatedValue;
        const diffPct = (diff / estimatedValue) * 100;

        let verdict, verdictClass;
        if (diffPct <= -10) {
            verdict = 'Great Deal — priced below estimated value';
            verdictClass = 'verdict-great';
        } else if (diffPct >= 10) {
            verdict = 'Overpriced — asking above estimated value';
            verdictClass = 'verdict-bad';
        } else {
            verdict = 'Fair Price — close to estimated value';
            verdictClass = 'verdict-fair';
        }

        return {
            estimatedValue: Math.round(estimatedValue),
            diff: Math.round(diff),
            diffPct,
            verdict,
            verdictClass,
            qualityScore: clamp(qualityScore, 0, 100),
            breakdown: {
                mileageScore: Math.round(mileageScore),
                condition: conditionFactor,
                accident: accidentFactor,
                service: serviceFactor,
                owners: ownersFactor,
                expectedMileage: Math.round(expectedMileage),
            },
        };
    }

    function money(n) {
        return '$' + Math.round(n).toLocaleString();
    }

    function renderResults(r) {
        emptyState.classList.add('is-hidden');
        resultsSection.classList.remove('is-hidden');

        document.getElementById('result-title').textContent = `${r.year} ${r.make} ${r.model}`;
        document.getElementById('result-subtitle').textContent = r.matched
            ? 'Matched against our reference pricing data.'
            : `Estimated using generic "${window.CATEGORY_DEFAULTS[r.category].label}" depreciation curve.`;

        const scoreEl = document.getElementById('quality-score');
        scoreEl.textContent = r.qualityScore;
        const gauge = document.getElementById('quality-gauge');
        gauge.style.setProperty('--score', r.qualityScore);
        gauge.className = 'gauge ' + scoreClass(r.qualityScore);

        document.getElementById('estimated-value').textContent = money(r.estimatedValue);
        document.getElementById('asking-price').textContent = money(r.askingPrice);

        const verdictEl = document.getElementById('verdict');
        verdictEl.textContent = r.verdict;
        verdictEl.className = 'verdict ' + r.verdictClass;

        const diffEl = document.getElementById('price-diff');
        const sign = r.diff > 0 ? '+' : '';
        diffEl.textContent = `${sign}${money(r.diff)} (${sign}${r.diffPct.toFixed(1)}%) vs. estimated value`;
        diffEl.className = 'price-diff ' + (r.diff > 0 ? 'text-bad' : r.diff < 0 ? 'text-great' : 'text-fair');

        const list = document.getElementById('breakdown-list');
        list.innerHTML = '';
        addBreakdownRow(list, 'Mileage', `${r.mileage.toLocaleString()} mi (expected ~${r.breakdown.expectedMileage.toLocaleString()} mi for age)`, r.breakdown.mileageScore);
        addBreakdownRow(list, 'Condition', r.breakdown.condition.label, r.breakdown.condition.score);
        addBreakdownRow(list, 'Accident history', r.breakdown.accident.label, r.breakdown.accident.score);
        addBreakdownRow(list, 'Service records', r.breakdown.service.label, r.breakdown.service.score);
        addBreakdownRow(list, 'Ownership', r.breakdown.owners.label, r.breakdown.owners.score);

        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function scoreClass(score) {
        if (score >= 75) return 'gauge-great';
        if (score >= 50) return 'gauge-fair';
        return 'gauge-bad';
    }

    function addBreakdownRow(list, label, detail, score) {
        const li = document.createElement('li');
        li.className = 'breakdown-row';
        li.innerHTML = `
            <div class="breakdown-label">
                <span>${label}</span>
                <span class="breakdown-detail">${detail}</span>
            </div>
            <div class="breakdown-bar">
                <div class="breakdown-fill ${scoreClass(score)}" style="width:${score}%"></div>
            </div>
        `;
        list.appendChild(li);
    }

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.classList.remove('is-hidden');
        return false;
    }

    function hideError() {
        errorBox.textContent = '';
        errorBox.classList.add('is-hidden');
    }
})();
