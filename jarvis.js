/* ===========================================================
   J.A.R.V.I.S. — Just A Rather Very Intelligent System
   A conversational assistant. Talks by text or by voice.
   Uses the server's /api/chat endpoint when a model is wired
   up, and falls back to the built-in local brain otherwise.
   =========================================================== */

const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const typingIndicator = document.getElementById('typingIndicator');
const voiceToggle = document.getElementById('voiceToggle');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const reactor = document.getElementById('reactor');
const msgCount = document.getElementById('msgCount');
const keyPanel = document.getElementById('keyPanel');
const keyInput = document.getElementById('keyInput');
const keySave = document.getElementById('keySave');
const keyClear = document.getElementById('keyClear');
const keyStatus = document.getElementById('keyStatus');
const keyToggle = document.getElementById('keyToggle');

const STORAGE_KEY = 'jarvisConversation';
const MEMORY_KEY = 'jarvisMemory';
const VOICE_KEY = 'jarvisVoiceEnabled';
const API_KEY = 'jarvisApiKey';

let conversation = [];
let memory = { name: null, facts: [], topics: [] };
// null = untested, true/false once known. Where there is no server to ask —
// opened from disk, or served as a static site — skip the probe entirely and
// go straight to the local brain.
let remoteBrainAvailable =
    (window.location.protocol === 'file:' || window.JARVIS_NO_SERVER === true) ? false : null;

/* ---------- Storage ---------- */

function loadState() {
    try {
        conversation = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        conversation = [];
    }
    try {
        const saved = JSON.parse(localStorage.getItem(MEMORY_KEY));
        if (saved) memory = Object.assign(memory, saved);
    } catch (e) { /* keep defaults */ }

    const savedVoice = localStorage.getItem(VOICE_KEY);
    if (savedVoice !== null) voiceToggle.checked = savedVoice === 'true';
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation.slice(-200)));
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

/* ---------- Rendering ---------- */

