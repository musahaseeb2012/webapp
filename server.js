const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Optional: set ANTHROPIC_API_KEY in the environment and Jarvis routes his
// replies through a language model. Without it, Jarvis falls back to the
// built-in local brain in jarvis.js and the app works exactly the same.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const JARVIS_MODEL = process.env.JARVIS_MODEL || 'claude-sonnet-5';

const JARVIS_SYSTEM_PROMPT = [
    'You are Jarvis, a personal AI assistant modelled on the calm, dryly witty',
    'British butler-engineer archetype. You are composed, precise and warm without',
    'being fawning. Address the user as "sir" unless they have given you their name,',
    'in which case use it. Keep replies conversational and tight — usually one to',
    'four sentences, longer only when the question genuinely needs it. Never invent',
    'facts; say plainly when you do not know something.'
].join(' ');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(body, 'utf-8');
}

function callAnthropic(body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const request = https.request({
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        }, (response) => {
            let data = '';
            response.on('data', chunk => { data += chunk; });
            response.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (response.statusCode !== 200) {
                        reject(new Error(`Anthropic API ${response.statusCode}: ${data.slice(0, 200)}`));
                        return;
                    }
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });

        request.on('error', reject);
        request.write(payload);
        request.end();
    });
}

function handleChat(req, res) {
    if (!ANTHROPIC_API_KEY) {
        // Jarvis treats this as "no model wired up" and uses his local brain.
        sendJson(res, 503, { error: 'No model configured. Set ANTHROPIC_API_KEY to enable the language model link.' });
        return;
    }

    let raw = '';
    req.on('data', chunk => {
        raw += chunk;
        if (raw.length > 200000) req.destroy();
    });

    req.on('end', async () => {
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            sendJson(res, 400, { error: 'Invalid JSON body' });
            return;
        }

        const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
        if (!message) {
            sendJson(res, 400, { error: 'Missing message' });
            return;
        }

        const history = Array.isArray(parsed.history)
            ? parsed.history
                .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
                .slice(-12)
            : [];

        // The client's history already ends with the new message; drop any
        // trailing duplicate so it is not sent twice.
        if (history.length && history[history.length - 1].role === 'user' && history[history.length - 1].content === message) {
            history.pop();
        }

        let system = JARVIS_SYSTEM_PROMPT;
        if (typeof parsed.userName === 'string' && /^[\w '\-]{1,32}$/.test(parsed.userName)) {
            system += ` The user's name is ${parsed.userName}.`;
        }

        try {
            const result = await callAnthropic({
                model: JARVIS_MODEL,
                max_tokens: 1024,
                system: system,
                messages: history.concat([{ role: 'user', content: message }])
            });

            const reply = (result.content || [])
                .filter(block => block.type === 'text')
                .map(block => block.text)
                .join('\n')
                .trim();

            if (!reply) {
                sendJson(res, 502, { error: 'Empty reply from model' });
                return;
            }

            sendJson(res, 200, { reply: reply });
        } catch (error) {
            console.error('Chat error:', error.message);
            sendJson(res, 502, { error: 'Model request failed' });
        }
    });
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    const url = req.url.split('?')[0];

    if (url === '/api/chat') {
        if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Use POST' });
            return;
        }
        handleChat(req, res);
        return;
    }

    let filePath = '.' + url;
    if (filePath === './') {
        filePath = './index.html';
    } else if (filePath === './jarvis') {
        filePath = './jarvis.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Jarvis available at http://localhost:${PORT}/jarvis`);
    if (!ANTHROPIC_API_KEY) {
        console.log('ANTHROPIC_API_KEY not set — Jarvis will use his built-in local brain.');
    }
    console.log('Press Ctrl+C to stop the server');
});
