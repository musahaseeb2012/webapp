// Get DOM elements
const carNameInput = document.getElementById('carName');
const countrySelect = document.getElementById('country');
const logoStyleSelect = document.getElementById('logoStyle');
const colorSchemeSelect = document.getElementById('colorScheme');
const generateBtn = document.getElementById('generateBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const logoPreview = document.getElementById('logoPreview');
const recentGallery = document.getElementById('recentGallery');

// Info displays
const infoBrand = document.getElementById('infoBrand');
const infoCountry = document.getElementById('infoCountry');
const infoStyle = document.getElementById('infoStyle');

// State
let currentLogo = null;
let recentLogos = [];

// Load recent logos from localStorage
function loadRecentLogos() {
    const saved = localStorage.getItem('carLogos');
    if (saved) {
        recentLogos = JSON.parse(saved);
        renderGallery();
    }
}

// Save recent logos to localStorage
function saveRecentLogos() {
    localStorage.setItem('carLogos', JSON.stringify(recentLogos));
}

// Color schemes
const colorSchemes = {
    ferrari: {
        primary: '#DC0000',
        secondary: '#000000',
        accent: '#FFF200',
        text: '#FFFFFF'
    },
    dark: {
        primary: '#000000',
        secondary: '#FFD700',
        accent: '#C0C0C0',
        text: '#FFFFFF'
    },
    silver: {
        primary: '#C0C0C0',
        secondary: '#1a1a1a',
        accent: '#4a90e2',
        text: '#000000'
    },
    blue: {
        primary: '#0066CC',
        secondary: '#FFFFFF',
        accent: '#003366',
        text: '#FFFFFF'
    }
};

// Generate logo based on style
function generateLogo(name, country, style, colorScheme) {
    const colors = colorSchemes[colorScheme];
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part[0]).join('').toUpperCase().substring(0, 3);
    const brandName = name.toUpperCase();

    let svg = '';

    switch (style) {
        case 'shield':
            svg = generateShieldLogo(brandName, initials, colors);
            break;
        case 'circle':
            svg = generateCircleLogo(brandName, initials, colors);
            break;
        case 'badge':
            svg = generateBadgeLogo(brandName, initials, colors);
            break;
        case 'minimal':
            svg = generateMinimalLogo(brandName, initials, colors);
            break;
        default:
            svg = generateShieldLogo(brandName, initials, colors);
    }

    return svg;
}

