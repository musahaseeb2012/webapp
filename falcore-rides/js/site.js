/* ==========================================================================
   FALCORE RIDES — page behaviour
   Loader, nav, scroll reveals, 3D card tilt, counters, and the booking form.
   No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- loader -- */

  var loader = document.getElementById('loader');

  function hideLoader() {
    if (!loader || loader.classList.contains('is-done')) return;
    loader.classList.add('is-done');
    setTimeout(function () { loader.remove(); }, 800);
  }

  // Whichever lands first: the 3D scene, the window load event, or a 4s
  // backstop so a slow asset can never trap someone on the splash.
  document.addEventListener('scene:ready',  function () { setTimeout(hideLoader, 250); });
  document.addEventListener('scene:failed', hideLoader);
  window.addEventListener('load', function () { setTimeout(hideLoader, 400); });
  setTimeout(hideLoader, 4000);

  /* ---------------------------------------------------------------- nav -- */

  var nav     = document.getElementById('nav');
  var toggle  = document.getElementById('navToggle');
  var links   = document.getElementById('navLinks');

  function closeMenu() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  var onScrollNav = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ------------------------------------------------- active section link -- */

  var sections = ['story', 'packages', 'process', 'book']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.querySelectorAll('a').forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------ reveals -- */

  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // Stagger siblings that come into view together.
        setTimeout(function () { entry.target.classList.add('is-in'); }, i * 80);
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* --------------------------------------------------------- 3D tilt -- */

  // Cards lean toward the cursor and light up under it. Pointer-driven, so
  // it simply never runs on touch devices.
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var inner = el.querySelector('.card__inner, .story__card') || el;
      var raf   = null;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var rx = (0.5 - py) * 11;
          var ry = (px - 0.5) * 13;
          inner.style.transform =
            'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
            ry.toFixed(2) + 'deg) translateY(-6px)';
          inner.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          inner.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
      });

      el.addEventListener('pointerleave', function () {
        if (raf) cancelAnimationFrame(raf);
        inner.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------- hero parallax -- */

  if (!reduced) {
    var parallaxEls = document.querySelectorAll('[data-parallax]');
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        parallaxEls.forEach(function (el) {
          var rate = parseFloat(el.dataset.parallax) || 0.15;
          el.style.setProperty('translate', '0 ' + (y * rate).toFixed(1) + 'px');
          el.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------ size switcher -- */

  // Every price on the page comes off the pressed button's data attributes,
  // so the prices are written down exactly once — in index.html.
  var sizeBtns = document.querySelectorAll('.size-btn');
  var sizeField = document.getElementById('f-size');

  function applySize(btn) {
    sizeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === btn));
    });

    ['interior', 'full'].forEach(function (svc) {
      var priceEl = document.querySelector('[data-price="' + svc + '"]');
      var metaEl  = document.querySelector('[data-meta="' + svc + '"]');
      if (!priceEl || !metaEl) return;

      var price = btn.dataset[svc === 'interior' ? 'interior' : 'full'];
      var hours = btn.dataset[svc === 'interior' ? 'hrsInterior' : 'hrsFull'];

      if (priceEl.textContent !== price && !reduced) {
        priceEl.classList.remove('is-changing');
        void priceEl.offsetWidth;          // restart the animation
        priceEl.classList.add('is-changing');
      }
      priceEl.textContent = price;
      metaEl.textContent  = btn.dataset.size + ' · ≈ ' + hours +
                            (hours === '1' ? ' hour' : ' hours');
    });

    // Carry the choice down to the booking form so it isn't asked twice.
    if (sizeField) sizeField.value = btn.dataset.size;
  }

  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { applySize(btn); });
  });

  // Whichever button ships pressed decides what the page opens on.
  var initial = document.querySelector('.size-btn[aria-pressed="true"]') || sizeBtns[0];
  if (initial) applySize(initial);

  /* ---------------------------------------------------------- counters -- */

  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var end    = parseFloat(el.dataset.count) || 0;
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';

    if (reduced || end === 0) {
      el.textContent = prefix + end + suffix;
      return;
    }

    var start = performance.now();
    var dur   = 1500;

    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(end * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* -------------------------------------------------------------- form -- */

  // Static hosting, no backend: hand the details to the visitor's mail app.
  // Swap this for a real endpoint (Formspree, Netlify Forms, your own API)
  // by replacing the submit handler below.
  var form = document.getElementById('bookForm');
  var note = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      note.classList.remove('is-ok', 'is-err');

      if (!form.checkValidity()) {
        form.reportValidity();
        note.textContent = 'Please fill in your name, phone and vehicle.';
        note.classList.add('is-err');
        return;
      }

      var data = new FormData(form);
      var subject = 'Detailing request — ' + (data.get('vehicle') || 'my car');
      var body = [
        'Name: '    + data.get('name'),
        'Phone: '   + data.get('phone'),
        'Vehicle: ' + data.get('vehicle'),
        'Size: '    + data.get('size'),
        'Service: ' + data.get('service'),
        '',
        'Notes:',
        data.get('notes') || '(none)'
      ].join('\n');

      var to = form.dataset.email || 'hello@falcorerides.com';
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body='    + encodeURIComponent(body);

      note.textContent = 'Opening your email app — hit send and I\'ll get back to you today.';
      note.classList.add('is-ok');
    });
  }

  /* -------------------------------------------------------------- misc -- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
