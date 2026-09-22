#!/bin/bash
# Bundles Jarvis into one self-contained HTML file you can open by
# double-clicking it — no server, no other files, works offline.
OUTPUT="jarvis-standalone.html"

{
    # Everything from jarvis.html up to the stylesheet link
    sed -n '1,/<link rel="stylesheet"/p' jarvis.html | sed '$d'

    echo '    <style>'
    cat jarvis.css
    echo '    </style>'
    echo '</head>'
    echo '<body>'

    # Body content, minus the <body> tags and the external script tag
    sed -n '/<body>/,/<\/body>/p' jarvis.html | sed '1d;$d' | grep -v '<script src="jarvis.js">'

    echo '    <script>'
    cat jarvis.js
    echo '    </script>'
    echo '</body>'
    echo '</html>'
} > "$OUTPUT"

echo "Created $OUTPUT ($(wc -c < "$OUTPUT") bytes)"
