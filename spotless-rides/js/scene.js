/* ==========================================================================
   SPOTLESS RIDES — 3D hero scene
   A stylised detailing bay behind the badge: a wet, reflective floor, a pair
   of neon shine rings orbiting the logo, rising soap suds and drifting
   sparkles. The logo itself stays crisp HTML on top of it.

   Everything here is generated in code — no model files to download, and
   three.js is vendored in /vendor so the site works offline and on any
   static host.
   ========================================================================== */

import * as THREE from 'three';
import { RoomEnvironment }   from 'three/addons/environments/RoomEnvironment.js';
import { Reflector }         from 'three/addons/objects/Reflector.js';
import { EffectComposer }    from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }        from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }   from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }        from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('scene');
if (canvas) boot(canvas);

function boot(canvas) {

  /* ---------------------------------------------------------------- setup */

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr     = Math.min(window.devicePixelRatio || 1, 1.75);
  // Phones and low-power laptops skip the planar reflection and run a
  // cheaper bloom — same scene, fewer pixels pushed.
  const lowPower = window.innerWidth < 900 || (navigator.hardwareConcurrency || 4) <= 4;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: !lowPower, alpha: true, powerPreference: 'high-performance'
    });
  } catch (err) {
    // No WebGL: the CSS hero still reads perfectly on its own.
    document.dispatchEvent(new CustomEvent('scene:failed'));
    return;
  }

  renderer.setPixelRatio(lowPower ? Math.min(dpr, 1.5) : dpr);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0x04160b, 0.065);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  camera.position.set(6.8, 3.3, 8.1);

  const target = new THREE.Vector3(0, 0.20, 0);

  /* ------------------------------------------------------------ environment */

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environmentIntensity = 0.85;

  /* --------------------------------------------------------------- palette */

  const C = {
    lime:   0x9ee63a,
    yellow: 0xffd21e
  };

  /* ---------------------------------------------------------------- lights */

  scene.add(new THREE.AmbientLight(0x2b6b3a, 0.38));

  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(6, 9, 5);
  scene.add(key);

  // Two rim lights aimed tightly at the badge. Wide cones spill onto the floor
  // and the mirror picks the spill straight back up, so keep them narrow.
  const rimGreen = new THREE.SpotLight(0x35ff7a, 34, 22, Math.PI / 9, 0.75, 1.5);
  rimGreen.position.set(-6, 4.6, -5.5);
  rimGreen.target.position.set(-0.4, 2.6, 0);
  scene.add(rimGreen, rimGreen.target);

  const rimYellow = new THREE.SpotLight(0xffd21e, 28, 22, Math.PI / 9, 0.8, 1.5);
  rimYellow.position.set(6.5, 3.8, -5);
  rimYellow.target.position.set(0.6, 2.6, 0);
  scene.add(rimYellow, rimYellow.target);

  // A pool of light on the floor under the badge. Painted on as an additive
  // decal rather than lit with a point light — a real light this close to the
  // floor floods it, and the mirror throws the flood straight back at you.
  const glowDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 5.2),
    new THREE.MeshBasicMaterial({
      map: radialTexture('rgba(120,255,110,0.50)', 'rgba(60,220,90,0.15)'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  glowDecal.rotation.x = -Math.PI / 2;
  glowDecal.position.y = 0.02;
  scene.add(glowDecal);

  /* ----------------------------------------------------------------- floor */

  const floorGroup = new THREE.Group();
  scene.add(floorGroup);

  if (!lowPower) {
    const mirror = new Reflector(new THREE.CircleGeometry(26, 64), {
      textureWidth:  640,
      textureHeight: 640,
      color: 0x0e2b18
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = -0.001;
    floorGroup.add(mirror);
  }

  // A dark disc over the mirror knocks the reflection back to a wet sheen
  // instead of a literal mirror, and gives low-power devices a real floor.
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x061c0e,
    roughness: 0.52,
    metalness: 0.55,
    transparent: !lowPower,
    opacity: lowPower ? 1 : 0.72
  });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(26, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Faint grid to sell the scale of the bay.
  const grid = new THREE.GridHelper(44, 44, 0x2fd85f, 0x115c2a);
  grid.material.transparent = true;
  grid.material.opacity = 0.14;
  grid.material.depthWrite = false;
  grid.position.y = 0.004;
  scene.add(grid);

  /* ------------------------------------------------------- rings, suds, dust */

  const rings    = buildRings();
  const suds     = buildSuds(lowPower ? 16 : 34);
  const sparkles = buildSparkles(lowPower ? 90 : 190);
  scene.add(rings, suds.mesh, sparkles);

  /* -------------------------------------------------------------- composer */

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(1, 1),
    lowPower ? 0.32 : 0.44,  // strength
    0.62,                    // radius
    0.88                     // threshold
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ------------------------------------------------------------ interaction */

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    pointer.tx = THREE.MathUtils.clamp(e.gamma / 35, -1, 1);
    pointer.ty = THREE.MathUtils.clamp(((e.beta || 45) - 45) / 40, -1, 1);
  }, { passive: true });

  let scrollT = 0;
  const onScroll = () => {
    scrollT = THREE.MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1.4);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- resize */

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const aspect = w / h;
    camera.aspect = aspect;
    // Pull the camera back on narrow screens so the rings stay in frame.
    camera.fov = aspect < 0.85 ? 52 : 38;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  /* --------------------------------------------------------------- animate */

  // Only burn frames while the hero is actually on screen.
  let visible = true;
  new IntersectionObserver(
    ([entry]) => { visible = entry.isIntersecting; },
    { threshold: 0 }
  ).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) clock.getDelta();  // drop the swallowed time
  });

  const clock = new THREE.Clock();
  let spin = 0;

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t  = clock.elapsedTime;

    if (!reduced) {
      spin += dt * 0.05;

      // Ease the pointer so the camera glides instead of snapping.
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      // A slow drift around the badge, plus a nudge from the pointer.
      const orbit = 11.5 + scrollT * 5.5;
      const azim  = 0.88 + spin * 0.5 + pointer.x * 0.18;
      camera.position.x = Math.cos(azim) * orbit;
      camera.position.z = Math.sin(azim) * orbit;
      camera.position.y = 1.85 + scrollT * 3.6 - pointer.y * 0.5;
      target.y = 1.65 + scrollT * 0.35;

      suds.update(dt, t);
      sparkles.rotation.y = -t * 0.028;
      sparkles.material.opacity = 0.55 + Math.sin(t * 2.1) * 0.14;

      rings.children[0].rotation.z =  t * 0.26;
      rings.children[1].rotation.z = -t * 0.19;
      rings.rotation.y = Math.sin(t * 0.22) * 0.22;
      rings.position.y = 2.9 + Math.sin(t * 0.8) * 0.05;

      glowDecal.material.opacity = 0.45 + Math.sin(t * 1.7) * 0.12;
    }

    camera.lookAt(target);
    composer.render();
  }

  requestAnimationFrame(frame);

  // Give the first frame a moment to land before fading the canvas in.
  requestAnimationFrame(() => {
    canvas.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('scene:ready'));
  });

  /* ======================================================================
     BUILDERS
     ====================================================================== */

  /**
   * Rising soap suds. Lit spheres read as opaque pearls no matter how far the
   * opacity comes down, so each bubble is a camera-facing quad wearing a
   * painted bubble — hollow, with a bright rim and a highlight. One instanced
   * mesh, so the whole lot costs a single draw call.
   */
  function buildSuds(count) {
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: bubbleTexture(),
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    });

    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const bubbles = [];
    for (let i = 0; i < count; i++) {
      bubbles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 3.2 + Math.random() * 4.6,
        y: Math.random() * 6,
        speed: 0.25 + Math.random() * 0.5,
        scale: 0.085 + Math.random() * 0.20,
        wobble: Math.random() * Math.PI * 2
      });
    }

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();

    function update(dt, t) {
      q.copy(camera.quaternion);   // billboard every bubble at the camera
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y += b.speed * dt;
        if (b.y > 6.2) { b.y = -0.3; b.radius = 3.2 + Math.random() * 4.6; }

        const a = b.angle + t * 0.06;
        p.set(
          Math.cos(a) * b.radius + Math.sin(t * 1.3 + b.wobble) * 0.18,
          b.y,
          Math.sin(a) * b.radius + Math.cos(t * 1.1 + b.wobble) * 0.18
        );
        const pop = 1 + Math.sin(t * 2 + b.wobble) * 0.08;
        s.setScalar(b.scale * pop);
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    update(0, 0);
    return { mesh, update };
  }

  /** Drifting sparkles — the "shine" flecks from the logo. */
  function buildSparkles(count) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 11;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 8 - 0.2;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.13,
      map: starTexture(),
      color: 0xffe98a,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    return new THREE.Points(geo, mat);
  }

  /** Two neon rings, echoing the badge outline in the logo. */
  function buildRings() {
    const g = new THREE.Group();

    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(2.95, 0.026, 8, 140),
      new THREE.MeshStandardMaterial({
        color: C.yellow, emissive: C.yellow, emissiveIntensity: 2.4,
        transparent: true, opacity: 0.9
      })
    );
    outer.rotation.x = Math.PI / 2 - 0.30;

    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(2.45, 0.019, 8, 140),
      new THREE.MeshStandardMaterial({
        color: C.lime, emissive: C.lime, emissiveIntensity: 1.8,
        transparent: true, opacity: 0.78
      })
    );
    inner.rotation.x = Math.PI / 2 + 0.22;

    g.add(outer, inner);
    g.position.y = 2.9;
    return g;
  }

  /** A soft radial disc, used for the pool of light under the badge. */
  function radialTexture(inner, mid, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(128, 128, 4, 128, 128, 126);
    grd.addColorStop(0,    inner);
    grd.addColorStop(0.45, mid);
    grd.addColorStop(1,    outer || 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** A hollow soap bubble: faint fill, bright rim, one specular highlight. */
  function bubbleTexture() {
    const S = 128, r = S / 2;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');

    const body = ctx.createRadialGradient(r, r, 0, r, r, r);
    body.addColorStop(0,    'rgba(210,255,200,0.05)');
    body.addColorStop(0.72, 'rgba(200,255,180,0.10)');
    body.addColorStop(0.88, 'rgba(240,255,190,0.55)');
    body.addColorStop(0.97, 'rgba(255,240,140,0.85)');
    body.addColorStop(1,    'rgba(255,235,120,0)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.fill();

    const spec = ctx.createRadialGradient(r * 0.62, r * 0.58, 0, r * 0.62, r * 0.58, r * 0.30);
    spec.addColorStop(0, 'rgba(255,255,255,0.85)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.fillRect(0, 0, S, S);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function starTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0,   'rgba(255,255,255,1)');
    grd.addColorStop(0.3, 'rgba(255,235,140,0.75)');
    grd.addColorStop(1,   'rgba(255,210,30,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}
