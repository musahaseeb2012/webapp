/* Study AI — a tutor for your own school notes, assignments and homework.
 *
 * Two engines answer your questions:
 *   1. Claude  — used when a key is available (server-side env var, or one you paste in Settings)
 *   2. Built-in — a local text engine that runs entirely in this page, no key and no network
 * The built-in engine is always there as a fallback, so the app never dead-ends.
 */

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORE = {
    materials: 'studyAI.materials',
    settings: 'studyAI.settings',
    chat: 'studyAI.chat',
    selection: 'studyAI.selection'
};

const DEFAULT_SETTINGS = {
    engineMode: 'auto',
    apiKey: '',
    model: 'claude-opus-5'
};

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.warn('Could not read', key, e);
        return fallback;
    }
}

function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        toast(e.name === 'QuotaExceededError'
            ? 'Storage is full — delete an old material to make room.'
            : 'Could not save to this browser.');
        return false;
    }
}

let materials = load(STORE.materials, []);
let settings = Object.assign({}, DEFAULT_SETTINGS, load(STORE.settings, {}));
let chatHistory = load(STORE.chat, []);
let selectedIds = new Set(load(STORE.selection, []));
let editingId = null;
let currentQuiz = null;
let busy = false;

// How the app will actually reach Claude: 'server' | 'browser' | null
let claudeTransport = null;
let serverModel = null;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function wordCount(text) {
    const m = String(text).trim().match(/\S+/g);
    return m ? m.length : 0;
}

let toastTimer = null;
function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function openModal(id) {
    $(id).classList.add('open');
}

function closeModal(id) {
    $(id).classList.remove('open');
}

/* Renders the light markdown Claude tends to produce. */
function renderRich(text) {
    const lines = escapeHtml(text).split('\n');
    let html = '';
    let listType = null;

    const closeList = () => {
        if (listType) {
            html += `</${listType}>`;
            listType = null;
        }
    };

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) {
            closeList();
            continue;
        }
        if (/^#{1,6}\s+/.test(line)) {
            closeList();
            html += `<h4>${line.replace(/^#{1,6}\s+/, '')}</h4>`;
        } else if (/^[-*•]\s+/.test(line)) {
            if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
            html += `<li>${line.replace(/^[-*•]\s+/, '')}</li>`;
        } else if (/^\d+[.)]\s+/.test(line)) {
            if (listType !== 'ol') { closeList(); html += '<ol>'; listType = 'ol'; }
            html += `<li>${line.replace(/^\d+[.)]\s+/, '')}</li>`;
        } else {
            closeList();
            html += `<p>${line}</p>`;
        }
    }
    closeList();

    return html
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------

const TYPE_LABEL = {
    notes: 'Notes',
    assignment: 'Assignment',
    homework: 'Homework',
    reading: 'Reading',
    slides: 'Slides'
};

function renderLibrary() {
    const list = $('materialList');
    const term = $('materialSearch').value.trim().toLowerCase();
    const visible = materials.filter((m) => {
        if (!term) return true;
        return (m.title + ' ' + m.subject + ' ' + m.text).toLowerCase().includes(term);
    });

    $('libraryCount').textContent = `${materials.length} item${materials.length === 1 ? '' : 's'}`;

    if (!visible.length) {
        list.innerHTML = materials.length
            ? '<li class="empty">Nothing matches that search.</li>'
            : '<li class="empty"><span class="empty-icon">📚</span>Your library is empty.<br>Add your first set of notes to get started.</li>';
        updateContextBar();
        return;
    }

    list.innerHTML = visible.map((m) => {
        const chosen = selectedIds.has(m.id);
        return `
        <li class="material-item ${chosen ? 'selected' : ''}" data-id="${m.id}">
            <div class="material-top">
                <span class="material-check">✓</span>
                ${m.photo ? `<img class="material-photo" src="${m.photo}" alt="">` : ''}
                <span class="material-title">${escapeHtml(m.title)}</span>
            </div>
            <div class="material-meta">
                <span class="tag tag-type">${TYPE_LABEL[m.type] || m.type}</span>
                ${m.subject ? `<span class="tag">${escapeHtml(m.subject)}</span>` : ''}
                <span>${wordCount(m.text).toLocaleString()} words</span>
                ${m.photoCount ? `<span>📷 ${m.photoCount}</span>` : ''}
            </div>
            <div class="material-actions">
                <button class="btn btn-sm btn-ghost" data-act="read">Read</button>
                <button class="btn btn-sm btn-ghost" data-act="edit">Edit</button>
                <button class="btn btn-sm btn-ghost btn-danger" data-act="delete">Delete</button>
            </div>
        </li>`;
    }).join('');

    updateContextBar();
}

function selectedMaterials() {
    return materials.filter((m) => selectedIds.has(m.id));
}

function updateContextBar() {
    const chosen = selectedMaterials();
    const summary = $('contextSummary');
    const words = $('contextWords');

    if (!chosen.length) {
        summary.textContent = 'nothing selected yet';
        words.textContent = materials.length ? '— tick a material on the left' : '';
        return;
    }

    summary.textContent = chosen.length === 1
        ? chosen[0].title
        : `${chosen.length} materials`;
    const total = chosen.reduce((sum, m) => sum + wordCount(m.text), 0);
    words.textContent = `— ${total.toLocaleString()} words`;
}

/* The text handed to whichever engine is answering. */
const CONTEXT_CHAR_LIMIT = 120000;

function buildContext() {
    const chosen = selectedMaterials();
    if (!chosen.length) return null;

    let out = '';
    let truncated = false;
    for (const m of chosen) {
        const header = `--- ${TYPE_LABEL[m.type] || m.type}: ${m.title}${m.subject ? ' (' + m.subject + ')' : ''} ---\n`;
        const room = CONTEXT_CHAR_LIMIT - out.length - header.length;
        if (room <= 0) { truncated = true; break; }
        if (m.text.length > room) {
            out += header + m.text.slice(0, room) + '\n\n';
            truncated = true;
            break;
        }
        out += header + m.text + '\n\n';
    }
    if (truncated) {
        toast('That is a lot of material — only the first part was used. Select fewer items for better answers.');
    }
    return out.trim();
}

function rawSelectedText() {
    return selectedMaterials().map((m) => m.text).join('\n\n');
}

