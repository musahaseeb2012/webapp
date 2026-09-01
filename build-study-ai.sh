#!/bin/bash
# Bundles Study AI into one file you can open straight from disk or put on a phone.
# The Claude server proxy is not available in the standalone build — paste an API
# key in Settings, or it falls back to the built-in engine.
set -e
OUTPUT="study-ai-standalone.html"

{
    echo '<!DOCTYPE html>'
    echo '<html lang="en">'
    echo '<head>'
    echo '    <meta charset="UTF-8">'
    echo '    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    echo '    <title>Study AI — Notes Tutor</title>'
    echo '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    echo '    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap">'
    echo '    <style>'
    cat study-ai.css
    echo '    </style>'
    echo '</head>'
    echo '<body>'
    sed -n '/<body>/,/<\/body>/p' study-ai.html | sed '1d;$d' | grep -v '<script src="study-ai.js">'
    echo '    <script>'
    cat study-ai.js
    echo '    </script>'
    echo '</body>'
    echo '</html>'
} > "$OUTPUT"

echo "Created $OUTPUT"