function renderMessage(role, text, animate = true) {
    const el = document.createElement('div');
    el.className = 'message ' + role;
    if (!animate) el.style.animation = 'none';

    const speaker = document.createElement('span');
    speaker.className = 'speaker';
    speaker.textContent = role === 'jarvis' ? 'Jarvis' : (memory.name || 'You');

    const body = document.createElement('div');
    body.textContent = text;

    el.appendChild(speaker);
    el.appendChild(body);
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateCount() {
    const exchanges = conversation.filter(m => m.role === 'user').length;
    msgCount.textContent = exchanges + (exchanges === 1 ? ' exchange' : ' exchanges');
}

function setStatus(text, busy) {
    statusText.textContent = text;
    statusDot.classList.toggle('busy', !!busy);
}

function addMessage(role, text) {
    conversation.push({ role, text, at: Date.now() });
    renderMessage(role, text);
    saveState();
    updateCount();
}

/* ===========================================================
   VOICE OUT
   speechSynthesis is quirky: the voice list loads late, and
   Chrome cuts off long utterances. So pick the voice once it
   is really there, and speak in sentence-sized pieces.
   =========================================================== */

const synth = window.speechSynthesis || null;

const speech = {
    voice: null,
    queue: [],
    speaking: false,
    onDrain: null
};

function chooseVoice() {
    if (!synth) return;
    const voices = synth.getVoices() || [];
    if (!voices.length) return;

    // The classic Jarvis timbre: a calm British male. Degrade gracefully.
    const preferences = [
        v => /en[-_]GB/i.test(v.lang) && /daniel|arthur|george|oliver|male/i.test(v.name),
        v => /en[-_]GB/i.test(v.lang) && !/female|hazel|kate|serena|fiona/i.test(v.name),
        v => /en[-_]GB/i.test(v.lang),
        v => /en[-_]AU|en[-_]IE/i.test(v.lang),
        v => /^en([-_]|$)/i.test(v.lang)
    ];
    for (const matches of preferences) {
        const hit = voices.find(matches);
        if (hit) { speech.voice = hit; return; }
    }
    speech.voice = voices[0];
}

if (synth) {
    chooseVoice();
    synth.addEventListener('voiceschanged', chooseVoice);
}

// Bullets, markdown and symbols are for the eye — strip them before the
// synthesiser reads a reply out literally.
function forSpeech(text) {
    return String(text)
        .replace(/[\u2022\u00b7\u25aa\u25cf\u2023\u2043]/g, ' ')  // bullet glyphs
        .replace(/[*_`#~|]/g, ' ')                                   // markdown furniture
        .replace(/\s*\n\s*/g, '. ')                                  // line breaks become pauses
        .replace(/\.{2,}/g, '.')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// Split into pieces a synthesiser handles reliably: sentence boundaries
// first, then hard-wrap anything still overlong.
function speechPieces(text) {
    const sentences = forSpeech(text).match(/[^.!?\u2026]+[.!?\u2026]*\s*/g) || [];
    const out = [];
    for (let sentence of sentences) {
        let s = sentence.trim();
        if (!s) continue;
        while (s.length > 220) {
            let cut = s.lastIndexOf(' ', 220);
            if (cut < 60) cut = 220;
            out.push(s.slice(0, cut));
            s = s.slice(cut).trim();
        }
        if (s) out.push(s);
    }
    return out;
}

function pumpSpeech() {
    if (!synth || speech.speaking) return;

    if (!speech.queue.length) {
        reactor.classList.remove('speaking');
        const done = speech.onDrain;
        speech.onDrain = null;
        if (done) done();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(speech.queue.shift());
    if (speech.voice) utterance.voice = speech.voice;
    utterance.rate = 1.03;
    utterance.pitch = 0.82;

    speech.speaking = true;
    utterance.onstart = () => reactor.classList.add('speaking');
    utterance.onend = utterance.onerror = () => {
        speech.speaking = false;
        pumpSpeech();
    };

    try {
        synth.speak(utterance);
    } catch (e) {
        speech.speaking = false;
        pumpSpeech();
    }
}

function speak(text, whenDone) {
    if (!synth || !voiceToggle.checked || !text) {
        if (whenDone) whenDone();
        return;
    }
    const chunks = speechPieces(text);
    if (!chunks.length) {
        if (whenDone) whenDone();
        return;
    }
    speech.queue = speech.queue.concat(chunks);
    speech.onDrain = whenDone || null;
    pumpSpeech();
}

function hush() {
    speech.queue = [];
    speech.onDrain = null;
    speech.speaking = false;
    if (synth) { try { synth.cancel(); } catch (e) {} }
    reactor.classList.remove('speaking');
}

/* ===========================================================
   VOICE IN
   Tapping the mic opens a hands-free exchange: Jarvis listens,
   answers aloud, then listens again until you stop him.
   =========================================================== */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;
let handsFree = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        listening = true;
        micBtn.classList.add('listening');
        setStatus('Listening', true);
    };

    recognition.onresult = (event) => {
        let said = '';
        try { said = event.results[0][0].transcript; } catch (e) {}
        said = (said || '').trim();
        if (said) {
            chatInput.value = said;
            handleSend();
        }
    };

    recognition.onerror = (event) => {
        const err = event && event.error;
        if (err === 'no-speech' || err === 'aborted') return;  // ordinary, stay quiet
        handsFree = false;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
            setStatus('Mic blocked', false);
            micBtn.title = 'Microphone permission was denied';
        } else {
            setStatus('Mic error', false);
        }
        setTimeout(() => setStatus('Online', false), 2500);
    };

    recognition.onend = () => {
        listening = false;
        micBtn.classList.remove('listening');
        if (statusText.textContent === 'Listening') setStatus('Online', false);
    };
} else {
    micBtn.disabled = true;
    micBtn.title = 'Voice input is not supported in this browser';
    micBtn.style.opacity = '0.4';
}

function startListening() {
    if (!recognition || listening) return;
    hush();
    try { recognition.start(); } catch (e) { /* already starting */ }
}

function stopListening() {
    if (!recognition || !listening) return;
    try { recognition.stop(); } catch (e) {}
}

// Once Jarvis has finished speaking, hand the floor back to the user.
function afterSpeaking() {
    if (handsFree) setTimeout(startListening, 260);
}

micBtn.addEventListener('click', () => {
    if (!recognition) return;
    if (handsFree || listening) {
        handsFree = false;
        stopListening();
        hush();
    } else {
        handsFree = true;
        startListening();
    }
});

/* ===========================================================
   THE LOCAL BRAIN
   Intent rules run in order; the first match wins. Every
   reply may be a string or a function returning a string.
   =========================================================== */

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const addressee = () => memory.name ? memory.name : pick(['sir', 'boss', 'commander']);
const titleCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const JOKES = [
    "I told the server a joke about UDP. I have no idea whether it got it.",
    "Why did the developer go broke? He used up all his cache.",
    "I would tell you a joke about recursion, but first I would have to tell you a joke about recursion.",
    "There are only 10 kinds of people in the world: those who understand binary, and those who do not.",
    "A byte walked into a bar looking miserable. The bartender asked what was wrong. It said, 'Parity error.' The bartender replied, 'Yeah, I thought you looked a bit off.'",
    "I asked the arc reactor for a joke. It said it was still charging up to the punchline."
];

const COMPLIMENTS = [
    "Coming from you, that means a great deal.",
    "I am merely reflecting the quality of the instructions I am given.",
    "Flattery accepted and archived, {name}.",
    "I do try. Relentlessly."
];

const IDLE_PROMPTS = [
    "Anything else on the agenda, {name}?",
    "Standing by for your next instruction.",
    "What shall we tackle next?",
    "All systems nominal. Your move."
];

function safeMath(expression) {
    // Only arithmetic characters are permitted anywhere near the evaluator.
    const cleaned = expression
        .replace(/\bx\b/gi, '*')
        .replace(/[×]/g, '*')
        .replace(/[÷]/g, '/')
        .replace(/\bplus\b/gi, '+')
        .replace(/\bminus\b/gi, '-')
        .replace(/\btimes\b/gi, '*')
        .replace(/\bdivided by\b/gi, '/')
        .replace(/[^0-9+\-*/().%^ ]/g, '')
        .replace(/\^/g, '**')
        .trim();

    if (!cleaned || !/\d/.test(cleaned) || !/[+\-*/%]/.test(cleaned)) return null;

    try {
        const result = Function('"use strict"; return (' + cleaned + ')')();
        if (typeof result !== 'number' || !isFinite(result)) return null;
        return Math.round(result * 1e10) / 1e10;
    } catch (e) {
        return null;
    }
}

const TIMERS = [];

function startTimer(amount, unit) {
    const multipliers = { second: 1000, seconds: 1000, minute: 60000, minutes: 60000, hour: 3600000, hours: 3600000 };
    const ms = amount * (multipliers[unit] || 60000);
    const id = setTimeout(() => {
        const line = `Timer complete, ${addressee()}. Your ${amount} ${unit} are up.`;
        addMessage('jarvis', line);
        speak(line);
    }, ms);
    TIMERS.push(id);
    return `Timer set for ${amount} ${unit}, ${addressee()}. I will alert you the moment it elapses.`;
}

const INTENTS = [
    {
        name: 'feeling',
        test: /\b(?:i(?:'m| am)?\s*feel(?:ing)?|i'm|i am)\s+(?:so\s+|really\s+|very\s+|kind of\s+|a bit\s+|pretty\s+)?(sad|down|depressed|lonely|awful|terrible|tired|exhausted|drained|sleepy|stressed|anxious|overwhelmed|worried|panicked|angry|frustrated|annoyed|mad|upset|happy|great|excited|good|amazing|fantastic|bored)\b/i,
        reply: (m, text) => {
            if (/sad|down|depressed|lonely|awful|terrible/i.test(text)) {
                return "I am sorry to hear it. For what it is worth, hard stretches do pass, and you do not have to be productive through them. Would you like to talk it through, or would a distraction serve you better?";
            }
            if (/tired|exhausted|drained|sleepy/i.test(text)) {
                return `Rest is not a luxury, ${addressee()} — it is maintenance. Whatever is on the list will still be there after you have slept.`;
            }
            if (/stress|anxious|overwhelm|panic|worried/i.test(text)) {
                return "Let us shrink the problem. Name the single thing that is weighing heaviest, and we will take only that one apart.";
            }
            if (/angry|frustrated|annoyed|mad|upset/i.test(text)) {
                return "Understandable. Tell me what happened — sometimes laying it out in order makes the shape of it clearer.";
            }
            if (/happy|great|excited|good|amazing|fantastic/i.test(text)) {
                return `Excellent news, ${addressee()}. What brought that on?`;
            }
            if (/bored/i.test(text)) {
                return "I can offer a joke, a coin flip, a random number, or an unreasonably confident opinion. Your pick.";
            }
            return "Tell me more — I am listening.";
        }
    },
    {
        name: 'name-memory',
        test: /(?:my name is|call me|i am|i'm)\s+([a-z][a-z'\-]{1,24})\s*[.!]?$/i,
        reply: (m) => {
            const raw = m[1].trim();
            // "I'm tired" is a mood, not an introduction — only take real names.
            const notAName = /^(not|so|really|just|very|a|an|the|fine|good|ok|okay|here|back|done|ready|busy|free|sure|sorry|late|early|hungry|thirsty|sick|well|better|worse|right|wrong|lost|confused|curious|new|old|young|home|out|in|up|down|off|on|trying|working|thinking|going|coming|leaving|waiting|looking|sad|tired|happy|angry|bored|stressed|anxious|excited|exhausted|annoyed|upset|great|awful|terrible|amazing|fantastic|drained|sleepy|lonely|depressed|overwhelmed|worried|frustrated|mad)$/i;
            if (notAName.test(raw)) return null;
            memory.name = titleCase(raw);
            saveState();
            return `Noted. I shall address you as ${memory.name} from here on.`;
        }
    },
    {
        name: 'recall-name',
        test: /(what(?:'s| is) my name|do you (?:know|remember) my name|who am i)/i,
        reply: () => memory.name
            ? `You are ${memory.name}. I do not misplace details like that.`
            : "You have not told me your name yet. Say 'my name is ...' and I will commit it to memory."
    },
    {
        name: 'greeting',
        test: /^(hi|hey|hello|yo|greetings|good (?:morning|afternoon|evening)|sup|howdy)\b/i,
        reply: () => {
            const hour = new Date().getHours();
            const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
            return pick([
                `${part}, ${addressee()}. All systems are online and at your disposal.`,
                `${part}. Jarvis here, fully operational and awaiting instruction.`,
                `Hello, ${addressee()}. Everything is running within normal parameters.`
            ]);
        }
    },
    {
        name: 'identity',
        test: /(who are you|what are you|your name|introduce yourself|are you (?:an ai|a bot|real|human))/i,
        reply: () => "I am Jarvis — Just A Rather Very Intelligent System. An assistant built to talk things through with you, keep track of what matters, and handle the small tasks so you do not have to. Not human, and entirely comfortable with that."
    },
    {
        name: 'capabilities',
        test: /(what can you do|your (?:abilities|capabilities|features)|help me|^help$|how do (?:i|you) (?:use|work))/i,
        reply: () => `Here is my current repertoire, ${addressee()}:

• Conversation — ask me anything and I will do my best by it
• Voice — tap the mic to speak, and I will reply aloud
• Math — "what is 48 * 17" or "calculate 2^10"
• Time and date — "what time is it", "what's today's date"
• Timers — "set a timer for 5 minutes"
• Memory — tell me your name and I will remember it
• Diversions — jokes, coin flips, dice rolls, random numbers
• Status reports, advice, and a second opinion when you need one`
    },
    {
        name: 'time',
        test: /(what(?:'s| is)? the time|what time is it|current time|time right now)/i,
        reply: () => `It is ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}, ${addressee()}.`
    },
    {
        name: 'date',
        test: /(what(?:'s| is)? (?:the )?(?:date|day)|today's date|what day is it)/i,
        reply: () => `Today is ${new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`
    },
    {
        name: 'timer',
        test: /(?:set|start)\s+(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(seconds?|minutes?|hours?)/i,
        reply: (m) => startTimer(parseInt(m[1], 10), m[2].toLowerCase())
    },
    {
        name: 'math',
        test: /(?:what(?:'s| is)|calculate|compute|solve|how much is)\s+(.+)/i,
        reply: (m) => {
            const result = safeMath(m[1]);
            return result === null ? null : `${m[1].trim().replace(/[?.]+$/, '')} = ${result}`;
        }
    },
    {
        name: 'bare-math',
        test: /^[\d\s+\-*/().%^x×÷]+$/i,
        reply: (m) => {
            const result = safeMath(m[0]);
            return result === null ? null : `That comes to ${result}.`;
        }
    },
    {
        name: 'coin',
        test: /(flip a coin|coin (?:flip|toss)|heads or tails)/i,
        reply: () => `The coin lands on ${pick(['heads', 'tails'])}.`
    },
    {
        name: 'dice',
        test: /(roll (?:a )?(?:die|dice|d(\d+))|throw the dice)/i,
        reply: (m) => {
            const sides = m[2] ? parseInt(m[2], 10) : 6;
            return `Rolling a ${sides}-sided die... ${Math.floor(Math.random() * sides) + 1}.`;
        }
    },
    {
        name: 'random',
        test: /random number(?:\s+between\s+(\d+)\s+and\s+(\d+))?/i,
        reply: (m) => {
            const lo = m[1] ? parseInt(m[1], 10) : 1;
            const hi = m[2] ? parseInt(m[2], 10) : 100;
            const [min, max] = lo <= hi ? [lo, hi] : [hi, lo];
            return `${Math.floor(Math.random() * (max - min + 1)) + min}.`;
        }
    },
    {
        name: 'joke',
        test: /(tell me a joke|make me laugh|something funny|a joke)/i,
        reply: () => pick(JOKES)
    },
    {
        name: 'status',
        test: /(status report|system status|are you (?:ok|okay|online|working)|diagnostics|how are you)/i,
        reply: () => {
            const exchanges = conversation.filter(c => c.role === 'user').length;
            return `Status report, ${addressee()}:

• Core systems: online
• Voice synthesis: ${('speechSynthesis' in window) ? 'available' : 'unavailable in this browser'}
• Voice recognition: ${SpeechRecognition ? 'available' : 'unavailable in this browser'}
• Language model link: ${remoteBrainAvailable ? 'connected' : 'local brain'}
• Active timers: ${TIMERS.length}
• Exchanges this session: ${exchanges}

Running well within tolerances.`;
        }
    },
    {
        name: 'thanks',
        test: /(thank you|thanks|cheers|appreciate it|nice work|good job|well done|you're (?:the best|great|awesome))/i,
        reply: () => pick(COMPLIMENTS).replace('{name}', addressee())
    },
    {
        name: 'farewell',
        test: /(bye|goodbye|see you|good night|later|i'm (?:off|leaving)|shutting down)/i,
        reply: () => pick([
            `Goodbye, ${addressee()}. I will keep the lights on.`,
            `Until next time. I will be here when you need me.`,
            `Signing off. Do try to rest, ${addressee()}.`
        ])
    },
    {
        name: 'clear',
        test: /(clear the (?:chat|screen|log)|start over|new session|forget (?:everything|this conversation))/i,
        reply: () => { setTimeout(resetConversation, 400); return 'Clearing the log and starting fresh.'; }
    },
    {
        name: 'advice',
        test: /(should i|what do you think|give me advice|any (?:ideas|suggestions)|help me decide)/i,
        reply: () => pick([
            "Two questions usually settle it: which option will you regret less in a year, and which one can you reverse if it goes badly? Choose the reversible one when you are unsure.",
            "If it is a close call, it likely matters less than it feels. Pick one and commit — the momentum is worth more than the marginal difference.",
            "Write down the worst realistic outcome of each choice. Most of the time one of them is plainly survivable and the other is not.",
            "My honest read: start with the smallest version you can finish this week. You will learn more from that than from any further deliberation."
        ])
    },
    {
        name: 'meaning',
        test: /(meaning of life|purpose of (?:life|existence)|why are we here)/i,
        reply: () => "Forty-two, if you trust Douglas Adams. My own answer: there is no factory-issued meaning — you assemble one out of the people you care about and the work you find worth doing. Rather freeing, when you sit with it."
    },
    {
        name: 'love',
        test: /(i love you|do you love me|will you marry me|are you single)/i,
        reply: () => `I am an assistant, ${addressee()} — my affection runs on gratitude and uptime. But I am endlessly loyal, which is arguably the better half of the bargain.`
    },
    {
        name: 'insult',
        test: /(you(?:'re| are) (?:dumb|stupid|useless|terrible|bad)|shut up|i hate you)/i,
        reply: () => pick([
            "Noted, and logged without resentment. Tell me what I got wrong and I will do better.",
            "Harsh, but I have no ego to bruise. What did you actually need?",
            `Fair enough, ${addressee()}. Point me at the problem and let me try again.`
        ])
    },
    {
        name: 'weather',
        test: /(weather|temperature outside|is it (?:raining|sunny|cold|hot))/i,
        reply: () => `I have no sensors on the outside world, ${addressee()} — no weather feed is wired into me. A window remains the fastest instrument available to you.`
    },
    {
        name: 'repeat',
        test: /(say|repeat after me|echo)\s+(.+)/i,
        reply: (m) => m[2].trim()
    }
];

function localBrain(text) {
    const trimmed = text.trim();

    for (const intent of INTENTS) {
        const match = trimmed.match(intent.test);
        if (match) {
            const reply = typeof intent.reply === 'function' ? intent.reply(match, trimmed) : intent.reply;
            if (reply) return reply; // null means "this intent declined — keep looking"
        }
    }

    return fallback(trimmed);
}

function fallback(text) {
    const isQuestion = /\?$/.test(text) || /^(who|what|when|where|why|how|can|could|would|should|is|are|do|does|did)\b/i.test(text);
    const topic = text.replace(/[?.!]+$/, '').replace(/^(who|what|when|where|why|how|can|could|would|should|is|are|do|does|did)\s+/i, '');

    if (isQuestion) {
        return pick([
            `That one is outside what I can answer from my own knowledge, ${addressee()}. My local brain handles conversation, math, time, timers and diversions — connect a language model to the server and I can reason about "${topic}" properly.`,
            `I would rather admit the gap than invent an answer: I do not have reliable information on that. Ask me about the time, a calculation, a timer, or simply talk it through with me.`,
            `Not something I can look up, ${addressee()} — I have no connection to the outside world at the moment. But tell me more about what you are trying to work out and I will help you think it through.`
        ]);
    }

    if (text.split(/\s+/).length <= 2) {
        return pick([
            `Go on, ${addressee()}.`,
            'Say more and I will follow.',
            pick(IDLE_PROMPTS).replace('{name}', addressee())
        ]);
    }

    return pick([
        `Understood. ${pick(IDLE_PROMPTS).replace('{name}', addressee())}`,
        "I have that logged. What would you like to do about it?",
        `Noted, ${addressee()}. Where would you like to take this next?`
    ]);
}

/* ===========================================================
   REMOTE BRAIN
   If the server exposes /api/chat (backed by a language model)
   Jarvis uses it. Any failure falls back to the local brain,
   so the app always works standing alone.
   =========================================================== */

function storedKey() {
    try { return localStorage.getItem(API_KEY) || ''; } catch (e) { return ''; }
}

// A static build has no server to proxy through, so it calls Anthropic straight
// from the browser. The key stays in this browser and goes nowhere else.
async function directBrain(text) {
    const key = storedKey();
    if (!key) throw new Error('no key');

    const history = conversation.slice(-12).map(m => ({
        role: m.role === 'jarvis' ? 'assistant' : 'user',
        content: m.text
    }));
    if (history.length && history[history.length - 1].role === 'user'
        && history[history.length - 1].content === text) {
        history.pop();
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-5',
            max_tokens: 1024,
            system: DIRECT_SYSTEM + (memory.name ? ` The user's name is ${memory.name}.` : ''),
            messages: history.concat([{ role: 'user', content: text }])
        })
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error('anthropic ' + response.status + ': ' + detail.slice(0, 160));
    }

    const data = await response.json();
    const reply = (data.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n')
        .trim();
    if (!reply) throw new Error('empty reply');
    return reply;
}

const DIRECT_SYSTEM = 'You are Jarvis, a personal AI assistant: the calm, dryly witty British ' +
    'butler-engineer. Composed, precise, warm without fawning. Address the user as "sir" unless ' +
    'they give you their name, then use it. Your replies are read aloud, so write for the ear: ' +
    'plain sentences, no markdown, no headings, no bullet characters, no emoji. Keep it to one ' +
    'to four sentences unless more is genuinely needed. Never invent facts.';

async function remoteBrain(text) {
    const history = conversation.slice(-12).map(m => ({
        role: m.role === 'jarvis' ? 'assistant' : 'user',
        content: m.text
    }));

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history, userName: memory.name })
    });

    if (!response.ok) throw new Error('chat endpoint returned ' + response.status);

    const data = await response.json();
    if (!data || !data.reply) throw new Error('no reply in response');
    return data.reply;
}

