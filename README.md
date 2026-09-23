# To-Do List Web Application

A simple and elegant to-do list web application built with vanilla HTML, CSS, and JavaScript.

## Features

- Add new tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks (All, Active, Completed)
- Clear all completed tasks
- Persistent storage using localStorage
- Responsive design with smooth animations

## Getting Started

### Prerequisites

- Node.js installed on your system

### Installation & Running

1. Navigate to the project directory
2. Start the server:
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node server.js
   ```

3. Open your browser and go to: `http://localhost:3000`

## Usage

- Type a task in the input field and click "Add Task" or press Enter
- Click the checkbox to mark a task as completed
- Click "Delete" to remove a task
- Use the filter buttons to view All, Active, or Completed tasks
- Click "Clear Completed" to remove all completed tasks at once

## Jarvis — AI Assistant

An AI you can hold a conversation with, in a gold-and-red command-console theme.

**Easiest way to run it: open `jarvis-standalone.html`.** That is one self-contained
file — double-click it, email it to yourself, put it on your phone. No server, no
other files, works offline.

You can also run it through the server at `http://localhost:3000/jarvis`, or click
the **Jarvis** tile on the hub menu. Note that `jarvis.html` needs `jarvis.css` and
`jarvis.js` sitting beside it; the standalone file does not.

### Talking to Jarvis

Voice is on by default — he answers out loud.

- **Tap the microphone** to start a hands-free exchange: he listens, answers
  aloud, then reopens the mic for your next question, and keeps going until you
  tap it again. Voice input needs Chrome, Edge, or Safari.
- **Or type** and hit Enter; he still answers out loud.
- Toggle **Voice** off at the bottom if you would rather he stayed quiet.

The speech layer works around the two things that usually break browser TTS: the
voice list loads asynchronously (so the voice is chosen on `voiceschanged`, not
at startup) and long utterances get cut off (so replies are spoken in
sentence-sized pieces). Bullets and markdown are stripped before speaking, since
a synthesiser reads them out literally.

### What he handles out of the box

No API key, no build step, no network — the built-in brain covers:

- Conversation, advice, and a second opinion
- Math: `what is 48 * 17`, `calculate 2^10`, or just `12 * (4 + 3)`
- Time and date, and timers: `set a timer for 5 minutes`
- Memory: tell him your name and he uses it from then on
- Jokes, coin flips, dice rolls, random numbers, status reports

Conversations and remembered details persist in `localStorage`, so closing the tab
does not lose the thread. **New Session** clears it.

### Wiring up a language model (optional)

For open-ended questions the local brain says so rather than inventing an answer.
To give Jarvis a real model, set an API key before starting the server:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

The page then routes replies through `POST /api/chat` and falls back to the local
brain automatically if the endpoint is unavailable, so it never breaks. Override the
model with `JARVIS_MODEL` (defaults to `claude-sonnet-5`). The key stays on the
server and is never sent to the browser.

### Live on the web (microphone works here)

**https://musahaseeb2012.github.io/webapp/jarvis/**

Served by GitHub Pages from the `gh-pages` branch, under `jarvis/` so the site
already at the root is untouched. An `https://` origin is the whole point: a page
opened from disk (`file://`) cannot ask for microphone permission, so this is the
only build where voice input actually works. On a phone, use the browser's
**Add to Home Screen** and it opens like an app, without browser chrome.

Rebuild and republish after changing `jarvis.css` or `jarvis.js`:

```bash
./build-pages.sh          # regenerates ./site
# then copy site/ into the gh-pages branch's jarvis/ folder and push
```

This build talks to no server, so it runs the offline brain by default. To give
it a real model, open **⚙ Brain** at the bottom of the page and paste an
Anthropic API key: the page then calls the API directly from your browser. The
key is kept in that browser's `localStorage` and sent only to Anthropic — but it
is stored unencrypted, so use a key you can revoke, and clear it with the same
panel when you are done.

### Hosted version (a real model, no setup)

`jarvis-artifact.html` is a variant published to claude.ai as a private Artifact.
It reaches a real Claude model through the viewer's own account, so no API key and
no server are involved — it just answers. Nothing in it works outside claude.ai
(it depends on `window.claude`), and the microphone is blocked in that sandbox, so
voice input is text-only there. Voice output still works.

### Jarvis files

- `jarvis-standalone.html` - **The whole app in one file.** Open this one.
- `jarvis-artifact.html` - Source of the claude.ai Artifact (real model; claude.ai only)
- `jarvis.html` - Chat interface (needs the two files below alongside it)
- `jarvis.css` - Gold and red theme
- `jarvis.js` - Conversation engine, speech input/output, persistence
- `build-jarvis.sh` - Rebuilds `jarvis-standalone.html` after editing the three above
- `build-pages.sh` - Builds `site/`, what GitHub Pages serves at `/jarvis/`
- `manifest.webmanifest`, `icon-*.png` - Home-screen install metadata for the site

After changing `jarvis.css` or `jarvis.js`, regenerate the single file:

```bash
./build-jarvis.sh
```

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `app.js` - JavaScript functionality
- `server.js` - Node.js HTTP server (static files + the `/api/chat` endpoint)
- `package.json` - Project configuration

## Technologies

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)
- Node.js HTTP server
- localStorage API for data persistence
