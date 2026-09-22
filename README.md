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
Open it at `http://localhost:3000/jarvis` (or from the **Jarvis** tile on the hub menu).

### Talking to Jarvis

- **Type** in the input bar and hit Enter, or
- **Tap the microphone** and speak — Jarvis transcribes you and replies out loud
  (Web Speech API; voice input needs Chrome, Edge, or Safari)
- Toggle **Voice Reply** off at the bottom if you would rather he stayed quiet

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

### Jarvis files

- `jarvis.html` - Chat interface
- `jarvis.css` - Gold and red theme
- `jarvis.js` - Conversation engine, speech input/output, persistence

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