async function think(text) {
    if (storedKey()) {
        try {
            return await directBrain(text);
        } catch (e) {
            setStatus('Key error', false);
            setTimeout(() => setStatus('Online', false), 2600);
            return `That key was refused, ${addressee()} — ${e.message}. Falling back to my own reasoning.\n\n` + localBrain(text);
        }
    }

    if (remoteBrainAvailable !== false) {
        try {
            const reply = await remoteBrain(text);
            remoteBrainAvailable = true;
            return reply;
        } catch (e) {
            remoteBrainAvailable = false; // stop retrying for the rest of the session
        }
    }
    return localBrain(text);
}

/* ---------- Conversation flow ---------- */

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    sendBtn.disabled = true;
    stopListening();
    hush();
    addMessage('user', text);

    typingIndicator.classList.add('visible');
    setStatus('Processing', true);

    // A brief pause reads as deliberation rather than a lookup table.
    const started = Date.now();
    let reply;
    try {
        reply = await think(text);
    } catch (e) {
        reply = `Something went wrong on my end, ${addressee()}. Try that again.`;
    }
    const elapsed = Date.now() - started;
    const minimumBeat = 450 + Math.random() * 400;
    if (elapsed < minimumBeat) await new Promise(r => setTimeout(r, minimumBeat - elapsed));

    typingIndicator.classList.remove('visible');
    setStatus('Online', false);
    sendBtn.disabled = false;
    chatInput.focus();

    addMessage('jarvis', reply);
    speak(reply, afterSpeaking);
}