// Shield Logo Style (Ferrari-inspired with Prancing Horse)
function generateShieldLogo(name, initials, colors) {
    return `
        <svg viewBox="0 0 300 350" xmlns="http://www.w3.org/2000/svg" width="300" height="350">
            <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${darkenColor(colors.primary, 30)};stop-opacity:1" />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${colors.primary}" flood-opacity="0.6"/>
                </filter>
            </defs>

            <!-- Shield Shape -->
            <path d="M 150 20 L 270 80 L 270 180 Q 270 280 150 330 Q 30 280 30 180 L 30 80 Z"
                  fill="url(#shieldGrad)"
                  stroke="${colors.accent}"
                  stroke-width="4"
                  filter="url(#shadow)"/>

            <!-- Inner Border -->
            <path d="M 150 35 L 255 85 L 255 180 Q 255 270 150 315 Q 45 270 45 180 L 45 85 Z"
                  fill="none"
                  stroke="${colors.accent}"
                  stroke-width="2"
                  opacity="0.5"/>

            <!-- Top Banner -->
            <rect x="60" y="90" width="180" height="40"
                  fill="${colors.secondary}"
                  stroke="${colors.accent}"
                  stroke-width="2"/>

            <!-- Brand Initials -->
            <text x="150" y="118"
                  font-family="Arial, sans-serif"
                  font-size="24"
                  font-weight="900"
                  fill="${colors.accent}"
                  text-anchor="middle">
                ${initials}
            </text>

            <!-- Prancing Horse (Ferrari-style) -->
            <g transform="translate(150, 190)">
                <!-- Horse Body -->
                <path d="M -25,-20 Q -30,-15 -30,-5 L -28,10 Q -25,15 -20,15 L -15,15 Q -12,20 -8,20 L -5,18 L 0,25 L 5,18 L 8,20 Q 12,20 15,15 L 20,15 Q 25,15 28,10 L 30,-5 Q 30,-15 25,-20 L 20,-22 Q 15,-25 10,-25 L -10,-25 Q -15,-25 -20,-22 Z"
                      fill="${colors.accent}"
                      stroke="${colors.secondary}"
                      stroke-width="1.5"/>
                <!-- Horse Head & Neck -->
                <path d="M -10,-25 Q -15,-30 -18,-38 L -20,-45 Q -22,-50 -25,-52 L -30,-50 L -28,-45 Q -25,-40 -22,-35 L -15,-28"
                      fill="${colors.accent}"
                      stroke="${colors.secondary}"
                      stroke-width="1.5"/>
                <!-- Mane -->
                <path d="M -18,-38 L -22,-40 M -20,-43 L -24,-45 M -22,-48 L -26,-50"
                      stroke="${colors.secondary}"
                      stroke-width="1.5"
                      fill="none"/>
                <!-- Tail -->
                <path d="M 25,-18 Q 30,-15 35,-12 Q 38,-8 40,-5"
                      stroke="${colors.secondary}"
                      stroke-width="2"
                      fill="none"/>
                <!-- Legs -->
                <line x1="-15" y1="15" x2="-15" y2="30" stroke="${colors.secondary}" stroke-width="2"/>
                <line x1="-5" y1="18" x2="-5" y2="32" stroke="${colors.secondary}" stroke-width="2"/>
                <line x1="5" y1="18" x2="5" y2="32" stroke="${colors.secondary}" stroke-width="2"/>
                <line x1="15" y1="15" x2="15" y2="30" stroke="${colors.secondary}" stroke-width="2"/>
            </g>

            <!-- Brand Name -->
            <text x="150" y="245"
                  font-family="Arial, sans-serif"
                  font-size="${name.length > 10 ? 20 : 26}"
                  font-weight="900"
                  fill="${colors.text}"
                  text-anchor="middle">
                ${name}
            </text>

            <!-- Bottom Accent -->
            <path d="M 80 275 Q 150 285 220 275"
                  stroke="${colors.accent}"
                  stroke-width="3"
                  fill="none"/>
        </svg>
    `;
}

