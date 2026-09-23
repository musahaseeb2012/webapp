#!/usr/bin/env node
/* ==========================================================================
   Stamps a fresh ?v= on every local stylesheet and script reference.

     node bump-cache.js

   Why this exists: Safari — especially a page added to an iPhone or iPad Home
   Screen — will happily keep serving a CSS or JS file it fetched days ago,
   while taking the new HTML. The result is a page whose markup and behaviour
   disagree: new buttons that never light up, styles that don't apply, features
   that are "deployed" but invisible.

   A changed URL is a different file as far as the cache is concerned, so
   bumping the stamp forces the fetch. Run it after editing anything in css/
   or js/, before committing.

   vendor/ is left alone deliberately: three.js is pinned and never changes, so
   it may as well stay cached forever.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const PAGES = ['index.html', 'admin.html'];
const version = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

let touched = 0;

for (const page of PAGES) {
  const file = path.join(__dirname, page);
  if (!fs.existsSync(file)) continue;

  const before = fs.readFileSync(file, 'utf8');

  const after = before
    // href="css/anything.css"  and  src="js/anything.js", with or without a
    // stamp already on them
    .replace(/(href|src)="((?:css|js)\/[^"?]+)(?:\?v=[^"]*)?"/g,
             (_, attr, url) => `${attr}="${url}?v=${version}"`);

  if (after !== before) {
    fs.writeFileSync(file, after);
    const n = (after.match(/\?v=/g) || []).length;
    console.log(`${page} — ${n} reference${n === 1 ? '' : 's'} stamped v=${version}`);
    touched++;
  }
}

if (!touched) console.log('Nothing to stamp.');
