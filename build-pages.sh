#!/bin/bash
# Builds the static site that GitHub Pages serves, into ./site.
# Pages gives Jarvis an https:// origin, which is what the microphone needs —
# a file:// page cannot ask for it.
set -e

OUT="site"
BUILD_STAMP="$(date -u +%Y%m%d-%H%M)"
rm -rf "$OUT"
mkdir -p "$OUT"

./build-jarvis.sh > /dev/null

# Jarvis is the site's front page, with the tags that let a phone install it
# to the home screen and run it without browser chrome.
python3 - <<'PY'
meta = '''    <script>window.JARVIS_NO_SERVER = true;</script>
    <meta name="theme-color" content="#0b0705">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Jarvis">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="apple-touch-icon" href="icon-180.png">
'''
html = open('jarvis-standalone.html').read()
anchor = '    <style>'
assert anchor in html
html = html.replace(anchor, meta + anchor, 1)
open('site/index.html', 'w').write(html)
PY

cp icon-180.png icon-512.png "$OUT"/
cp manifest.webmanifest "$OUT"/
touch "$OUT/.nojekyll"   # serve files as-is, no Jekyll pass

echo "Built $OUT/ ($(du -sh "$OUT" | cut -f1))"