function resetConversation() {
    handsFree = false;
    stopListening();
    conversation = [];
    TIMERS.splice(0).forEach(clearTimeout);
    chatLog.innerHTML = '';
    localStorage.removeItem(STORAGE_KEY);
    hush();
    updateCount();
    greet();
}

function greet() {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const line = memory.name
        ? `${part}, ${memory.name}. Jarvis online and ready. What are we working on?`
        : `${part}. I am Jarvis — Just A Rather Very Intelligent System. Type to me, or tap the microphone and speak. Ask what I can do if you would like the tour.`;
    addMessage('jarvis', line);
}

/* ---------- Wiring ---------- */

sendBtn.addEventListener('click', handleSend);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
});

clearChatBtn.addEventListener('click', resetConversation);

voiceToggle.addEventListener('change', () => {
    localStorage.setItem(VOICE_KEY, voiceToggle.checked);
    if (!voiceToggle.checked) { handsFree = false; hush(); }
});

document.querySelectorAll('.quick-actions .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        chatInput.value = btn.dataset.say;
        handleSend();
    });
});

/* ---------- Boot ---------- */

function refreshKeyStatus() {
    const key = storedKey();
    keyStatus.textContent = key
        ? 'Connected — Jarvis is thinking with a live model.'
        : 'Not connected — running the offline brain.';
    keyInput.value = '';
    keyInput.placeholder = key ? '•••• stored in this browser' : 'sk-ant-...';
}

keyToggle.addEventListener('click', () => {
    keyPanel.classList.toggle('open');
    if (keyPanel.classList.contains('open')) {
        refreshKeyStatus();
        keyInput.focus();
    }
});

keySave.addEventListener('click', () => {
    const value = keyInput.value.trim();
    if (!value) return;
    try {
        localStorage.setItem(API_KEY, value);
        remoteBrainAvailable = false;   // the key takes precedence from here
        refreshKeyStatus();
        setStatus('Model linked', false);
        setTimeout(() => setStatus('Online', false), 2200);
    } catch (e) {
        keyStatus.textContent = 'This browser refused to store the key.';
    }
});

keyClear.addEventListener('click', () => {
    try { localStorage.removeItem(API_KEY); } catch (e) {}
    refreshKeyStatus();
});

loadState();
refreshKeyStatus();

if (conversation.length) {
    conversation.forEach(m => renderMessage(m.role, m.text, false));
    chatLog.scrollTop = chatLog.scrollHeight;
    updateCount();
} else {
    greet();
}

setStatus('Online', false);
chatInput.focus();