// Circle Logo Style (with Eagle Wings)
function generateCircleLogo(name, initials, colors) {
    return `
        <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" width="300" height="300">
            <defs>
                <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${darkenColor(colors.primary, 20)};stop-opacity:1" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <!-- Outer Circle -->
            <circle cx="150" cy="150" r="140"
                    fill="url(#circleGrad)"
                    stroke="${colors.accent}"
                    stroke-width="6"
                    filter="url(#glow)"/>

            <!-- Eagle Wings Spread -->
            <g transform="translate(150, 150)">
                <!-- Left Wing -->
                <path d="M -20,-10 Q -60,-30 -100,-15 Q -110,-10 -115,-5 Q -110,-8 -105,-10 Q -70,-22 -40,-12 L -30,-8 Q -25,-5 -20,-5 Z"
                      fill="${colors.accent}"
                      stroke="${colors.secondary}"
                      stroke-width="1.5"
                      opacity="0.9"/>
                <!-- Right Wing -->
                <path d="M 20,-10 Q 60,-30 100,-15 Q 110,-10 115,-5 Q 110,-8 105,-10 Q 70,-22 40,-12 L 30,-8 Q 25,-5 20,-5 Z"
                      fill="${colors.accent}"
                      stroke="${colors.secondary}"
                      stroke-width="1.5"
                      opacity="0.9"/>
                <!-- Eagle Body -->
                <ellipse cx="0" cy="0" rx="18" ry="25"
                         fill="${colors.accent}"
                         stroke="${colors.secondary}"
                         stroke-width="1.5"/>
                <!-- Eagle Head -->
                <circle cx="0" cy="-20" r="12"
                        fill="${colors.accent}"
                        stroke="${colors.secondary}"
                        stroke-width="1.5"/>
                <!-- Beak -->
                <path d="M 0,-20 L 8,-22 L 6,-20 Z"
                      fill="${colors.secondary}"/>
                <!-- Wing Feathers Detail -->
                <path d="M -40,-12 L -45,-18 M -50,-15 L -55,-20 M -60,-17 L -65,-22 M -70,-18 L -75,-23"
                      stroke="${colors.secondary}"
                      stroke-width="1"
                      fill="none"
                      opacity="0.7"/>
                <path d="M 40,-12 L 45,-18 M 50,-15 L 55,-20 M 60,-17 L 65,-22 M 70,-18 L 75,-23"
                      stroke="${colors.secondary}"
                      stroke-width="1"
                      fill="none"
                      opacity="0.7"/>
            </g>

            <!-- Inner Circle -->
            <circle cx="150" cy="150" r="120"
                    fill="none"
                    stroke="${colors.accent}"
                    stroke-width="2"
                    opacity="0.6"/>

            <!-- Center Circle for Initials -->
            <circle cx="150" cy="150" r="50"
                    fill="${colors.secondary}"
                    stroke="${colors.accent}"
                    stroke-width="3"/>

            <!-- Brand Initials -->
            <text x="150" y="160"
                  font-family="Arial, sans-serif"
                  font-size="32"
                  font-weight="900"
                  fill="${colors.accent}"
                  text-anchor="middle">
                ${initials}
            </text>

            <!-- Brand Name (Curved) -->
            <path id="circlePath" d="M 40,150 A 110,110 0 0,1 260,150" fill="none"/>
            <text font-family="Arial, sans-serif"
                  font-size="20"
                  font-weight="700"
                  fill="${colors.text}"
                  letter-spacing="4">
                <textPath href="#circlePath" startOffset="50%" text-anchor="middle">
                    ${name}
                </textPath>
            </text>
        </svg>
    `;
}