// ---------------------------------------------------------------------------
// Claude engine
// ---------------------------------------------------------------------------

const MODERN_MODELS = ['claude-opus-5', 'claude-sonnet-5'];

function engineAvailable() {
    if (settings.engineMode === 'offline') return false;
    return Boolean(claudeTransport);
}

async function detectEngine() {
    claudeTransport = null;
    serverModel = null;

    if (settings.engineMode !== 'offline') {
        // A local server with ANTHROPIC_API_KEY set is the safest place for a key.
        // Opened straight from disk there is no server to ask, so don't try.
        try {
            if (location.protocol === 'file:') throw new Error('no server');
            const res = await fetch('api/ai/status', { method: 'GET' });
            if (res.ok) {
                const status = await res.json();
                if (status.enabled) {
                    claudeTransport = 'server';
                    serverModel = status.model || null;
                }
            }
        } catch (e) {
            /* Opened straight from the filesystem, or no server — that is fine. */
        }
        if (!claudeTransport && settings.apiKey) {
            claudeTransport = 'browser';
        }
    }

    paintEnginePill();
    paintEngineStatus();
}

function paintEnginePill() {
    const pill = $('enginePill');
    const label = $('engineLabel');
    if (engineAvailable()) {
        pill.classList.add('live');
        label.textContent = `Claude · ${claudeTransport === 'server' ? 'server key' : 'browser key'}`;
    } else {
        pill.classList.remove('live');
        label.textContent = settings.engineMode === 'offline' ? 'Built-in engine' : 'Built-in engine (no key)';
    }
}

function paintEngineStatus() {
    const box = $('engineStatus');
    if (!box) return;
    if (engineAvailable()) {
        box.innerHTML = claudeTransport === 'server'
            ? `<strong style="color:var(--good)">Connected via your local server.</strong> The key lives in the server environment${serverModel ? `, default model <code>${escapeHtml(serverModel)}</code>` : ''}.`
            : '<strong style="color:var(--good)">Connected with the key saved in this browser.</strong>';
    } else if (settings.engineMode === 'offline') {
        box.innerHTML = 'Built-in engine only — everything stays on this device.';
    } else {
        box.innerHTML = 'No Claude key found, so the built-in engine is answering. Paste a key above, or run <code>ANTHROPIC_API_KEY=… node server.js</code> and reload.';
    }
}

/* One call to Claude. Returns the assistant text. */
async function callClaude(messages, options = {}) {
    const model = options.model || settings.model || DEFAULT_SETTINGS.model;
    const body = {
        model,
        max_tokens: options.maxTokens || 8000,
        messages
    };
    if (options.system) body.system = options.system;

    // Thinking and effort are only on the current-generation models.
    if (MODERN_MODELS.includes(model)) {
        body.thinking = { type: 'adaptive' };
        body.output_config = { effort: options.effort || 'medium' };
        if (options.schema) {
            body.output_config.format = { type: 'json_schema', schema: options.schema };
        }
    }

    let data;
    if (claudeTransport === 'server') {
        const res = await fetch('api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data && data.error ? data.error : `Server error ${res.status}`);
    } else {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(body)
        });
        data = await res.json();
        if (!res.ok) {
            const detail = data && data.error ? data.error.message : `HTTP ${res.status}`;
            throw new Error(detail);
        }
    }

    if (data.stop_reason === 'refusal') {
        throw new Error('Claude declined to answer that one. Try rephrasing the question.');
    }

    const text = (data.content || [])
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();

    if (!text) throw new Error('Claude returned an empty answer.');
    return text;
}

/* Claude is asked for JSON; be forgiving about stray prose around it. */
function parseJsonLoosely(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenced) {
            try { return JSON.parse(fenced[1]); } catch (e2) { /* keep trying */ }
        }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end > start) {
            try { return JSON.parse(text.slice(start, end + 1)); } catch (e3) { /* fall through */ }
        }
        throw new Error('Could not read the questions that came back. Try generating again.');
    }
}

const TUTOR_SYSTEM = [
    'You are a patient, encouraging tutor helping a student understand their own school material.',
    'Ground every answer in the material the student provides. If something they ask about is not in it, say so plainly and then answer from general knowledge, clearly marked as such.',
    'Explain in plain language, define jargon the first time it appears, and use short worked examples.',
    'Use short paragraphs, headings and bullet points so it is easy to revise from.',
    'When the material is an assignment or homework, coach rather than complete: break the task down, explain the concepts and method, show a similar worked example, and let the student write their own answer.',
    'Never invent facts, quotations, sources or numbers that are not in the material.'
].join(' ');

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------
// A photo is read once, when it is added, and stored as text. Everything after
// that — questions, quizzes, search, the built-in engine — works on the text,
// so a photographed worksheet behaves exactly like pasted notes.

const MAX_PHOTOS = 4;
const PHOTO_MAX_EDGE = 1600;   // ~1.2MP after downscaling, which is what the API wants
const THUMB_MAX_EDGE = 220;

let pendingPhotos = [];

const TRANSCRIBE_PROMPT = [
    'These are photos of a student\'s school material — notes, a worksheet, a textbook page or a problem written on a board.',
    'Write out everything on them as plain text, in reading order.',
    'Keep question numbering exactly as it appears. Keep headings and bullet structure.',
    'Write maths and formulas in plain readable text (for example "x^2 + 3x - 4 = 0", "H2O").',
    'Where there is a diagram, chart or figure, describe it in square brackets, e.g. [Diagram: a right-angled triangle labelled a, b, c].',
    'If some of the handwriting is genuinely unreadable, write [unclear] there rather than guessing.',
    'Output only the transcription — no preamble, no commentary.'
].join(' ');

/* Shrink to something the API is happy with, and honour EXIF rotation. */
function prepareImage(file, maxEdge) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            canvas.toBlob(
                (blob) => resolve({ dataUrl, blob }),
                'image/jpeg',
                0.85
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`${file.name} is not an image this browser can open. JPEG or PNG works best.`));
        };
        img.src = url;
    });
}

