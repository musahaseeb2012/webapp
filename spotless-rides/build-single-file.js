#!/usr/bin/env node
/* ==========================================================================
   Bundles the site into one self-contained .html file.

     node build-single-file.js [outfile]

   The multi-file version in this folder is the one to edit. This build is for
   places that can only take a single file — emailing it to someone, dropping
   it on a host with no directory support, or opening it straight off a USB
   stick. Everything is inlined: CSS, JS, three.js, and the logo as a data URI,
   so the result has zero external requests and no import map to resolve.

   Re-run it after any edit to index.html, the CSS, or the JS.
   ========================================================================== */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const out  = process.argv[2] || path.join(ROOT, 'spotless-rides-standalone.html');

/* ------------------------------------------------------------------ three */

// three.module.min.js ends with `export{a as ACESFilmicToneMapping,...}`.
// Concatenating modules by hand means resolving that mapping ourselves: the
// public names have to become real bindings, and the addons' `from 'three'`
// imports have to disappear.
function bundleThree() {
  const src = read('vendor', 'three', 'three.module.min.js');

  const m = src.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
  if (!m) throw new Error('could not find the export block in three.module.min.js');

  const pairs = m[1].split(',').map(s => s.trim()).filter(Boolean).map(spec => {
    const parts = spec.split(/\s+as\s+/).map(s => s.trim());
    return parts.length === 2 ? { local: parts[0], exported: parts[1] }
                              : { local: parts[0], exported: parts[0] };
  });

  const body = src.slice(0, m.index);

  // A public name that collides with one of the minifier's own identifiers
  // would be silently shadowed, so refuse to build rather than ship that.
  const aliases = pairs.filter(p => p.local !== p.exported);
  for (const p of aliases) {
    if (new RegExp(`(?:^|[;{}\\s])(?:const|let|var|class|function)\\s+${p.exported}\\b`).test(body)) {
      throw new Error(`name collision on ${p.exported} — bundling needs a rethink`);
    }
  }

  const bindings = aliases.map(p => `const ${p.exported} = ${p.local};`).join('\n');
  const namespace = `const THREE = Object.freeze({\n${
    pairs.map(p => `  ${p.exported}`).join(',\n')
  }\n});`;

  return `${body}\n${bindings}\n${namespace}\n`;
}

/* ------------------------------------------------------------------ addons */

// Dependency order — each addon may only reference ones already above it.
const ADDONS = [
  ['postprocessing', 'Pass.js'],
  ['shaders', 'CopyShader.js'],
  ['shaders', 'LuminosityHighPassShader.js'],
  ['shaders', 'OutputShader.js'],
  ['postprocessing', 'ShaderPass.js'],
  ['postprocessing', 'MaskPass.js'],
  ['postprocessing', 'EffectComposer.js'],
  ['postprocessing', 'RenderPass.js'],
  ['postprocessing', 'UnrealBloomPass.js'],
  ['postprocessing', 'OutputPass.js'],
  ['environments', 'RoomEnvironment.js'],
  ['objects', 'Reflector.js']
];

const stripModuleSyntax = (src) => src
  .replace(/^\s*import\s[\s\S]*?from\s*['"][^'"]+['"]\s*;?\s*$/gm, '')
  .replace(/^\s*export\s+(?=(?:default\s+)?(?:class|const|let|var|function))/gm, '')
  .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '');

/* -------------------------------------------------------------------- page */

const logo    = fs.readFileSync(path.join(ROOT, 'assets', 'logo.png')).toString('base64');
const logo512 = fs.readFileSync(path.join(ROOT, 'assets', 'logo-512.png')).toString('base64');

const dataUri    = `data:image/png;base64,${logo}`;
const dataUri512 = `data:image/png;base64,${logo512}`;

let html = read('index.html');

// Every replacement goes through a function. Passing the payload as a string
// would let `$&`, `` $` `` and `$'` inside minified three.js or the CSS expand
// into replacement patterns and quietly duplicate chunks of the page.
const swap = (needle, payload) => {
  if (!html.includes(needle)) throw new Error(`index.html no longer contains: ${needle}`);
  html = html.replace(needle, () => payload);
};

html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, '');

swap('<link rel="stylesheet" href="css/styles.css">',
     `<style>\n${read('css', 'styles.css')}\n</style>`);

swap('<script type="module" src="js/scene.js"></script>',
     `<script type="module">\n${bundleThree()}\n${
       ADDONS.map(a => stripModuleSyntax(read('vendor', 'three', ...a))).join('\n')
     }\n${stripModuleSyntax(read('js', 'scene.js'))}\n</script>`);

swap('<script src="js/site.js" defer></script>',
     `<script>\n${read('js', 'site.js')}\n</script>`);

html = html.replaceAll('assets/logo-512.png', () => dataUri512)
           .replaceAll('assets/logo.png',     () => dataUri);

const leftovers = html.match(/(?:href|src)="(?!data:|#|tel:|mailto:|https?:)[^"]*"/g);
if (leftovers) {
  throw new Error('these references were not inlined: ' + [...new Set(leftovers)].join(', '));
}

const banner = `<!--
  GENERATED FILE — do not edit.
  Built from index.html, css/, js/ and vendor/ by build-single-file.js.
  Edit those, then re-run: node build-single-file.js
-->
`;

fs.writeFileSync(out, banner + html);
console.log(`${path.relative(process.cwd(), out)} — ${(html.length / 1024 / 1024).toFixed(2)} MB`);