// Badge Logo Style (with Lion Head)
function generateBadgeLogo(name, initials, colors) {
    return `
        <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" width="320" height="380">
            <defs>
                <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${lightenColor(colors.primary, 10)};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${colors.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${darkenColor(colors.primary, 20)};stop-opacity:1" />
                </linearGradient>
                <filter id="badgeShadow">
                    <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.4"/>
                </filter>
            </defs>

            <!-- Badge Shape -->
            <path d="M 160 20 L 290 70 L 290 200 L 250 320 L 160 360 L 70 320 L 30 200 L 30 70 Z"
                  fill="url(#badgeGrad)"
                  stroke="${colors.accent}"
                  stroke-width="4"
                  filter="url(#badgeShadow)"/>

            <!-- Inner Frame -->
            <path d="M 160 40 L 270 80 L 270 195 L 235 305 L 160 340 L 85 305 L 50 195 L 50 80 Z"
                  fill="none"
                  stroke="${colors.accent}"
                  stroke-width="2"
                  opacity="0.4"/>

            <!-- Top Emblem -->
            <ellipse cx="160" cy="100" rx="80" ry="35"
                     fill="${colors.secondary}"
                     stroke="${colors.accent}"
                     stroke-width="3"/>

            <!-- Brand Initials -->
            <text x="160" y="110"
                  font-family="Arial, sans-serif"
                  font-size="28"
                  font-weight="900"
                  fill="${colors.accent}"
                  text-anchor="middle">
                ${initials}
            </text>

            <!-- Divider Line -->
            <line x1="70" y1="150" x2="250" y2="150"
                  stroke="${colors.accent}"
                  stroke-width="2"
                  opacity="0.6"/>

            <!-- Lion Head -->
            <g transform="translate(160, 195)">
                <!-- Lion Mane -->
                <circle cx="0" cy="0" r="35"
                        fill="${colors.accent}"
                        stroke="${colors.secondary}"
                        stroke-width="2"
                        opacity="0.8"/>
                <!-- Mane Spikes -->
                <path d="M 0,-35 L -5,-45 L 5,-45 Z M -25,-25 L -32,-32 L -22,-28 Z M 25,-25 L 32,-32 L 22,-28 Z M -32,5 L -40,5 L -35,-2 Z M 32,5 L 40,5 L 35,-2 Z M -18,30 L -22,38 L -14,33 Z M 18,30 L 22,38 L 14,33 Z"
                      fill="${colors.accent}"
                      stroke="${colors.secondary}"
                      stroke-width="1"
                      opacity="0.9"/>
                <!-- Lion Face -->
                <circle cx="0" cy="0" r="22"
                        fill="${colors.secondary}"
                        stroke="${colors.accent}"
                        stroke-width="2"/>
                <!-- Eyes -->
                <circle cx="-8" cy="-5" r="3" fill="${colors.accent}"/>
                <circle cx="8" cy="-5" r="3" fill="${colors.accent}"/>
                <!-- Nose -->
                <path d="M 0,0 L -3,5 L 3,5 Z"
                      fill="${colors.accent}"/>
                <!-- Mouth -->
                <path d="M -8,8 Q 0,12 8,8"
                      stroke="${colors.accent}"
                      stroke-width="2"
                      fill="none"/>
            </g>

            <!-- Brand Name -->
            <text x="160" y="255"
                  font-family="Arial, sans-serif"
                  font-size="${name.length > 12 ? 20 : 26}"
                  font-weight="900"
                  fill="${colors.text}"
                  text-anchor="middle">
                ${name}
            </text>

            <!-- Bottom Decoration -->
            <path d="M 100 290 L 160 305 L 220 290"
                  stroke="${colors.accent}"
                  stroke-width="3"
                  fill="none"/>
            <circle cx="160" cy="290" r="8" fill="${colors.accent}"/>
        </svg>
    `;
}

// Minimal Logo Style (with Bull Silhouette)
function generateMinimalLogo(name, initials, colors) {
    return `
        <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" width="300" height="300">
            <defs>
                <linearGradient id="minimalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
                </linearGradient>
            </defs>

            <!-- Simple Square Frame -->
            <rect x="30" y="30" width="240" height="240"
                  fill="none"
                  stroke="url(#minimalGrad)"
                  stroke-width="8"/>

            <!-- Inner Accent Lines -->
            <line x1="50" y1="50" x2="250" y2="50"
                  stroke="${colors.accent}"
                  stroke-width="2"
                  opacity="0.5"/>
            <line x1="50" y1="250" x2="250" y2="250"
                  stroke="${colors.accent}"
                  stroke-width="2"
                  opacity="0.5"/>

            <!-- Bull Silhouette (Lamborghini-style) -->
            <g transform="translate(150, 110)">
                <!-- Bull Head -->
                <path d="M -15,-25 Q -20,-30 -25,-32 L -30,-28 Q -28,-25 -25,-22 M 15,-25 Q 20,-30 25,-32 L 30,-28 Q 28,-25 25,-22"
                      stroke="${colors.primary}"
                      stroke-width="3"
                      fill="none"/>
                <!-- Bull Body -->
                <ellipse cx="0" cy="0" rx="30" ry="20"
                         fill="${colors.primary}"
                         opacity="0.9"/>
                <!-- Bull Legs -->
                <rect x="-22" y="15" width="6" height="15" fill="${colors.primary}"/>
                <rect x="-8" y="15" width="6" height="15" fill="${colors.primary}"/>
                <rect x="2" y="15" width="6" height="15" fill="${colors.primary}"/>
                <rect x="16" y="15" width="6" height="15" fill="${colors.primary}"/>
                <!-- Horns (Curved) -->
                <path d="M -15,-20 Q -22,-28 -28,-30 M 15,-20 Q 22,-28 28,-30"
                      stroke="${colors.primary}"
                      stroke-width="4"
                      stroke-linecap="round"
                      fill="none"/>
                <!-- Bull Tail -->
                <path d="M 30,0 Q 38,5 42,10"
                      stroke="${colors.primary}"
                      stroke-width="3"
                      fill="none"/>
            </g>

            <!-- Large Initials -->
            <text x="150" y="180"
                  font-family="Arial, sans-serif"
                  font-size="50"
                  font-weight="900"
                  fill="${colors.primary}"
                  text-anchor="middle">
                ${initials}
            </text>

            <!-- Brand Name Below -->
            <text x="150" y="220"
                  font-family="Arial, sans-serif"
                  font-size="18"
                  font-weight="700"
                  fill="${colors.secondary}"
                  text-anchor="middle"
                  letter-spacing="3">
                ${name}
            </text>

            <!-- Corner Accents -->
            <circle cx="30" cy="30" r="5" fill="${colors.accent}"/>
            <circle cx="270" cy="30" r="5" fill="${colors.accent}"/>
            <circle cx="30" cy="270" r="5" fill="${colors.accent}"/>
            <circle cx="270" cy="270" r="5" fill="${colors.accent}"/>
        </svg>
    `;
}