function dataUrlBody(dataUrl) {
    return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

async function addPhotos(fileList) {
    const files = Array.from(fileList || []).filter((f) => /^image\//.test(f.type));
    if (!files.length) {
        setPhotoStatus('Those were not images. Take a photo, or pick a JPEG or PNG.', 'failed');
        return;
    }
    if (pendingPhotos.length + files.length > MAX_PHOTOS) {
        setPhotoStatus(`Up to ${MAX_PHOTOS} photos at a time — add the rest as a second material.`, 'failed');
        return;
    }

    setPhotoStatus('Preparing photos…', 'working');
    for (const file of files) {
        try {
            const [full, thumb] = await Promise.all([
                prepareImage(file, PHOTO_MAX_EDGE),
                prepareImage(file, THUMB_MAX_EDGE)
            ]);
            pendingPhotos.push({
                id: uid(),
                name: file.name,
                full: full.dataUrl,
                blob: full.blob,
                thumb: thumb.dataUrl
            });
        } catch (err) {
            setPhotoStatus(err.message, 'failed');
        }
    }
    renderPhotoStrip();
    if (pendingPhotos.length) readPhotos();
}

function renderPhotoStrip() {
    $('photoStrip').innerHTML = pendingPhotos.map((p) => `
        <div class="photo-thumb" data-id="${p.id}">
            <img src="${p.thumb}" alt="${escapeHtml(p.name)}">
            <button type="button" data-remove="${p.id}" title="Remove">✕</button>
        </div>`).join('');
}

function setPhotoStatus(message, state) {
    const el = $('photoStatus');
    el.textContent = message;
    el.className = 'photo-status' + (state ? ' ' + state : '');
}

/* Read every pending photo in one call, and put the text where it can be edited. */
async function readPhotos() {
    if (!pendingPhotos.length) return;

    if (!engineAvailable()) {
        setPhotoStatus('Reading photos needs Claude — the built-in engine cannot see images. ' +
            'Turn Claude on in Settings, or type the question in instead.', 'failed');
        return;
    }

    setPhotoStatus(`Reading ${pendingPhotos.length} photo${pendingPhotos.length === 1 ? '' : 's'}…`, 'working');
    $('saveMaterialBtn').disabled = true;

    try {
        const text = await transcribePhotos(pendingPhotos);
        const box = $('materialText');
        box.value = box.value.trim() ? `${box.value.trim()}\n\n${text}` : text;
        if (!$('materialTitle').value.trim()) {
            $('materialTitle').value = text.split('\n')[0].slice(0, 60).trim() || 'Photo of my work';
        }
        setPhotoStatus('Read. Check it below and fix anything it got wrong, then save.', '');
        $('contentHint').textContent = '— read from your photo, edit anything that came out wrong';
    } catch (err) {
        console.error(err);
        setPhotoStatus(photoErrorCopy(err), 'failed');
    } finally {
        $('saveMaterialBtn').disabled = false;
    }
}

function photoErrorCopy(err) {
    return `Could not read the photos. ${err && err.message ? err.message : ''}`.trim();
}

/* Sends the images to Claude and returns the transcription. */
async function transcribePhotos(photos) {
    const content = photos.map((p) => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: dataUrlBody(p.full) }
    }));
    content.push({ type: 'text', text: TRANSCRIBE_PROMPT });

    return callClaude([{ role: 'user', content }], {
        maxTokens: 8000,
        effort: 'medium'
    });
}

// ---------------------------------------------------------------------------
// Built-in engine — works with no key and no network
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(('a about above after again against all also am an and any are as at be because been before being ' +
    'below between both but by can cannot could did do does doing down during each few for from further had has have ' +
    'having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no ' +
    'nor not now of off on once only or other our ours ourselves out over own same she should so some such than that ' +
    'the their theirs them themselves then there these they this those through to too under until up very was we were ' +
    'what when where which while who whom why will with would you your yours yourself yourselves it\'s them us there\'s ' +
    'also many much often may might must shall upon within without been being able like using used use ' +
    'place places called call include includes including given gives give occur occurs contain contains ' +
    'thing things part parts kind sort lots little large small good bad').split(' '));

function splitSentences(text) {
    const out = [];
    for (const block of String(text).split(/\n+/)) {
        const line = block.replace(/\s+/g, ' ').trim();
        if (!line) continue;
        const parts = line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line];
        for (const part of parts) {
            const s = part.trim();
            if (s.length >= 25 && /[a-zA-Z]/.test(s)) out.push(s);
        }
    }
    return out;
}

function words(text) {
    return (String(text).toLowerCase().match(/[a-z][a-z'-]+/g) || []);
}

/* Terms that carry the meaning of the material, most important first. */
function keyTerms(text, limit = 18) {
    const freq = new Map();
    for (const w of words(text)) {
        if (w.length < 4 || STOPWORDS.has(w)) continue;
        freq.set(w, (freq.get(w) || 0) + 1);
    }

    // Multi-word capitalised phrases usually name the concept being taught.
    const phrases = new Map();
    const phraseRe = /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){0,2})\b/g;
    let match;
    while ((match = phraseRe.exec(text)) !== null) {
        const phrase = match[1].trim();
        if (phrase.split(' ').length < 2) continue;
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }

    const scored = [];
    for (const [word, count] of freq) {
        scored.push({ term: word, score: count * (1 + word.length / 20) });
    }
    for (const [phrase, count] of phrases) {
        scored.push({ term: phrase, score: count * 2.5 });
    }

    scored.sort((a, b) => b.score - a.score);

    const chosen = [];
    for (const item of scored) {
        const lower = item.term.toLowerCase();
        if (chosen.some((c) => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()))) continue;
        chosen.push(item.term);
        if (chosen.length >= limit) break;
    }
    return chosen;
}

function sentenceFor(term, sents) {
    const lower = term.toLowerCase();
    return sents.find((s) => s.toLowerCase().includes(lower)) || null;
}

function summarise(text, count = 5) {
    const sents = splitSentences(text);
    if (sents.length <= count) return sents;

    const freq = new Map();
    for (const w of words(text)) {
        if (w.length < 4 || STOPWORDS.has(w)) continue;
        freq.set(w, (freq.get(w) || 0) + 1);
    }

    const ranked = sents.map((s, index) => {
        const ws = words(s);
        let score = 0;
        for (const w of ws) score += freq.get(w) || 0;
        score = score / Math.sqrt(ws.length || 1);
        if (index < 3) score *= 1.25;               // openings usually frame the topic
        if (/\b(is|are|means|refers to|defined as|because|therefore)\b/i.test(s)) score *= 1.2;
        return { s, index, score };
    });

    return ranked
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .sort((a, b) => a.index - b.index)
        .map((r) => r.s);
}

