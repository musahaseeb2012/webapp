const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

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

// --- Optional Claude proxy for Study AI ------------------------------------
// Only active when @anthropic-ai/sdk is installed and ANTHROPIC_API_KEY is set.
// Keeping the key here means it never reaches the browser.

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
const MAX_BODY_BYTES = 16 * 1024 * 1024;   // photos travel as base64, so this needs headroom
const MAX_OUTPUT_TOKENS = 16000;

let anthropic = null;
let sdkMissing = false;

if (process.env.ANTHROPIC_API_KEY) {
    try {
        const sdk = require('@anthropic-ai/sdk');
        const Anthropic = sdk.default || sdk;
        anthropic = new Anthropic();
    } catch (error) {
        sdkMissing = true;
    }
}

function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(new Error('Request body too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
            } catch (error) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

/* Only forward the fields the app actually uses. */
function buildRequest(body) {
    if (!Array.isArray(body.messages) || !body.messages.length) {
        throw new Error('messages is required');
    }
    const request = {
        model: typeof body.model === 'string' ? body.model : DEFAULT_MODEL,
        max_tokens: Math.min(Number(body.max_tokens) || 4096, MAX_OUTPUT_TOKENS),
        messages: body.messages
    };
    if (body.system) request.system = body.system;
    if (body.thinking) request.thinking = body.thinking;
    if (body.output_config) request.output_config = body.output_config;
    return request;
}

async function handleAi(req, res) {
    if (!anthropic) {
        return sendJson(res, 503, {
            error: sdkMissing
                ? 'ANTHROPIC_API_KEY is set but the SDK is missing — run: npm install'
                : 'No ANTHROPIC_API_KEY in the server environment.'
        });
    }

    try {
        const body = await readBody(req);
        const message = await anthropic.messages.create(buildRequest(body));
        sendJson(res, 200, {
            content: message.content,
            stop_reason: message.stop_reason,
            model: message.model,
            usage: message.usage
        });
    } catch (error) {
        const status = error && typeof error.status === 'number' ? error.status : 400;
        console.error('AI request failed:', error.message);
        sendJson(res, status, { error: error.message || 'Request failed' });
    }
}

// --- Static files ----------------------------------------------------------

function serveStatic(req, res) {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const filePath = path.join(ROOT, relative);

    // Never serve anything outside the project directory.
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        return;
    }

    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT' || error.code === 'EISDIR') {
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
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    const route = req.url.split('?')[0];

    if (route === '/api/ai/status') {
        return sendJson(res, 200, {
            enabled: Boolean(anthropic),
            model: anthropic ? DEFAULT_MODEL : null,
            reason: anthropic
                ? null
                : (sdkMissing ? 'sdk-missing' : 'no-api-key')
        });
    }

    if (route === '/api/ai') {
        if (req.method !== 'POST') {
            return sendJson(res, 405, { error: 'Use POST' });
        }
        return handleAi(req, res);
    }

    serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Study AI at        http://localhost:${PORT}/study-ai.html`);
    if (anthropic) {
        console.log(`Claude proxy enabled (model: ${DEFAULT_MODEL})`);
    } else if (sdkMissing) {
        console.log('Claude proxy off: run "npm install" to add @anthropic-ai/sdk');
    } else {
        console.log('Claude proxy off: set ANTHROPIC_API_KEY to enable it');
    }
    console.log('Press Ctrl+C to stop the server');
});