// Helper function to darken color
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Helper function to lighten color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Generate and display logo
function handleGenerate() {
    const carName = carNameInput.value.trim();
    const country = countrySelect.value;
    const logoStyle = logoStyleSelect.value;
    const colorScheme = colorSchemeSelect.value;

    if (!carName) {
        alert('Please enter a car brand name!');
        carNameInput.focus();
        return;
    }

    if (!country) {
        alert('Please select a country!');
        countrySelect.focus();
        return;
    }

    // Generate the logo
    const logoSVG = generateLogo(carName, country, logoStyle, colorScheme);

    // Store current logo
    currentLogo = {
        name: carName,
        country: country,
        style: logoStyle,
        colorScheme: colorScheme,
        svg: logoSVG,
        timestamp: Date.now()
    };

    // Display the logo
    logoPreview.innerHTML = logoSVG;
    logoPreview.classList.add('success-animation');
    setTimeout(() => logoPreview.classList.remove('success-animation'), 600);

    // Update info
    infoBrand.textContent = carName;
    infoCountry.textContent = country;
    infoStyle.textContent = logoStyle.charAt(0).toUpperCase() + logoStyle.slice(1);

    // Enable buttons
    downloadBtn.disabled = false;
    shareBtn.disabled = false;

    // Add to recent logos
    addToGallery(currentLogo);
}

// Add logo to gallery
function addToGallery(logo) {
    // Add to beginning of array
    recentLogos.unshift(logo);

    // Keep only last 12
    if (recentLogos.length > 12) {
        recentLogos = recentLogos.slice(0, 12);
    }

    saveRecentLogos();
    renderGallery();
}

// Render gallery
function renderGallery() {
    if (recentLogos.length === 0) {
        recentGallery.innerHTML = '<p class="gallery-empty">Your created logos will appear here</p>';
        return;
    }

    recentGallery.innerHTML = recentLogos.map((logo, index) => `
        <div class="gallery-item" onclick="loadLogoFromGallery(${index})">
            ${logo.svg}
            <div class="gallery-item-name">${logo.name}</div>
            <div class="gallery-item-country">${logo.country}</div>
        </div>
    `).join('');
}

