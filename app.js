// Get DOM elements
const topicInput = document.getElementById('topicInput');
const generateBtn = document.getElementById('generateBtn');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const beatBtn = document.getElementById('beatBtn');
const lyricsContainer = document.getElementById('lyricsContainer');
const rapCount = document.getElementById('rapCount');
const downloadBtn = document.getElementById('downloadBtn');
const achievementBadge = document.getElementById('achievementBadge');

// State
let currentLyrics = [];
let currentTopic = '';
let rapGeneratedCount = 0;
let isPlaying = false;
let isBeatPlaying = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let audioContext = null;
let beatInterval = null;

// Rap generation templates and rhyme schemes
const rapTemplates = [
    {
        pattern: [
            "Yo, listen up, let me tell you 'bout {topic}",
            "It's the hottest thing, you know I gotta flaunt it",
            "{topic} on my mind, every single day",
            "Can't get enough of it, that's all I gotta say"
        ]
    },
    {
        pattern: [
            "Check it, {topic} is what I'm here to speak",
            "From Monday to Sunday, every day of the week",
            "Got me feeling fly, reaching for the peak",
            "When it comes to {topic}, I'm totally unique"
        ]
    },
    {
        pattern: [
            "Uh, yeah, {topic} in the building tonight",
            "Everything's incredible, everything's so right",
            "Taking over the world with all our might",
            "{topic} shining bright like a spotlight"
        ]
    },
    {
        pattern: [
            "Boom bap, {topic} hits different, you see",
            "Revolutionary vibes, setting spirits free",
            "From the ground to the sky, it's a guarantee",
            "When you roll with {topic}, that's the place to be"
        ]
    },
    {
        pattern: [
            "Straight fire, {topic} burning up the scene",
            "Hottest thing around, if you know what I mean",
            "Living large, living life, living the dream",
            "With {topic} by my side, I'm the supreme"
        ]
    }
];

const verseExtensions = [
    "Breaking barriers, yeah we innovate",
    "No hesitation, we appreciate",
    "Top of the game, we dominate",
    "Watch us rise, we celebrate",
    "This is real, it ain't debate",
    "Making moves, can't replicate",
    "Energy high, we radiate",
    "On our grind, we never late"
];

const hooks = [
    [
        "{topic}, {topic}, got me feeling so alive",
        "Every moment with it, yeah I truly thrive",
        "{topic}, {topic}, this is how we survive",
        "Taking it to levels, watch us dive"
    ],
    [
        "Yeah, {topic} in my heart (in my heart)",
        "Been there from the very start (from the start)",
        "{topic} is the art (is the art)",
        "Never gonna fall apart (fall apart)"
    ],
    [
        "Can't stop, won't stop, {topic} all day",
        "Living life in our own way",
        "From the night into the day",
        "This is what I gotta say"
    ]
];

// Generate rap lyrics
function generateRapLyrics(topic) {
    if (!topic || topic.trim() === '') {
        alert('Please enter a topic for your rap!');
        return null;
    }

    const lyrics = [];

    // Add title
    lyrics.push(`=== ${topic.toUpperCase()} ===`);
    lyrics.push('');

    // Verse 1
    lyrics.push('[Verse 1]');
    const template = rapTemplates[Math.floor(Math.random() * rapTemplates.length)];
    template.pattern.forEach(line => {
        lyrics.push(line.replace(/{topic}/g, topic));
    });

    // Add 2 random extensions
    for (let i = 0; i < 2; i++) {
        const extension = verseExtensions[Math.floor(Math.random() * verseExtensions.length)];
        lyrics.push(extension);
    }
    lyrics.push('');

    // Hook
    lyrics.push('[Hook]');
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    hook.forEach(line => {
        lyrics.push(line.replace(/{topic}/g, topic));
    });
    lyrics.push('');

    // Verse 2
    lyrics.push('[Verse 2]');
    const template2 = rapTemplates[Math.floor(Math.random() * rapTemplates.length)];
    template2.pattern.forEach(line => {
        lyrics.push(line.replace(/{topic}/g, topic));
    });

    // Add 2 more random extensions
    for (let i = 0; i < 2; i++) {
        const extension = verseExtensions[Math.floor(Math.random() * verseExtensions.length)];
        lyrics.push(extension);
    }
    lyrics.push('');

    // Outro
    lyrics.push('[Outro]');
    lyrics.push(`Yeah, ${topic}, that's what's up`);
    lyrics.push("Can't get enough, we filling the cup");
    lyrics.push("From the bottom to the top");
    lyrics.push(`${topic} never gonna stop!`);

    return lyrics;
}

// Display lyrics
function displayLyrics(lyrics) {
    lyricsContainer.innerHTML = '';

    lyrics.forEach((line, index) => {
        const lineDiv = document.createElement('div');

        if (line.startsWith('===') || line.startsWith('[')) {
            lineDiv.className = 'topic-title';
        } else if (line.trim() === '') {
            lineDiv.innerHTML = '<br>';
            lyricsContainer.appendChild(lineDiv);
            return;
        } else {
            lineDiv.className = 'lyrics-line';
        }

        lineDiv.textContent = line;
        lineDiv.dataset.index = index;
        lyricsContainer.appendChild(lineDiv);
    });
}