/* "cells" is plural; "photosynthesis", "class" and "nucleus" are not. */
function isPlural(subject) {
    const last = subject.trim().split(/\s+/).pop().toLowerCase();
    return /s$/.test(last) && !/(ss|sis|us|is|as|ics)$/.test(last);
}

const DEFINITION_RE = /^(.{3,70}?)\s+(?:is|are|was|were|means|refers to|is defined as|is called)\s+(.{20,})$/i;

function definitions(text, limit = 12) {
    const found = [];
    for (const s of splitSentences(text)) {
        const m = s.match(DEFINITION_RE);
        if (!m) continue;
        let subject = m[1].replace(/^(in|this|these|that|those)\s+/i, '').trim();
        // Keep a leading article — "the overall equation" reads better than "overall equation".
        subject = subject.replace(/^(The|A|An)\s+/, (art) => art.toLowerCase());
        if (!subject || subject.split(' ').length > 6) continue;
        found.push({ subject, body: m[2].replace(/[.]$/, '').trim(), sentence: s });
        if (found.length >= limit) break;
    }
    return found;
}

function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/* Answering a free-text question without a model: pull the most relevant lines. */
function offlineAnswer(question, text) {
    const q = question.toLowerCase();
    const sents = splitSentences(text);
    const terms = keyTerms(text);
    const footer = '\n\n_Built-in engine — add an Anthropic API key in Settings for full, conversational explanations._';

    if (!sents.length) {
        return 'There is not enough text in the selected material for me to work with yet.' + footer;
    }

    if (/(key term|vocab|glossary|definition|define)/.test(q)) {
        const defs = definitions(text);
        let out = '## Key terms\n\n';
        if (defs.length) {
            out += defs.map((d) => `- **${d.subject}** — ${d.body}`).join('\n');
        } else {
            out += terms.slice(0, 10).map((t) => {
                const s = sentenceFor(t, sents);
                return `- **${t}**${s ? ` — ${s}` : ''}`;
            }).join('\n');
        }
        return out + footer;
    }

    if (/(summar|overview|main idea|gist|revise|review)/.test(q)) {
        const lines = summarise(text, 6);
        return '## The main points\n\n' + lines.map((s) => `- ${s}`).join('\n') +
            `\n\n## Words worth knowing\n\n${terms.slice(0, 8).join(' · ')}` + footer;
    }

    if (/(step by step|walk me|how do i|procedure|method)/.test(q)) {
        const lines = summarise(text, 7);
        return '## Step by step\n\n' + lines.map((s, i) => `${i + 1}. ${s}`).join('\n') +
            '\n\nWork through these in order and say each one back in your own words before moving on.' + footer;
    }

    // Default: rank sentences against the words in the question.
    const qWords = words(question).filter((w) => w.length > 3 && !STOPWORDS.has(w));
    const ranked = sents.map((s, index) => {
        const lower = s.toLowerCase();
        let score = 0;
        for (const w of qWords) if (lower.includes(w)) score += 1;
        return { s, index, score };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);

    if (!ranked.length) {
        return 'I could not find that in the selected material. Here is what it does cover:\n\n' +
            summarise(text, 5).map((s) => `- ${s}`).join('\n') + footer;
    }

    return '## From your material\n\n' +
        ranked.sort((a, b) => a.index - b.index).map((r) => `- ${r.s}`).join('\n') +
        '\n\n## In short\n\n' + summarise(text, 3).join(' ') + footer;
}

/* Build a quiz from the text alone. */
function offlineQuiz(text, options) {
    const { count, type } = options;
    const sents = splitSentences(text);
    const terms = keyTerms(text, 24);
    const defs = definitions(text, 20);
    const questions = [];
    const usedSentences = new Set();

    const wantsAll = type === 'mixed';
    const want = (kind) => wantsAll || type === kind;

    // Short answer from explicit definitions.
    if (want('short_answer') || want('flashcard')) {
        for (const d of defs) {
            if (questions.length >= count) break;
            if (usedSentences.has(d.sentence)) continue;
            usedSentences.add(d.sentence);
            questions.push({
                type: want('flashcard') && !wantsAll ? 'flashcard' : 'short_answer',
                question: `What ${isPlural(d.subject) ? 'are' : 'is'} ${d.subject}?`,
                answer: d.body,
                explanation: `From your notes: "${d.sentence}"`
            });
        }
    }

    // Fill-in-the-blank multiple choice built around key terms.
    if (want('multiple_choice')) {
        for (const term of terms) {
            if (questions.length >= count) break;
            const sentence = sents.find((s) => !usedSentences.has(s) && s.toLowerCase().includes(term.toLowerCase()));
            if (!sentence) continue;
            const distractors = shuffle(terms.filter((t) => t.toLowerCase() !== term.toLowerCase())).slice(0, 3);
            if (distractors.length < 3) continue;
            usedSentences.add(sentence);
            const blanked = sentence.replace(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '__________');
            questions.push({
                type: 'multiple_choice',
                question: `Fill the gap: ${blanked}`,
                options: shuffle(distractors.concat([term])),
                answer: term,
                explanation: `The original line reads: "${sentence}"`
            });
        }
    }

    // True / false, half of them altered so they are false.
    if (want('true_false')) {
        for (const sentence of sents) {
            if (questions.length >= count) break;
            if (usedSentences.has(sentence) || sentence.length > 220) continue;
            const termsHere = terms.filter((t) => sentence.toLowerCase().includes(t.toLowerCase()));
            const makeFalse = Math.random() < 0.5 && termsHere.length > 0;
            usedSentences.add(sentence);

            if (makeFalse) {
                const original = termsHere[0];
                const swap = shuffle(terms.filter((t) => t.toLowerCase() !== original.toLowerCase()))[0];
                if (!swap) continue;
                const altered = sentence.replace(
                    new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), swap);
                questions.push({
                    type: 'true_false',
                    question: altered,
                    answer: 'False',
                    explanation: `Your notes say "${original}" there, not "${swap}".`
                });
            } else {
                questions.push({
                    type: 'true_false',
                    question: sentence,
                    answer: 'True',
                    explanation: 'This is taken straight from your material.'
                });
            }
        }
    }

    // Flashcards from the remaining key terms.
    if (want('flashcard')) {
        for (const term of terms) {
            if (questions.length >= count) break;
            const sentence = sentenceFor(term, sents);
            if (!sentence || usedSentences.has(sentence)) continue;
            usedSentences.add(sentence);
            questions.push({
                type: 'flashcard',
                question: term,
                answer: sentence,
                explanation: ''
            });
        }
    }

    // Last resort so a quiz is never empty: recall questions from key sentences.
    if (!questions.length) {
        for (const sentence of summarise(text, count)) {
            questions.push({
                type: 'short_answer',
                question: `Explain this idea from your notes in your own words: "${sentence.slice(0, 140)}${sentence.length > 140 ? '…' : ''}"`,
                answer: sentence,
                explanation: 'Compare your wording with the line from your notes.'
            });
        }
    }

    return shuffle(questions).slice(0, count);
}