// Load logo from gallery
window.loadLogoFromGallery = function(index) {
    const logo = recentLogos[index];

    // Populate form
    carNameInput.value = logo.name;
    countrySelect.value = logo.country;
    logoStyleSelect.value = logo.style;
    colorSchemeSelect.value = logo.colorScheme;

    // Display logo
    currentLogo = logo;
    logoPreview.innerHTML = logo.svg;

    // Update info
    infoBrand.textContent = logo.name;
    infoCountry.textContent = logo.country;
    infoStyle.textContent = logo.style.charAt(0).toUpperCase() + logo.style.slice(1);

    // Enable buttons
    downloadBtn.disabled = false;
    shareBtn.disabled = false;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Randomize inputs
function handleRandomize() {
    const randomNames = ['Veloce', 'Apex', 'Strada', 'Turismo', 'Corso', 'Rapido', 'Forza', 'Presto'];
    const countries = Array.from(countrySelect.options).filter(opt => opt.value).map(opt => opt.value);
    const styles = ['shield', 'circle', 'badge', 'minimal'];
    const schemes = ['ferrari', 'dark', 'silver', 'blue'];

    carNameInput.value = randomNames[Math.floor(Math.random() * randomNames.length)];
    countrySelect.value = countries[Math.floor(Math.random() * countries.length)];
    logoStyleSelect.value = styles[Math.floor(Math.random() * styles.length)];
    colorSchemeSelect.value = schemes[Math.floor(Math.random() * schemes.length)];

    // Auto generate after randomize
    setTimeout(() => handleGenerate(), 300);
}

// Download logo as SVG
function handleDownload() {
    if (!currentLogo) return;

    const blob = new Blob([currentLogo.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentLogo.name.replace(/\s+/g, '-')}-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Copy SVG to clipboard
async function handleShare() {
    if (!currentLogo) return;

    try {
        await navigator.clipboard.writeText(currentLogo.svg);
        shareBtn.textContent = 'Copied!';
        setTimeout(() => {
            shareBtn.textContent = 'Copy as SVG';
        }, 2000);
    } catch (err) {
        alert('Failed to copy to clipboard');
    }
}

// Event listeners
generateBtn.addEventListener('click', handleGenerate);
randomizeBtn.addEventListener('click', handleRandomize);
downloadBtn.addEventListener('click', handleDownload);
shareBtn.addEventListener('click', handleShare);

// Enter key to generate
carNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGenerate();
    }
});

// Initialize
loadRecentLogos();

// Add racing stripe effect to page
const stripe = document.createElement('div');
stripe.className = 'racing-stripe';
document.body.prepend(stripe);

// iPad and touch device optimizations
(function initTouchOptimizations() {
    // Detect if device is iPad or touch-enabled
    const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isIPad || isTouchDevice) {
        // Prevent double-tap zoom on buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.click();
            }, { passive: false });
        });

        // Add touch feedback to gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });

            item.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
        });

        // Improve scrolling performance
        document.body.style.overflow = 'auto';
        document.body.style.webkitOverflowScrolling = 'touch';

        // Add visual feedback for button presses
        document.querySelectorAll('button, .gallery-item').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            }, { passive: true });

            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.opacity = '';
                }, 150);
            }, { passive: true });
        });

        // Prevent pull-to-refresh interfering with scrolling
        let startY = 0;
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].pageY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].pageY;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Prevent pull-to-refresh at top of page
            if (scrollTop <= 0 && currentY > startY) {
                e.preventDefault();
            }
        }, { passive: false });

        // Add orientation change handling
        window.addEventListener('orientationchange', () => {
            // Scroll to top on orientation change for better UX
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });

        console.log('✓ Touch optimizations enabled for iPad/tablet');
    }
})();

// Update gallery rendering to include touch handlers
const originalRenderGallery = renderGallery;
renderGallery = function() {
    originalRenderGallery();

    // Re-attach touch handlers to new gallery items
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            }, { passive: true });

            item.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.opacity = '';
                }, 150);
            }, { passive: true });
        });
    }
};
