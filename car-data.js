/*
 * Curated reference dataset used to estimate vehicle quality and value.
 * Figures are general industry-reputation approximations for informational
 * purposes only — not live market data or manufacturer-sourced figures.
 */

const CAR_DATA = {
    default: {
        basePrice: 28000,
        reliability: 7.0,
        resale: 6.0,
        avgMaintenance: 550,
        issues: [
            'No make-specific data on file — treating as an average mainstream vehicle.',
            'Always verify with a trusted mechanic before buying.'
        ]
    },

    makes: {
        'Toyota': { basePrice: 29000, reliability: 9.2, resale: 8.8, avgMaintenance: 400,
            issues: ['Excessive oil consumption on some 2007-2011 V6 engines', 'Water pump failures on some V6 models', 'Infotainment feels dated on older trims'] },
        'Honda': { basePrice: 27000, reliability: 8.8, resale: 8.5, avgMaintenance: 420,
            issues: ['CVT transmission issues reported on some models', 'Fuel/oil dilution on some turbo engines', 'AC compressor failures on some model years'] },
        'Mazda': { basePrice: 27000, reliability: 8.5, resale: 7.8, avgMaintenance: 430,
            issues: ['Rust concerns on older models in snow-belt states', 'Infotainment controller quirks'] },
        'Subaru': { basePrice: 29000, reliability: 7.8, resale: 7.5, avgMaintenance: 480,
            issues: ['Head gasket failures on older EJ-series engines', 'Excessive oil consumption on some models', 'CVT long-term reliability concerns'] },
        'Lexus': { basePrice: 46000, reliability: 9.4, resale: 8.7, avgMaintenance: 550,
            issues: ['Minor infotainment complaints', 'Air suspension issues on some air-ride trims'] },
        'Acura': { basePrice: 38000, reliability: 8.7, resale: 7.3, avgMaintenance: 480,
            issues: ['Transmission complaints on some older models', 'Infotainment lag on older systems'] },
        'Hyundai': { basePrice: 26000, reliability: 8.0, resale: 6.8, avgMaintenance: 380,
            issues: ['Engine failure recalls on some Theta II engines (2011-2019)', 'Occasional transmission hesitation complaints'] },
        'Kia': { basePrice: 25000, reliability: 7.9, resale: 6.7, avgMaintenance: 380,
            issues: ['Shares some engine recall issues with Hyundai (shared platforms)', 'Occasional electrical gremlins'] },
        'Genesis': { basePrice: 48000, reliability: 8.5, resale: 6.0, avgMaintenance: 500,
            issues: ['Newer brand — limited long-term reliability data', 'Shares some components with Hyundai/Kia group'] },
        'Nissan': { basePrice: 27000, reliability: 7.0, resale: 6.5, avgMaintenance: 450,
            issues: ['CVT transmission failures — common and costly to fix', 'Timing chain noise on some V6 engines'] },
        'Infiniti': { basePrice: 40000, reliability: 7.0, resale: 5.8, avgMaintenance: 600,
            issues: ['CVT reliability concerns', 'Depreciates faster than most luxury competitors'] },
        'Mitsubishi': { basePrice: 24000, reliability: 7.0, resale: 5.0, avgMaintenance: 420,
            issues: ['CVT reliability concerns', 'Smaller dealer/parts network in some regions'] },
        'Ford': { basePrice: 32000, reliability: 6.8, resale: 6.5, avgMaintenance: 550,
            issues: ['Dual-clutch transmission issues on some older compact models', 'EcoBoost turbo coolant issues on some engines', 'Electrical/infotainment glitches reported'] },
        'Chevrolet': { basePrice: 31000, reliability: 6.9, resale: 6.3, avgMaintenance: 540,
            issues: ['Active fuel management/lifter issues on some V8 engines', 'Excessive oil consumption on some 4-cylinders', 'Occasional electrical gremlins'] },
        'GMC': { basePrice: 38000, reliability: 7.0, resale: 6.8, avgMaintenance: 560,
            issues: ['Shares drivetrain issues with Chevrolet counterparts', 'Air-ride suspension issues on some trims'] },
        'Buick': { basePrice: 32000, reliability: 7.5, resale: 6.0, avgMaintenance: 480,
            issues: ['Minor electrical quirks', 'Aging-platform wear items on older models'] },
        'Cadillac': { basePrice: 48000, reliability: 6.8, resale: 5.8, avgMaintenance: 700,
            issues: ['CUE infotainment reliability complaints on older models', 'Suspension component wear over time'] },
        'Ram': { basePrice: 40000, reliability: 6.5, resale: 6.6, avgMaintenance: 600,
            issues: ['Air suspension leaks on air-ride trims', 'Uconnect infotainment glitches', 'Diesel emissions system issues on some model years'] },
        'Dodge': { basePrice: 33000, reliability: 6.3, resale: 6.0, avgMaintenance: 620,
            issues: ['Transmission shudder reported on some models', 'Occasional electrical issues'] },
        'Chrysler': { basePrice: 32000, reliability: 6.0, resale: 5.5, avgMaintenance: 650,
            issues: ['9-speed transmission reliability concerns', 'Electrical system quirks'] },
        'Jeep': { basePrice: 35000, reliability: 6.2, resale: 6.5, avgMaintenance: 620,
            issues: ['Oil leaks reported on some engines', 'Electrical/infotainment issues', 'Transmission shudder on some models'] },
        'Lincoln': { basePrice: 46000, reliability: 6.7, resale: 5.9, avgMaintenance: 680,
            issues: ['Shares Ford drivetrain issues', 'Occasional electronics glitches'] },
        'Volkswagen': { basePrice: 30000, reliability: 6.9, resale: 6.2, avgMaintenance: 620,
            issues: ['DSG dual-clutch transmission issues on some models', 'Timing chain tensioner issues on older TSI engines', 'Occasional electrical gremlins'] },
        'Audi': { basePrice: 46000, reliability: 6.8, resale: 6.5, avgMaintenance: 800,
            issues: ['Timing chain tensioner issues on older engines', 'Carbon buildup on direct-injection engines', 'Repairs get expensive out of warranty'] },
        'BMW': { basePrice: 50000, reliability: 6.5, resale: 6.3, avgMaintenance: 900,
            issues: ['Timing chain guide failures on some N20/N26 engines', 'Cooling system component failures over time', 'High maintenance costs once out of warranty'] },
        'Mercedes-Benz': { basePrice: 55000, reliability: 6.4, resale: 6.0, avgMaintenance: 950,
            issues: ['Air suspension (Airmatic) failures on some models', 'Electrical system complexity drives up repair cost', 'High cost of ownership out of warranty'] },
        'Volvo': { basePrice: 44000, reliability: 7.2, resale: 6.0, avgMaintenance: 650,
            issues: ['Electrical/infotainment glitches reported', 'Turbo/supercharger wear items on some models'] },
        'Porsche': { basePrice: 85000, reliability: 7.8, resale: 8.0, avgMaintenance: 1400,
            issues: ['IMS bearing failure risk on older 996/early 997 models', 'Very high maintenance and parts costs'] },
        'Mini': { basePrice: 30000, reliability: 6.0, resale: 5.5, avgMaintenance: 700,
            issues: ['Timing chain issues on some engines', 'Electrical gremlins reported', 'Cooling system failures over time'] },
        'Fiat': { basePrice: 22000, reliability: 5.5, resale: 4.5, avgMaintenance: 600,
            issues: ['Below-average reliability reputation overall', 'Limited dealer/parts network in some regions'] },
        'Alfa Romeo': { basePrice: 42000, reliability: 5.0, resale: 4.5, avgMaintenance: 900,
            issues: ['Electrical system reliability concerns', 'Build-quality inconsistencies reported'] },
        'Jaguar': { basePrice: 50000, reliability: 5.5, resale: 4.8, avgMaintenance: 1000,
            issues: ['Electrical system gremlins reported', 'Air suspension issues on some models'] },
        'Land Rover': { basePrice: 58000, reliability: 4.8, resale: 5.0, avgMaintenance: 1300,
            issues: ['Air suspension failures reported', 'Electrical system reliability concerns', 'Historically high maintenance costs'] },
        'Tesla': { basePrice: 45000, reliability: 7.0, resale: 7.0, avgMaintenance: 400,
            issues: ['Panel gap/build-quality inconsistencies vary by model year', 'Touchscreen/electronics replacements reported', 'Verify battery health/degradation on high-mileage cars'] },
        'Suzuki': { basePrice: 20000, reliability: 7.5, resale: 5.0, avgMaintenance: 400,
            issues: ['Brand exited the US market — parts availability may be limited'] }
    },

    models: {
        'toyota camry': { basePrice: 27000, reliability: 9.0 },
        'toyota corolla': { basePrice: 22000, reliability: 9.1 },
        'toyota rav4': { basePrice: 29000, reliability: 9.0 },
        'toyota tacoma': { basePrice: 32000, reliability: 9.2 },
        'toyota tundra': { basePrice: 40000, reliability: 8.9 },
        'toyota highlander': { basePrice: 37000, reliability: 8.9 },
        'toyota 4runner': { basePrice: 40000, reliability: 9.3 },
        'toyota prius': { basePrice: 27000, reliability: 9.0 },

        'honda civic': { basePrice: 24000, reliability: 8.9 },
        'honda accord': { basePrice: 28000, reliability: 8.8 },
        'honda cr-v': { basePrice: 30000, reliability: 8.7 },
        'honda pilot': { basePrice: 38000, reliability: 8.4 },
        'honda odyssey': { basePrice: 36000, reliability: 8.2 },

        'ford f-150': { basePrice: 42000, reliability: 7.2 },
        'ford mustang': { basePrice: 32000, reliability: 6.9 },
        'ford explorer': { basePrice: 38000, reliability: 6.2 },
        'ford escape': { basePrice: 29000, reliability: 6.5 },
        'ford focus': { basePrice: 20000, reliability: 5.8 },
        'ford fusion': { basePrice: 24000, reliability: 6.6 },

        'chevrolet silverado': { basePrice: 42000, reliability: 7.0 },
        'chevrolet equinox': { basePrice: 28000, reliability: 6.6 },
        'chevrolet malibu': { basePrice: 25000, reliability: 6.8 },
        'chevrolet tahoe': { basePrice: 55000, reliability: 6.9 },
        'chevrolet camaro': { basePrice: 33000, reliability: 6.7 },

        'tesla model 3': { basePrice: 42000, reliability: 7.3 },
        'tesla model y': { basePrice: 47000, reliability: 7.0 },
        'tesla model s': { basePrice: 75000, reliability: 6.8 },
        'tesla model x': { basePrice: 80000, reliability: 6.5 },

        'bmw 3 series': { basePrice: 45000, reliability: 6.7 },
        'bmw 5 series': { basePrice: 55000, reliability: 6.5 },
        'bmw x3': { basePrice: 47000, reliability: 6.6 },
        'bmw x5': { basePrice: 62000, reliability: 6.4 },

        'mercedes-benz c-class': { basePrice: 46000, reliability: 6.6 },
        'mercedes-benz e-class': { basePrice: 58000, reliability: 6.4 },
        'mercedes-benz glc': { basePrice: 48000, reliability: 6.5 },

        'subaru outback': { basePrice: 30000, reliability: 8.0 },
        'subaru forester': { basePrice: 28000, reliability: 8.1 },
        'subaru crosstrek': { basePrice: 26000, reliability: 8.2 },
        'subaru wrx': { basePrice: 32000, reliability: 7.3 },

        'jeep wrangler': { basePrice: 36000, reliability: 6.8 },
        'jeep grand cherokee': { basePrice: 39000, reliability: 6.0 },
        'jeep cherokee': { basePrice: 30000, reliability: 5.9 },

        'nissan altima': { basePrice: 26000, reliability: 6.9 },
        'nissan rogue': { basePrice: 29000, reliability: 6.8 },
        'nissan sentra': { basePrice: 21000, reliability: 7.0 },
        'nissan pathfinder': { basePrice: 36000, reliability: 6.5 },

        'hyundai elantra': { basePrice: 22000, reliability: 8.1 },
        'hyundai tucson': { basePrice: 27000, reliability: 7.9 },
        'hyundai santa fe': { basePrice: 31000, reliability: 7.9 },
        'hyundai sonata': { basePrice: 26000, reliability: 8.0 },

        'kia sportage': { basePrice: 27000, reliability: 8.0 },
        'kia telluride': { basePrice: 36000, reliability: 8.3 },
        'kia sorento': { basePrice: 32000, reliability: 7.9 },
        'kia forte': { basePrice: 21000, reliability: 7.9 },

        'mazda3': { basePrice: 24000, reliability: 8.6 },
        'mazda cx-5': { basePrice: 28000, reliability: 8.6 },
        'mazda cx-9': { basePrice: 36000, reliability: 8.3 },

        'volkswagen jetta': { basePrice: 22000, reliability: 6.9 },
        'volkswagen tiguan': { basePrice: 29000, reliability: 6.6 },
        'volkswagen golf': { basePrice: 25000, reliability: 6.9 },

        'audi a4': { basePrice: 42000, reliability: 6.9 },
        'audi q5': { basePrice: 46000, reliability: 6.8 },

        'lexus rx': { basePrice: 48000, reliability: 9.3 },
        'lexus es': { basePrice: 42000, reliability: 9.4 },

        'ram 1500': { basePrice: 42000, reliability: 6.6 },
        'gmc sierra': { basePrice: 43000, reliability: 7.1 },
        'gmc terrain': { basePrice: 30000, reliability: 6.7 }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CAR_DATA;
}