// ---------------------------------------------------------------------------
// Tutor chat
// ---------------------------------------------------------------------------

function renderChat() {
    const log = $('chatLog');
    if (!chatHistory.length) {
        log.innerHTML = `<div class="empty"><span class="empty-icon">💬</span>
            Pick a material on the left, then ask a question or tap one of the buttons above.</div>`;
        return;
    }
    log.innerHTML = chatHistory.map((m) => {
        if (m.role === 'user') return `<div class="msg msg-user">${escapeHtml(m.content)}</div>`;
        const cls = m.error ? 'msg msg-ai msg-error' : 'msg msg-ai';
        return `<div class="${cls}">${renderRich(m.content)}</div>`;
    }).join('');
    log.scrollTop = log.scrollHeight;
}

function showTyping() {
    const log = $('chatLog');
    const node = document.createElement('div');
    node.className = 'msg msg-ai';
    node.id = 'typingBubble';
    node.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    log.appendChild(node);
    log.scrollTop = log.scrollHeight;
}

function hideTyping() {
    const node = $('typingBubble');
    if (node) node.remove();
}

function pushMessage(role, content, error) {
    chatHistory.push({ role, content, error: Boolean(error) });
    if (chatHistory.length > 60) chatHistory = chatHistory.slice(-60);
    save(STORE.chat, chatHistory);
    renderChat();
}

async function askTutor(question) {
    if (busy) return;
    const text = question.trim();
    if (!text) return;

    const context = buildContext();
    if (!context) {
        toast('Select at least one material first.');
        return;
    }

    busy = true;
    $('sendBtn').disabled = true;
    pushMessage('user', text);
    showTyping();

    try {
        let answer;
        if (engineAvailable()) {
            const history = chatHistory
                .filter((m) => !m.error)
                .slice(-12)
                .map((m) => ({ role: m.role, content: m.content }));
            answer = await callClaude(history, {
                system: [
                    { type: 'text', text: TUTOR_SYSTEM },
                    {
                        // Stable across the conversation, so it is the natural cache breakpoint.
                        type: 'text',
                        text: `Here is the student's material:\n\n${context}`,
                        cache_control: { type: 'ephemeral' }
                    }
                ],
                maxTokens: 8000,
                effort: 'medium'
            });
        } else {
            await new Promise((r) => setTimeout(r, 250));
            answer = offlineAnswer(text, rawSelectedText());
        }
        hideTyping();
        pushMessage('assistant', answer);
    } catch (err) {
        hideTyping();
        console.error(err);
        pushMessage('assistant',
            `**Claude could not answer that.** ${err.message}\n\nFalling back to the built-in engine:\n\n` +
            offlineAnswer(text, rawSelectedText()), true);
    } finally {
        busy = false;
        $('sendBtn').disabled = false;
    }
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

const QUIZ_SCHEMA = {
    type: 'object',
    properties: {
        questions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['multiple_choice', 'true_false', 'short_answer', 'flashcard']
                    },
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    answer: { type: 'string' },
                    explanation: { type: 'string' }
                },
                required: ['type', 'question', 'options', 'answer', 'explanation'],
                additionalProperties: false
            }
        }
    },
    required: ['questions'],
    additionalProperties: false
};

const TYPE_INSTRUCTION = {
    mixed: 'Mix multiple choice, true/false and short answer questions.',
    multiple_choice: 'Every question must be multiple choice with exactly four plausible options.',
    true_false: 'Every question must be a true/false statement. Make roughly half of them false, and false ones must be believable.',
    short_answer: 'Every question must be a short answer question needing one or two sentences.',
    flashcard: 'Every item must be a flashcard: "question" is the front (a term, formula or concept) and "answer" is the back (a clear, complete definition).'
};

const DIFFICULTY_INSTRUCTION = {
    easy: 'Easy: straight recall of facts and definitions stated in the material.',
    medium: 'Medium: test understanding — ask why and how, and require the student to connect two ideas.',
    hard: 'Hard: application and analysis — new scenarios the student must reason through using the material.'
};

