#!/bin/bash
OUTPUT="productivity-hub-backgrounds.html"

# Start HTML
echo '<!DOCTYPE html>' > "$OUTPUT"
echo '<html lang="en">' >> "$OUTPUT"
echo '<head>' >> "$OUTPUT"
echo '    <meta charset="UTF-8">' >> "$OUTPUT"
echo '    <meta name="viewport" content="width=device-width, initial-scale=1.0">' >> "$OUTPUT"
echo '    <title>Productivity Hub - With Backgrounds</title>' >> "$OUTPUT"
echo '    <style>' >> "$OUTPUT"

# Add CSS
cat styles.css >> "$OUTPUT"

echo '    </style>' >> "$OUTPUT"
echo '</head>' >> "$OUTPUT"
echo '<body>' >> "$OUTPUT"

# Add body content from index.html (skip head)
sed -n '/<body>/,/<\/body>/p' index.html | sed '1d;$d' >> "$OUTPUT"

echo '    <script>' >> "$OUTPUT"

# Add JavaScript
cat app.js >> "$OUTPUT"

echo '    </script>' >> "$OUTPUT"
echo '</body>' >> "$OUTPUT"
echo '</html>' >> "$OUTPUT"

echo "Created $OUTPUT"
