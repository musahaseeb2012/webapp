# Productivity Hub

A vanilla HTML/CSS/JavaScript workspace: a to-do list, notes, a calendar, a points shop — and
**Study AI**, a tutor for your own school material.

## Study AI

Put your class notes, assignments and homework into a library, pick what you want to work on,
and then either **ask about it** or **get quizzed on it**.

- **Library** — paste text or drop in plain-text files (`.txt`, `.md`, `.csv`, `.json`, `.html`).
  Tag each item with a subject and a type (notes, assignment, homework, reading, slides).
  Everything is stored in your browser with `localStorage`; nothing is uploaded unless you turn
  Claude on.
- **Explain & Ask** — a chat that only works from the material you selected. One-tap prompts for
  *explain simply*, *summarise*, *key terms*, *step by step*, *worked example*, *help me start*
  and *common mistakes*.
- **Quiz Me** — generates multiple choice, true/false, short answer or flashcards, at easy /
  medium / hard, then marks your answers and explains what you missed. "Explain what I got wrong"
  sends the misses straight back to the tutor.

On assignments and homework the tutor is told to coach, not to write the answer for you: it breaks
the task down, explains the method and shows a similar worked example.

### The two engines

| | Needs a key | What it does |
|---|---|---|
| **Built-in** | No | Runs entirely in the page. Pulls out key terms and definitions, summarises, answers by finding the relevant lines, and builds fill-the-gap, true/false, short answer and flashcard questions. Works offline. |
| **Claude** | Yes | Real explanations and properly written questions, plus fair marking of your written answers. |

The app picks the better one automatically and falls back to the built-in engine whenever Claude
is unavailable, so it never dead-ends. The current engine is shown in the top-right pill.

### Turning Claude on

**Option A — key on the server (recommended).** The key stays in the server environment and never
reaches the browser:

```bash
npm install                     # installs @anthropic-ai/sdk
ANTHROPIC_API_KEY=sk-ant-… npm start
```

Then open `http://localhost:3000/study-ai.html`. Set `ANTHROPIC_MODEL` to change the default model
(`claude-opus-5`).

**Option B — key in the browser.** Open Settings and paste an Anthropic API key. It is saved in
this browser's `localStorage` and sent from your browser straight to Anthropic — fine on your own
machine, but don't do it on a shared or school computer.

Either way, **Settings → Engine** lets you force *Built-in only* if you would rather nothing left
the device.

## Running it

```bash
npm start          # or: node server.js
```

- Hub: `http://localhost:3000`
- Study AI: `http://localhost:3000/study-ai.html`

`npm install` is only needed for the server-side Claude proxy; everything else runs without
dependencies.

## Files

| File | Purpose |
|---|---|
| `index.html`, `styles.css`, `app.js` | The hub: to-do list, notes, calendar, shop, themes |
| `study-ai.html`, `study-ai.css`, `study-ai.js` | Study AI (black &amp; red theme) |
| `server.js` | Static file server plus the optional `/api/ai` Claude proxy |
| `build-standalone.sh` | Bundles the hub into one HTML file |
| `build-study-ai.sh` | Bundles Study AI into `study-ai-standalone.html` |

Both standalone builds are single files you can open straight from disk or copy to a phone. In a
standalone build there is no server, so Claude needs a key pasted into Settings.

## Known limits

- Only plain text goes in — PDFs, Word documents and photos of notes are not read yet. Copy the
  text out and paste it in.
- `localStorage` holds roughly 5 MB, which is a lot of notes but not unlimited; the app warns you
  when it is full.
- Answers arrive in one go rather than streaming in.