async function generateQuiz() {
    if (busy) return;
    const context = buildContext();
    if (!context) {
        toast('Select at least one material first.');
        return;
    }

    const count = parseInt($('quizCount').value, 10);
    const type = $('quizType').value;
    const difficulty = $('quizDifficulty').value;

    busy = true;
    $('generateQuizBtn').disabled = true;
    $('quizArea').innerHTML = `<div class="empty"><span class="typing"><i></i><i></i><i></i></span>
        <p style="margin-top:10px">Writing your questions…</p></div>`;

    try {
        let questions;
        if (engineAvailable()) {
            const prompt = [
                `Write exactly ${count} quiz questions from the student's material below.`,
                TYPE_INSTRUCTION[type],
                DIFFICULTY_INSTRUCTION[difficulty],
                'Rules:',
                '- Every question must be answerable from the material alone. Never test something it does not cover.',
                '- "options" holds four choices for multiple choice, ["True","False"] for true/false, and an empty array otherwise.',
                '- "answer" must match one of the options exactly for multiple choice and true/false; for short answer it is a model answer of one or two sentences.',
                '- "explanation" says why the answer is right, pointing at the part of the material it comes from.',
                '- Do not repeat the same idea twice.',
                'Reply with JSON only: {"questions": [...]}.',
                '',
                'MATERIAL:',
                context
            ].join('\n');

            const raw = await callClaude([{ role: 'user', content: prompt }], {
                system: 'You write fair, accurate revision questions from a student\'s own study material. You reply with JSON only.',
                maxTokens: 12000,
                effort: 'medium',
                schema: QUIZ_SCHEMA
            });
            const parsed = parseJsonLoosely(raw);
            questions = Array.isArray(parsed.questions) ? parsed.questions : [];
            if (!questions.length) throw new Error('No questions came back.');
        } else {
            await new Promise((r) => setTimeout(r, 250));
            questions = offlineQuiz(rawSelectedText(), { count, type, difficulty });
            if (!questions.length) throw new Error('There is not enough text in this material to build questions from.');
        }

        currentQuiz = {
            questions: questions.slice(0, count).map((q) => ({
                type: q.type || 'short_answer',
                question: String(q.question || '').trim(),
                options: Array.isArray(q.options) ? q.options.map(String) : [],
                answer: String(q.answer == null ? '' : q.answer).trim(),
                explanation: String(q.explanation || '').trim()
            })),
            difficulty,
            submitted: false,
            responses: {}
        };
        renderQuiz();
    } catch (err) {
        console.error(err);
        $('quizArea').innerHTML = `<div class="msg msg-ai msg-error">
            <strong>Could not build the quiz.</strong><br>${escapeHtml(err.message)}</div>`;
    } finally {
        busy = false;
        $('generateQuizBtn').disabled = false;
    }
}

function isGradable(q) {
    return q.type !== 'flashcard';
}

function renderQuiz() {
    if (!currentQuiz) return;
    const area = $('quizArea');
    const { questions, submitted } = currentQuiz;

    let html = '';

    if (submitted) {
        const gradable = questions.filter(isGradable);
        const right = gradable.filter((q) => q.correct).length;
        const pct = gradable.length ? Math.round((right / gradable.length) * 100) : 0;
        const remark = pct >= 90 ? 'You have this cold.'
            : pct >= 70 ? 'Solid — tidy up the misses and you are there.'
            : pct >= 50 ? 'Halfway. Re-read the bits you missed and go again.'
            : 'Worth another read of the material before the next round.';
        html += `<div class="score-card">
            <div class="score-value">${right}/${gradable.length}</div>
            <div class="score-label">${pct}% — ${remark}</div>
        </div>`;
    } else {
        html += `<div class="quiz-meta">
            <span>${questions.length} questions</span>
            <span>·</span>
            <span>${currentQuiz.difficulty} difficulty</span>
            <span>·</span>
            <span>${engineAvailable() ? 'written by Claude' : 'built-in engine'}</span>
        </div>`;
    }

    questions.forEach((q, i) => {
        if (q.type === 'flashcard') {
            html += `<div class="question flashcard" data-index="${i}">
                <div class="question-head">
                    <span class="question-num">CARD ${i + 1}</span>
                    <span class="question-text">${escapeHtml(q.question)}</span>
                </div>
                <div class="flip-hint">Tap to flip</div>
                <div class="card-back">${escapeHtml(q.answer)}</div>
            </div>`;
            return;
        }

        html += `<div class="question" data-index="${i}">
            <div class="question-head">
                <span class="question-num">Q${i + 1}</span>
                <span class="question-text">${escapeHtml(q.question)}</span>
            </div>`;

        const options = q.type === 'true_false' && q.options.length !== 2 ? ['True', 'False'] : q.options;

        if ((q.type === 'multiple_choice' || q.type === 'true_false') && options.length) {
            html += '<div class="options">';
            options.forEach((opt, oi) => {
                const chosen = currentQuiz.responses[i] === opt;
                let state = chosen ? 'chosen' : '';
                if (submitted) {
                    const isAnswer = normalise(opt) === normalise(q.answer);
                    if (isAnswer) state = 'correct';
                    else if (chosen) state = 'wrong';
                    else state = '';
                }
                html += `<label class="option ${state}">
                    <input type="radio" name="q${i}" value="${escapeHtml(opt)}"
                        ${chosen ? 'checked' : ''} ${submitted ? 'disabled' : ''}>
                    <span>${escapeHtml(opt)}</span>
                </label>`;
            });
            html += '</div>';
        } else {
            html += `<textarea data-answer-for="${i}" rows="3" placeholder="Your answer…"
                ${submitted ? 'disabled' : ''}>${escapeHtml(currentQuiz.responses[i] || '')}</textarea>`;
        }

        if (submitted) {
            html += `<div class="verdict ${q.correct ? 'right' : ''}">
                <strong>${q.correct ? '✓ Correct' : '✗ Not quite'}</strong>
                ${q.type === 'short_answer' ? `<div><em>Model answer:</em> ${escapeHtml(q.answer)}</div>` : ''}
                ${q.feedback ? `<div>${escapeHtml(q.feedback)}</div>` : ''}
                ${q.explanation ? `<div>${escapeHtml(q.explanation)}</div>` : ''}
            </div>`;
        }

        html += '</div>';
    });

    html += '<div class="quiz-actions">';
    if (!submitted && questions.some(isGradable)) {
        html += '<button id="submitQuizBtn" class="btn btn-primary">Check my answers</button>';
    }
    if (submitted) {
        html += '<button id="retryQuizBtn" class="btn">Try these again</button>';
        html += '<button id="explainMissesBtn" class="btn btn-primary">Explain what I got wrong</button>';
    }
    html += '<button id="newQuizBtn" class="btn btn-ghost">New questions</button></div>';

    area.innerHTML = html;
}

