(function () {
    'use strict';

    const CURRENT_YEAR = new Date().getFullYear();

    const CONDITION_META = {
        excellent: { label: 'Excellent', valueMultiplier: 1.08, score: 15 },
        good: { label: 'Good', valueMultiplier: 1.00, score: 12 },
        fair: { label: 'Fair', valueMultiplier: 0.85, score: 7 },
        poor: { label: 'Poor', valueMultiplier: 0.65, score: 2 }
    };

    const TITLE_META = {
        clean: { label: 'Clean', valueMultiplier: 1.00, score: 10 },
        rebuilt: { label: 'Rebuilt/Reconstructed', valueMultiplier: 0.70, score: 4 },
        salvage: { label: 'Salvage', valueMultiplier: 0.50, score: 0 }
    };

    function normalizeMakeKey(make) {
        const found = Object.keys(CAR_DATA.makes).find(
            (k) => k.toLowerCase() === make.trim().toLowerCase()
        );
        return found || null;
    }

    function lookupMake(make) {
        const key = normalizeMakeKey(make);
        return key ? CAR_DATA.makes[key] : CAR_DATA.default;
    }

    function lookupModel(make, model) {
        if (!model) return null;
        const key = (make + ' ' + model).trim().toLowerCase().replace(/\s+/g, ' ');
        return CAR_DATA.models[key] || null;
    }

    function estimateValue(input) {
        const makeData = lookupMake(input.make);
        const modelData = lookupModel(input.make, input.model);
        const basePrice = modelData ? modelData.basePrice : makeData.basePrice;

        const age = Math.max(0, CURRENT_YEAR - input.year);

        // Depreciation curve: steep in year one, ~15%/yr through year 5,
        // ~8%/yr after that, floored so old cars retain some value.
        let retained = age === 0 ? 0.90 : 0.80;
        for (let y = 2; y <= age; y++) {
            retained *= y <= 5 ? 0.85 : 0.92;
        }
        retained = Math.max(retained, 0.08);

        let value = basePrice * retained;

        // Mileage adjustment relative to the ~12,000 mi/yr average.
        const expectedMileage = Math.max(age, 1) * 12000;
        const mileageDiff = input.mileage - expectedMileage;
        const perMileAdj = (basePrice / 200000) * 0.5;
        value -= mileageDiff * perMileAdj;

        value *= CONDITION_META[input.condition].valueMultiplier;
        value *= TITLE_META[input.title].valueMultiplier;

        value = Math.max(value, basePrice * 0.05);
        return {
            estimatedValue: Math.round(value / 50) * 50,
            basePrice,
            usedSpecificModel: !!modelData
        };
    }

    function computeQualityScore(input) {
        const makeData = lookupMake(input.make);
        const modelData = lookupModel(input.make, input.model);
        const reliability = modelData ? modelData.reliability : makeData.reliability;

        const reliabilityScore = (reliability / 10) * 40;

        const age = Math.max(0, CURRENT_YEAR - input.year);
        let ageScore;
        if (age <= 2) ageScore = 15;
        else if (age <= 5) ageScore = 13;
        else if (age <= 8) ageScore = 10;
        else if (age <= 12) ageScore = 6;
        else ageScore = 3;

        const expectedMileage = Math.max(age, 1) * 12000;
        const mileageRatio = input.mileage / Math.max(expectedMileage, 6000);
        let mileageScore;
        if (mileageRatio <= 0.7) mileageScore = 20;
        else if (mileageRatio <= 1.0) mileageScore = 17;
        else if (mileageRatio <= 1.3) mileageScore = 12;
        else if (mileageRatio <= 1.6) mileageScore = 7;
        else mileageScore = 3;

        const conditionScore = CONDITION_META[input.condition].score;
        const titleScore = TITLE_META[input.title].score;

        const total = reliabilityScore + ageScore + mileageScore + conditionScore + titleScore;

        return {
            total: Math.round(Math.min(100, Math.max(0, total))),
            breakdown: [
                { label: 'Brand & Model Reliability', points: Math.round(reliabilityScore), max: 40 },
                { label: 'Age', points: ageScore, max: 15 },
                { label: 'Mileage', points: mileageScore, max: 20 },
                { label: 'Condition', points: conditionScore, max: 15 },
                { label: 'Title Status', points: titleScore, max: 10 }
            ],
            reliability,
            avgMaintenance: makeData.avgMaintenance,
            issues: (modelData && modelData.issues) || makeData.issues
        };
    }

    function estimateNewCarValue(input) {
        const msrp = input.msrp;
        const incentives = input.incentives || 0;

        // A well-negotiated new-car deal is typically a few percent under
        // sticker; treat ~5% off MSRP (after incentives) as the fair target
        // price, floored so the target never drops unrealistically low.
        const fairTarget = Math.max(msrp * 0.95 - incentives, msrp * 0.75);

        return {
            estimatedValue: Math.round(fairTarget / 50) * 50,
            basePrice: msrp,
            usedSpecificModel: !!lookupModel(input.make, input.model)
        };
    }

    function computeNewCarQualityScore(input) {
        const makeData = lookupMake(input.make);
        const modelData = lookupModel(input.make, input.model);
        const reliability = modelData ? modelData.reliability : makeData.reliability;

        // A new car has no mileage/condition/title history to weigh, so
        // quality instead leans on predicted reliability and how well the
        // model is expected to hold its value over time.
        const reliabilityScore = (reliability / 10) * 70;
        const resaleScore = (makeData.resale / 10) * 30;
        const total = reliabilityScore + resaleScore;

        return {
            total: Math.round(Math.min(100, Math.max(0, total))),
            breakdown: [
                { label: 'Brand & Model Reliability', points: Math.round(reliabilityScore), max: 70 },
                { label: 'Resale Value Retention', points: Math.round(resaleScore), max: 30 }
            ],
            reliability,
            avgMaintenance: makeData.avgMaintenance,
            issues: (modelData && modelData.issues) || makeData.issues
        };
    }

    function gradeFor(score) {
        if (score >= 90) return { grade: 'A+', verdict: 'Excellent — a strong, low-risk pick.' };
        if (score >= 80) return { grade: 'A', verdict: 'Very good — a solid, dependable choice.' };
        if (score >= 70) return { grade: 'B', verdict: 'Good — worth buying with a pre-purchase inspection.' };
        if (score >= 60) return { grade: 'C', verdict: 'Fair — acceptable, but budget for maintenance.' };
        if (score >= 45) return { grade: 'D', verdict: 'Below average — proceed carefully and get it inspected.' };
        return { grade: 'F', verdict: 'Poor — high risk. Strongly consider other options.' };
    }

    function comparePrice(estimatedValue, askingPrice) {
        const diff = askingPrice - estimatedValue;
        const diffPct = (diff / estimatedValue) * 100;

        let verdict, className;
        if (diffPct <= -15) { verdict = 'Great Deal'; className = 'great'; }
        else if (diffPct <= -5) { verdict = 'Good Deal'; className = 'good'; }
        else if (diffPct < 5) { verdict = 'Fair Price'; className = 'fair'; }
        else if (diffPct < 15) { verdict = 'Slightly Overpriced'; className = 'over'; }
        else { verdict = 'Overpriced'; className = 'bad'; }

        return { diff, diffPct, verdict, className };
    }

    window.CarChecker = {
        CURRENT_YEAR,
        CONDITION_META,
        TITLE_META,
        estimateValue,
        estimateNewCarValue,
        computeQualityScore,
        computeNewCarQualityScore,
        gradeFor,
        comparePrice,
        normalizeMakeKey
    };
})();
