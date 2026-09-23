#!/bin/bash
# Builds the static site that GitHub Pages serves, into ./site.
# Pages gives Jarvis an https:// origin, which is what the microphone needs —
# a file:// page cannot ask for it.
set -e

OUT="site"
export BUILD_STAMP="$(date -u +%Y%m%d-%H%M)"
rm -rf "$OUT"
mkdir -p "$OUT"

./build-jarvis.sh > /dev/null

# The voice-first page is the front door; the text chat stays alongside it.
python3 - <<'PY'
import os

meta = '''    <script>window.JARVIS_NO_SERVER = true;</script>
    <meta name="theme-color" content="#0b0705">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Jarvis">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="apple-touch-icon" href="icon-180.png">
'''

stamp = os.environ['BUILD_STAMP']

# index.html — voice only. Talk to it; it talks back; nothing is transcribed
# on screen.
voice = open('jarvis-voice.html').read()
anchor = '<style>'
assert anchor in voice
voice = voice.replace(anchor, meta + anchor, 1)
open('site/index.html', 'w').write(voice.replace('__BUILD__', stamp))

# text.html — the full chat, for when typing is easier.
text = open('jarvis-standalone.html').read()
anchor = '    <style>'
assert anchor in text
text = text.replace(anchor, meta + anchor, 1)
open('site/text.html', 'w').write(text)
PY

cp icon-180.png icon-512.png "$OUT"/
cp manifest.webmanifest "$OUT"/
touch "$OUT/.nojekyll"   # serve files as-is, no Jekyll pass

echo "Built $OUT/ ($(du -sh "$OUT" | cut -f1))"