// Generate beat using Web Audio API
function createBeat() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioContext.currentTime;

    // Kick drum
    const kick = audioContext.createOscillator();
    const kickGain = audioContext.createGain();
    kick.connect(kickGain);
    kickGain.connect(audioContext.destination);
    kick.frequency.value = 60;
    kickGain.gain.setValueAtTime(1, now);
    kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    kick.start(now);
    kick.stop(now + 0.5);

    // Hi-hat
    const hihat = audioContext.createOscillator();
    const hihatGain = audioContext.createGain();
    const hihatFilter = audioContext.createBiquadFilter();
    hihat.connect(hihatFilter);
    hihatFilter.connect(hihatGain);
    hihatGain.connect(audioContext.destination);
    hihat.frequency.value = 8000;
    hihatFilter.type = 'highpass';
    hihatFilter.frequency.value = 7000;
    hihatGain.gain.setValueAtTime(0.3, now);
    hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    hihat.start(now);
    hihat.stop(now + 0.1);
}

// Toggle beat
function toggleBeat() {
    if (isBeatPlaying) {
        // Stop beat
        if (beatInterval) {
            clearInterval(beatInterval);
            beatInterval = null;
        }
        isBeatPlaying = false;
        beatBtn.classList.remove('active');
    } else {
        // Start beat
        isBeatPlaying = true;
        beatBtn.classList.add('active');

        // Create beat every 500ms (120 BPM)
        beatInterval = setInterval(() => {
            createBeat();
        }, 500);
    }
}

// Play rap with text-to-speech
function playRap() {
    if (currentLyrics.length === 0) return;

    // Stop any current playback
    stopRap();

    isPlaying = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;

    // Filter out empty lines and section markers
    const spokenLyrics = currentLyrics.filter(line => {
        return line.trim() !== '' &&
               !line.startsWith('===') &&
               !line.startsWith('[');
    });

    // Create combined text
    const text = spokenLyrics.join('. ');

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 1.3; // Faster for rap
    currentUtterance.pitch = 1.0;
    currentUtterance.volume = 1.0;

    // Find a voice (prefer male voices for rap)
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
        voice.name.includes('Male') ||
        voice.name.includes('Guy') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Google US English')
    );

    if (preferredVoice) {
        currentUtterance.voice = preferredVoice;
    }

    // Highlight lines as they're spoken
    let currentLineIndex = 0;
    currentUtterance.onboundary = (event) => {
        // Remove previous highlights
        document.querySelectorAll('.lyrics-line.highlight').forEach(el => {
            el.classList.remove('highlight');
        });

        // Highlight current line
        if (currentLineIndex < spokenLyrics.length) {
            const allLines = document.querySelectorAll('.lyrics-line');
            if (allLines[currentLineIndex]) {
                allLines[currentLineIndex].classList.add('highlight');
                allLines[currentLineIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    currentUtterance.onend = () => {
        stopRap();
    };

    speechSynthesis.speak(currentUtterance);
}

// Stop rap playback
function stopRap() {
    if (currentUtterance) {
        speechSynthesis.cancel();
        currentUtterance = null;
    }

    // Remove highlights
    document.querySelectorAll('.lyrics-line.highlight').forEach(el => {
        el.classList.remove('highlight');
    });

    isPlaying = false;
    playBtn.disabled = false;
    stopBtn.disabled = true;
}

// Show achievement badge
function showAchievementBadge() {
    const messages = [
        { icon: '🎤', text: 'Fire Bars!', sub: 'Rap Generated' },
        { icon: '🔥', text: 'Straight Fire!', sub: 'You\'re a Lyricist!' },
        { icon: '💎', text: 'Diamond Bars!', sub: 'Pure Gold!' },
        { icon: '⭐', text: 'Superstar!', sub: 'Keep Spitting!' },
        { icon: '👑', text: 'Rap Royalty!', sub: 'Crowned!' }
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];
    achievementBadge.querySelector('.badge-icon').textContent = msg.icon;
    achievementBadge.querySelector('.badge-text').textContent = msg.text;
    achievementBadge.querySelector('.badge-subtext').textContent = msg.sub;

    achievementBadge.classList.add('show');

    // Create confetti
    createConfetti();

    // Hide after 2 seconds
    setTimeout(() => {
        achievementBadge.classList.remove('show');
    }, 2000);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff1493', '#ff69b4', '#fff', '#ffc0cb', '#ffd700'];
    const count = 50;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

// Download lyrics as text file
function downloadLyrics() {
    if (currentLyrics.length === 0) return;

    const text = currentLyrics.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTopic.replace(/\s+/g, '_')}_rap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event Listeners
generateBtn.addEventListener('click', () => {
    const topic = topicInput.value.trim();

    if (!topic) {
        alert('Please enter a topic!');
        return;
    }

    const lyrics = generateRapLyrics(topic);

    if (lyrics) {
        currentLyrics = lyrics;
        currentTopic = topic;
        displayLyrics(lyrics);

        // Update stats
        rapGeneratedCount++;
        rapCount.textContent = `${rapGeneratedCount} rap${rapGeneratedCount !== 1 ? 's' : ''} generated`;

        // Enable controls
        playBtn.disabled = false;
        downloadBtn.disabled = false;

        // Show achievement
        showAchievementBadge();

        // Clear input
        topicInput.value = '';
    }
});

topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateBtn.click();
    }
});

playBtn.addEventListener('click', playRap);
stopBtn.addEventListener('click', stopRap);
beatBtn.addEventListener('click', toggleBeat);
downloadBtn.addEventListener('click', downloadLyrics);

// Load voices when available
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
    };
}

// Initialize
rapCount.textContent = '0 raps generated';