function normalise(value) {
    return String(value == null ? '' : value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/* Short answers, marked locally: how much of the model answer did they hit? */
function keywordScore(given, expected) {
    const target = normalise(expected).split(' ').filter((w) => w.length > 3 && !STOPWORDS.has(w));
    if (!target.length) return normalise(given).length > 0 ? 0.5 : 0;
    const said = new Set(normalise(given).split(' '));
    const hits = target.filter((w) => said.has(w)).length;
    return hits / target.length;
}

function collectResponses() {
    document.querySelectorAll('#quizArea textarea[data-answer-for]').forEach((el) => {
        currentQuiz.responses[el.dataset.answerFor] = el.value;
    });
}

async function submitQuiz() {
    if (!currentQuiz || busy) return;
    collectResponses();

    const shortAnswers = [];
    currentQuiz.questions.forEach((q, i) => {
        if (!isGradable(q)) return;
        const given = currentQuiz.responses[i] || '';
        if (q.type === 'multiple_choice' || q.type === 'true_false') {
            q.correct = normalise(given) === normalise(q.answer);
            q.feedback = given ? '' : 'You left this one blank.';
        } else {
            const score = keywordScore(given, q.answer);
            q.correct = score >= 0.5;
            q.feedback = given
                ? (q.correct ? 'You covered the main points.' : 'Compare yours with the model answer below.')
                : 'You left this one blank.';
            shortAnswers.push({ index: i, question: q.question, expected: q.answer, given });
        }
    });

    currentQuiz.submitted = true;
    renderQuiz();

    // Claude marks the written answers properly, since keyword matching is blunt.
    if (engineAvailable() && shortAnswers.some((s) => s.given.trim())) {
        busy = true;
        try {
            const prompt = [
                'Mark these short answers from a student. Be fair: reward correct understanding even when the wording differs, and do not penalise spelling or grammar.',
                'Reply with JSON only, in the form {"marks":[{"index":0,"correct":true,"feedback":"one or two sentences"}]}.',
                '',
                JSON.stringify(shortAnswers, null, 2)
            ].join('\n');

            const raw = await callClaude([{ role: 'user', content: prompt }], {
                system: 'You are a fair, encouraging marker. You reply with JSON only.',
                maxTokens: 4000,
                effort: 'low'
            });
            const marks = parseJsonLoosely(raw).marks || [];
            // Only the written answers were sent for marking — never let a stray
            // index overwrite a question that was graded objectively.
            const markable = new Set(shortAnswers.map((s) => s.index));
            for (const mark of marks) {
                const index = Number(mark.index);
                if (!markable.has(index)) continue;
                const q = currentQuiz.questions[index];
                if (!q) continue;
                q.correct = Boolean(mark.correct);
                q.feedback = String(mark.feedback || '');
            }
            renderQuiz();
        } catch (err) {
            console.warn('Claude marking failed, keeping the local marks.', err);
        } finally {
            busy = false;
        }
    }
}

function explainMisses() {
    if (!currentQuiz) return;
    const missed = currentQuiz.questions.filter((q) => isGradable(q) && !q.correct);
    if (!missed.length) {
        toast('You got everything right — nothing to go over!');
        return;
    }
    const lines = missed.map((q, i) =>
        `${i + 1}. ${q.question}\n   Correct answer: ${q.answer}`).join('\n');
    switchTab('tutor');
    askTutor(`I just got these questions wrong on my material. Explain each one to me clearly, ` +
        `so I understand the idea behind it and not just the answer:\n\n${lines}`);
}

// ---------------------------------------------------------------------------
// Material add / edit
// ---------------------------------------------------------------------------

function openMaterialModal(id) {
    editingId = id || null;
    const m = id ? materials.find((x) => x.id === id) : null;
    $('materialModalTitle').textContent = m ? 'Edit material' : 'Add material';
    $('materialTitle').value = m ? m.title : '';
    $('materialSubject').value = m ? m.subject : '';
    $('materialType').value = m ? m.type : 'notes';
    $('materialText').value = m ? m.text : '';
    pendingPhotos = [];
    renderPhotoStrip();
    setPhotoStatus('', '');
    $('contentHint').textContent = '';
    switchSource(m ? 'text' : 'photo');
    openModal('materialModal');
    $('materialTitle').focus();
}

function saveMaterial() {
    const text = $('materialText').value.trim();
    if (!text) {
        toast('Paste or drop in some content first.');
        return;
    }
    const title = $('materialTitle').value.trim() ||
        text.split('\n')[0].slice(0, 60).trim() || 'Untitled material';

    if (editingId) {
        const m = materials.find((x) => x.id === editingId);
        Object.assign(m, {
            title,
            subject: $('materialSubject').value.trim(),
            type: $('materialType').value,
            text
        });
    } else {
        const material = {
            id: uid(),
            title,
            subject: $('materialSubject').value.trim(),
            type: $('materialType').value,
            text,
            photo: pendingPhotos.length ? pendingPhotos[0].thumb : null,
            photoCount: pendingPhotos.length,
            createdAt: Date.now()
        };
        materials.unshift(material);
        selectedIds.add(material.id);
    }

    if (save(STORE.materials, materials)) {
        save(STORE.selection, Array.from(selectedIds));
        closeModal('materialModal');
        renderLibrary();
        toast(editingId ? 'Material updated.' : 'Added to your library.');
    }
    editingId = null;
}

function deleteMaterial(id) {
    const m = materials.find((x) => x.id === id);
    if (!m) return;
    if (!confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    materials = materials.filter((x) => x.id !== id);
    selectedIds.delete(id);
    save(STORE.materials, materials);
    save(STORE.selection, Array.from(selectedIds));
    renderLibrary();
    toast('Deleted.');
}

function readFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    files.forEach((file) => {
        if (/\.(pdf|docx?|pptx?|xlsx?|zip|png|jpe?g|gif|heic)$/i.test(file.name)) {
            toast(`${file.name} is not plain text — open it and copy the text in instead.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || '').trim();
            if (!text) {
                toast(`${file.name} looks empty.`);
                return;
            }
            const existing = $('materialText').value;
            $('materialText').value = existing ? `${existing}\n\n${text}` : text;
            if (!$('materialTitle').value.trim()) {
                $('materialTitle').value = file.name.replace(/\.[^.]+$/, '');
            }
            toast(`Loaded ${file.name}.`);
        };
        reader.onerror = () => toast(`Could not read ${file.name}.`);
        reader.readAsText(file);
    });
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function switchTab(name) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open'));
    }
});

$('addMaterialBtn').addEventListener('click', () => openMaterialModal(null));
$('saveMaterialBtn').addEventListener('click', saveMaterial);
$('materialSearch').addEventListener('input', renderLibrary);

$('selectAllBtn').addEventListener('click', () => {
    if (selectedIds.size === materials.length) {
        selectedIds.clear();
    } else {
        materials.forEach((m) => selectedIds.add(m.id));
    }
    save(STORE.selection, Array.from(selectedIds));
    renderLibrary();
});

$('materialList').addEventListener('click', (e) => {
    const item = e.target.closest('.material-item');
    if (!item) return;
    const id = item.dataset.id;
    const action = e.target.dataset.act;

    if (action === 'read') {
        const m = materials.find((x) => x.id === id);
        $('readerTitle').textContent = m.title;
        $('readerBody').textContent = m.text;
        openModal('readerModal');
        return;
    }
    if (action === 'edit') return openMaterialModal(id);
    if (action === 'delete') return deleteMaterial(id);

    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    save(STORE.selection, Array.from(selectedIds));
    renderLibrary();
});

// Photo / text source switch
function switchSource(name) {
    document.querySelectorAll('.source-tab').forEach((t) => t.classList.toggle('active', t.dataset.source === name));
    $('sourcePhoto').classList.toggle('active', name === 'photo');
    $('sourceText').classList.toggle('active', name === 'text');
}

document.querySelectorAll('.source-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchSource(tab.dataset.source));
});

// Photos
const photozone = $('photozone');
photozone.addEventListener('click', () => $('photoInput').click());
$('photoInput').addEventListener('change', (e) => {
    addPhotos(e.target.files);
    e.target.value = '';
});
['dragenter', 'dragover'].forEach((evt) => {
    photozone.addEventListener(evt, (e) => {
        e.preventDefault();
        photozone.classList.add('hot');
    });
});
['dragleave', 'drop'].forEach((evt) => {
    photozone.addEventListener(evt, (e) => {
        e.preventDefault();
        photozone.classList.remove('hot');
    });
});
photozone.addEventListener('drop', (e) => addPhotos(e.dataTransfer.files));

$('photoStrip').addEventListener('click', (e) => {
    const id = e.target.dataset.remove;
    if (!id) return;
    pendingPhotos = pendingPhotos.filter((p) => p.id !== id);
    renderPhotoStrip();
    if (!pendingPhotos.length) setPhotoStatus('', '');
});

// File drop / picker
const dropzone = $('dropzone');
dropzone.addEventListener('click', () => $('fileInput').click());
$('fileInput').addEventListener('change', (e) => {
    readFiles(e.target.files);
    e.target.value = '';
});
['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add('hot');
    });
});
['dragleave', 'drop'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove('hot');
    });
});
dropzone.addEventListener('drop', (e) => readFiles(e.dataTransfer.files));

// Chat
$('sendBtn').addEventListener('click', () => {
    const input = $('chatInput');
    const text = input.value;
    input.value = '';
    askTutor(text);
});

$('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $('sendBtn').click();
    }
});

$('clearChatBtn').addEventListener('click', () => {
    chatHistory = [];
    save(STORE.chat, chatHistory);
    renderChat();
});

document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => askTutor(chip.dataset.prompt));
});

// Quiz
$('generateQuizBtn').addEventListener('click', generateQuiz);

$('quizArea').addEventListener('click', (e) => {
    if (e.target.id === 'submitQuizBtn') return submitQuiz();
    if (e.target.id === 'newQuizBtn') return generateQuiz();
    if (e.target.id === 'explainMissesBtn') return explainMisses();
    if (e.target.id === 'retryQuizBtn') {
        currentQuiz.submitted = false;
        currentQuiz.responses = {};
        currentQuiz.questions.forEach((q) => {
            delete q.correct;
            delete q.feedback;
        });
        renderQuiz();
        return;
    }
    const card = e.target.closest('.flashcard');
    if (card) card.classList.toggle('flipped');
});

$('quizArea').addEventListener('change', (e) => {
    if (e.target.type !== 'radio' || !currentQuiz || currentQuiz.submitted) return;
    const question = e.target.closest('.question');
    currentQuiz.responses[question.dataset.index] = e.target.value;
    // Repaint just this question, so answers typed elsewhere are not lost.
    question.querySelectorAll('.option').forEach((opt) => {
        opt.classList.toggle('chosen', opt.contains(e.target));
    });
});

// Settings
$('settingsBtn').addEventListener('click', () => {
    $('engineMode').value = settings.engineMode;
    $('apiKey').value = settings.apiKey;
    $('modelId').value = settings.model;
    paintEngineStatus();
    openModal('settingsModal');
});

$('saveSettingsBtn').addEventListener('click', async () => {
    settings.engineMode = $('engineMode').value;
    settings.apiKey = $('apiKey').value.trim();
    settings.model = $('modelId').value;
    save(STORE.settings, settings);
    await detectEngine();
    toast('Settings saved.');
    closeModal('settingsModal');
});

$('testConnectionBtn').addEventListener('click', async () => {
    const btn = $('testConnectionBtn');
    btn.disabled = true;
    btn.textContent = 'Testing…';

    const previous = { key: settings.apiKey, mode: settings.engineMode, model: settings.model };
    settings.apiKey = $('apiKey').value.trim();
    settings.engineMode = $('engineMode').value;
    settings.model = $('modelId').value;

    try {
        await detectEngine();
        if (!engineAvailable()) {
            $('engineStatus').innerHTML = '<strong style="color:var(--warn)">No Claude connection.</strong> ' +
                'The built-in engine will answer instead.';
        } else {
            const reply = await callClaude([{ role: 'user', content: 'Reply with the single word: ready' }], {
                maxTokens: 64,
                effort: 'low'
            });
            $('engineStatus').innerHTML =
                `<strong style="color:var(--good)">Claude is connected.</strong> It replied: "${escapeHtml(reply.slice(0, 60))}"`;
        }
    } catch (err) {
        $('engineStatus').innerHTML = `<strong style="color:var(--red)">Connection failed.</strong> ${escapeHtml(err.message)}`;
    } finally {
        Object.assign(settings, { apiKey: previous.key, engineMode: previous.mode, model: previous.model });
        await detectEngine();
        btn.disabled = false;
        btn.textContent = 'Test connection';
    }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

renderLibrary();
renderChat();
detectEngine();
