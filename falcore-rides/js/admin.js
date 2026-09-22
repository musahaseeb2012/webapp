/* ==========================================================================
   FALCORE RIDES — bookings dashboard

   Signs in against Firebase Auth and reads the bookings collection, both over
   Google's REST APIs. Same reasoning as the booking form: the Firebase JS SDK
   would be a large dependency for what amounts to four HTTP calls, and the
   security rules are what protect the data either way.

   Nothing here is a security boundary. Anyone can open this page and read this
   script — that is fine. Whether they see a single booking is decided by
   firestore.rules on Google's servers, which name the one account allowed to
   read. Hiding the page would add nothing.
   ========================================================================== */

(function () {
  'use strict';

  var cfg = window.FALCORE_FIREBASE || {};
  var STORE_KEY = 'falcore.admin.refreshToken';

  var el = {
    loginPanel: document.getElementById('loginPanel'),
    loginForm:  document.getElementById('loginForm'),
    loginNote:  document.getElementById('loginNote'),
    email:      document.getElementById('a-email'),
    pass:       document.getElementById('a-pass'),
    board:      document.getElementById('board'),
    list:       document.getElementById('bookings'),
    status:     document.getElementById('boardStatus'),
    counts:     document.getElementById('counts'),
    signOut:    document.getElementById('signOutBtn'),
    refresh:    document.getElementById('refreshBtn'),
    alerts:     document.getElementById('alertsBtn'),
    alertsLbl:  document.getElementById('alertsLabel'),
    banner:     document.getElementById('newBanner')
  };

  var session = { idToken: null, refreshToken: null, expiresAt: 0, email: null };
  var bookings = [];
  var filter = 'new';

  var POLL_MS = 45000;            // ~1,900 reads/day if left open all day
  var ALERTS_KEY = 'falcore.admin.alerts';
  var knownIds = null;            // null until the first load, so opening the
                                  // page doesn't announce every existing booking
  var freshIds = {};              // arrived since you last looked
  var pollTimer = null;
  var audioCtx = null;
  var baseTitle = document.title;

  /* ------------------------------------------------------------- helpers */

  function configured() {
    return !!(cfg.projectId && cfg.apiKey && cfg.collection &&
              cfg.projectId.indexOf('YOUR_') !== 0 &&
              cfg.apiKey.indexOf('YOUR_') !== 0);
  }

  function docsUrl(suffix) {
    return 'https://firestore.googleapis.com/v1/projects/' +
           encodeURIComponent(cfg.projectId) +
           '/databases/(default)/documents' + (suffix || '');
  }

  // Firestore returns every value wrapped in its type; unwrap the ones we use.
  function plain(fields) {
    var out = {};
    Object.keys(fields || {}).forEach(function (k) {
      var v = fields[k];
      out[k] = v.stringValue !== undefined ? v.stringValue
             : v.integerValue !== undefined ? Number(v.integerValue)
             : v.booleanValue !== undefined ? v.booleanValue
             : v.nullValue !== undefined ? null
             : '';
    });
    return out;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function whenText(iso, createTime) {
    var d = new Date(iso || createTime);
    if (isNaN(d)) return '';
    return d.toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  /* --------------------------------------------------- email verification */

  // The rules require a verified address, and an account created by hand in
  // the Firebase console starts out unverified — so without this you would
  // sign in successfully and then be refused every booking, with nothing on
  // screen explaining why.
  function tokenClaims() {
    try {
      var part = session.idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (part.length % 4) part += '=';
      var bytes = Uint8Array.from(atob(part), function (c) { return c.charCodeAt(0); });
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) {
      return {};
    }
  }

  function sendVerificationEmail() {
    return fetch('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' +
                 encodeURIComponent(cfg.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken: session.idToken })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error((data.error && data.error.message) || 'could not send');
        return data;
      });
    });
  }

  function showVerifyPrompt() {
    el.board.hidden = false;
    el.signOut.hidden = false;
    el.refresh.hidden = true;
    el.list.innerHTML = '';
    el.counts.innerHTML = '';
    el.status.hidden = false;
    el.status.innerHTML =
      '<strong>One step left: confirm your email.</strong><br>' +
      'Accounts created in the Firebase console start out unverified, and the ' +
      'rules only hand bookings to a verified address.' +
      '<p style="margin:1rem 0 0"><button type="button" class="btn btn--primary" id="verifyBtn">' +
      'Email me a confirmation link</button></p>' +
      '<p style="margin:.9rem 0 0" id="verifyNote">Then open the link, come back, and sign in again.</p>';

    document.getElementById('verifyBtn').addEventListener('click', function () {
      var btn = this;
      var note = document.getElementById('verifyNote');
      btn.disabled = true;
      note.textContent = 'Sending…';
      sendVerificationEmail().then(function () {
        note.textContent = 'Sent to ' + (session.email || 'your address') +
                           '. Open the link, then sign out and back in.';
      }).catch(function (err) {
        note.textContent = 'Could not send it: ' + err.message;
        btn.disabled = false;
      });
    });
  }

  /* ---------------------------------------------------------------- auth */

  function signIn(email, password) {
    return fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
                 encodeURIComponent(cfg.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, returnSecureToken: true })
    }).then(readAuthResponse);
  }

  function refreshSession(refreshToken) {
    return fetch('https://securetoken.googleapis.com/v1/token?key=' +
                 encodeURIComponent(cfg.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error((data.error && data.error.message) || 'refresh failed');
        // The refresh endpoint uses snake_case; sign-in uses camelCase.
        return applySession({
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          email: session.email
        });
      });
    });
  }

  function readAuthResponse(res) {
    return res.json().then(function (data) {
      if (!res.ok) throw new Error((data.error && data.error.message) || 'sign-in failed');
      return applySession(data);
    });
  }

  function applySession(data) {
    session.idToken = data.idToken;
    session.refreshToken = data.refreshToken;
    session.email = data.email || session.email;
    session.expiresAt = Date.now() + (Number(data.expiresIn || 3600) - 60) * 1000;
    try { localStorage.setItem(STORE_KEY, session.refreshToken); } catch (e) { /* private mode */ }
    return session;
  }

  function forgetSession() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    knownIds = null;
    freshIds = {};
    document.title = baseTitle;
    session = { idToken: null, refreshToken: null, expiresAt: 0, email: null };
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
  }

  // Every request goes through here so an hour-old token renews itself instead
  // of dumping you back at the login screen mid-task.
  function authed(url, options) {
    var run = function () {
      var opts = options || {};
      opts.headers = Object.assign({}, opts.headers, {
        'Authorization': 'Bearer ' + session.idToken
      });
      return fetch(url, opts);
    };

    if (session.idToken && Date.now() < session.expiresAt) return run();
    if (!session.refreshToken) return Promise.reject(new Error('not signed in'));
    return refreshSession(session.refreshToken).then(run);
  }

  /* ------------------------------------------------------------- alerts */

  // A web page can only alert you while it is open — there is no server here
  // pushing to a closed browser. Kept open in a tab (or added to the Home
  // Screen on an iPad), this polls and tells you the moment one lands.

  function alertsOn() {
    try { return localStorage.getItem(ALERTS_KEY) === 'on'; } catch (e) { return false; }
  }

  function setAlerts(on) {
    try { localStorage.setItem(ALERTS_KEY, on ? 'on' : 'off'); } catch (e) { /* ignore */ }
    el.alerts.setAttribute('aria-pressed', String(on));
    el.alertsLbl.textContent = on ? 'Alerts on' : 'Alerts off';
  }

  // Two rising notes, synthesised — no audio file to load or lose.
  function chime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      [[880, 0], [1245, 0.14]].forEach(function (pair) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = pair[0];
        var t = audioCtx.currentTime + pair[1];
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.32);
      });
    } catch (e) { /* a silent failure here is fine */ }
  }

  function systemNotify(arrivals) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      var one = arrivals.length === 1 ? arrivals[0] : null;
      new Notification(
        one ? 'New detail booked' : arrivals.length + ' new bookings',
        {
          body: one
            ? one.name + ' — ' + (one.vehicle || 'vehicle') +
              (one.service ? '\n' + one.service : '')
            : 'Open the dashboard to see them.',
          icon: 'assets/logo-512.png',
          badge: 'assets/logo-512.png',
          tag: 'falcore-booking',
          renotify: true
        }
      ).onclick = function () { window.focus(); this.close(); };
    } catch (e) { /* some browsers throw without a service worker */ }
  }

  function showBanner(arrivals) {
    var one = arrivals.length === 1 ? arrivals[0] : null;
    el.banner.hidden = false;
    el.banner.innerHTML =
      '<span>🔔 <b>' + (one ? 'New detail booked' : arrivals.length + ' new bookings') +
      '</b>' + (one ? ' — ' + escapeHtml(one.name) + ', ' +
                      escapeHtml(one.vehicle || 'vehicle') : '') + '</span>' +
      '<button type="button" aria-label="Dismiss">&times;</button>';
    el.banner.querySelector('button').addEventListener('click', clearFresh);
  }

  function announce(arrivals) {
    if (!arrivals.length) return;
    arrivals.forEach(function (b) { freshIds[b._name] = true; });

    showBanner(arrivals);
    document.title = '(' + Object.keys(freshIds).length + ') ' + baseTitle;

    if (alertsOn()) {
      chime();
      systemNotify(arrivals);
    }
  }

  function clearFresh() {
    freshIds = {};
    el.banner.hidden = true;
    document.title = baseTitle;
    render();
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      if (session.refreshToken) loadBookings({ quiet: true });
    }, POLL_MS);
  }

  /* ------------------------------------------------------------ bookings */

  function loadBookings(opts) {
    var quiet = !!(opts && opts.quiet);   // a background poll shouldn't blank the list
    if (!quiet) {
      el.status.hidden = false;
      el.status.textContent = 'Loading bookings…';
    }

    var url = docsUrl('/' + encodeURIComponent(cfg.collection)) +
              '?pageSize=200&orderBy=' + encodeURIComponent('submittedAt desc');

    return authed(url).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data.error && data.error.message) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        bookings = (data.documents || []).map(function (doc) {
          var b = plain(doc.fields);
          b._name = doc.name;
          b._createTime = doc.createTime;
          b.status = b.status || 'new';
          return b;
        });

        // Anything whose id wasn't in the previous load is new. knownIds is
        // null on the very first load, so opening the page stays silent.
        var seen = knownIds;
        var arrivals = seen
          ? bookings.filter(function (b) { return !seen[b._name]; })
          : [];

        knownIds = {};
        bookings.forEach(function (b) { knownIds[b._name] = true; });

        // announce() marks the arrivals fresh, so it has to run before the
        // cards are drawn or the highlight lands a render too late.
        announce(arrivals);
        render();
      });
    }).catch(function (err) {
      if (quiet) return;            // keep what's on screen; try again next poll
      el.list.innerHTML = '';
      el.status.hidden = false;

      if (/PERMISSION_DENIED|Missing or insufficient/i.test(err.message)) {
        el.status.innerHTML =
          '<strong>Firestore refused the read.</strong><br>' +
          'Your rules name which account may read bookings. Put <code>' +
          escapeHtml(session.email || 'your address') + '</code> in the ' +
          '<code>isAdmin()</code> list in <code>firestore.rules</code>, verify the ' +
          'address in Firebase console → Authentication, then run ' +
          '<code>firebase deploy --only firestore:rules</code>.';
      } else {
        el.status.textContent = 'Could not load bookings: ' + err.message;
      }
    });
  }

  function setStatus(booking, status) {
    var url = 'https://firestore.googleapis.com/v1/' + booking._name +
              '?updateMask.fieldPaths=status';
    return authed(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { status: { stringValue: status } } })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      booking.status = status;
      render();
    }).catch(function (err) {
      alert('Could not update that booking: ' + err.message);
    });
  }

  function removeBooking(booking) {
    if (!confirm('Delete the request from ' + booking.name + '? This cannot be undone.')) return;
    return authed('https://firestore.googleapis.com/v1/' + booking._name, { method: 'DELETE' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        bookings = bookings.filter(function (b) { return b !== booking; });
        render();
      }).catch(function (err) {
        alert('Could not delete that booking: ' + err.message);
      });
  }

  /* -------------------------------------------------------------- render */

  function render() {
    var newCount  = bookings.filter(function (b) { return b.status !== 'done'; }).length;
    var doneCount = bookings.length - newCount;

    el.counts.innerHTML =
      '<b>' + newCount + '</b> new' +
      '<span>·</span>' + doneCount + ' done' +
      '<span>·</span>' + bookings.length + ' total';

    var shown = bookings.filter(function (b) {
      return filter === 'all' ? true
           : filter === 'done' ? b.status === 'done'
           : b.status !== 'done';
    });

    if (!shown.length) {
      el.status.hidden = false;
      el.status.textContent = bookings.length
        ? 'Nothing in this view.'
        : 'No booking requests yet. They land here the moment someone sends the form.';
      el.list.innerHTML = '';
      return;
    }

    el.status.hidden = true;
    el.list.innerHTML = shown.map(function (b, i) {
      var done = b.status === 'done';
      var fresh = !!freshIds[b._name];
      var tel = String(b.phone || '').replace(/[^\d+]/g, '');
      return '' +
      '<li class="booking' + (done ? ' is-done' : '') + (fresh ? ' is-fresh' : '') +
          '" data-index="' + i + '">' +
        '<div class="booking__head">' +
          '<h2 class="booking__name">' + escapeHtml(b.name) + '</h2>' +
          '<span class="booking__when">' + escapeHtml(whenText(b.submittedAt, b._createTime)) + '</span>' +
        '</div>' +
        '<dl class="booking__grid">' +
          '<div><dt>Phone</dt><dd><a href="tel:' + escapeHtml(tel) + '">' + escapeHtml(b.phone) + '</a></dd></div>' +
          '<div><dt>Vehicle</dt><dd>' + escapeHtml(b.vehicle) + '</dd></div>' +
          '<div><dt>Size</dt><dd>' + escapeHtml(b.size || '—') + '</dd></div>' +
          '<div><dt>Service</dt><dd>' + escapeHtml(b.service || '—') + '</dd></div>' +
        '</dl>' +
        (b.notes ? '<p class="booking__notes">' + escapeHtml(b.notes) + '</p>' : '') +
        '<div class="booking__actions">' +
          '<button type="button" class="btn btn--ghost" data-act="toggle">' +
            (done ? 'Mark as new' : 'Mark as done') + '</button>' +
          '<button type="button" class="btn btn--ghost booking__delete" data-act="delete">Delete</button>' +
        '</div>' +
      '</li>';
    }).join('');

    // One listener for the whole list rather than two per card.
    el.list.onclick = function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var li = btn.closest('.booking');
      var b = shown[Number(li.dataset.index)];
      if (!b) return;
      if (btn.dataset.act === 'delete') removeBooking(b);
      else setStatus(b, b.status === 'done' ? 'new' : 'done');
    };
  }

  /* --------------------------------------------------------------- views */

  function showBoard() {
    el.loginPanel.hidden = true;

    // Catch the unverified case here rather than letting it surface as a bare
    // permission error from Firestore.
    if (tokenClaims().email_verified === false) {
      showVerifyPrompt();
      return;
    }

    el.board.hidden = false;
    el.signOut.hidden = false;
    el.refresh.hidden = false;
    el.alerts.hidden = false;
    setAlerts(alertsOn());
    loadBookings();
    startPolling();
  }

  function showLogin(message, isError) {
    el.loginPanel.hidden = false;
    el.board.hidden = true;
    el.signOut.hidden = true;
    el.refresh.hidden = true;
    el.alerts.hidden = true;
    if (message) {
      el.loginNote.textContent = message;
      el.loginNote.classList.toggle('is-err', !!isError);
    }
  }

  /* ---------------------------------------------------------------- boot */

  if (!configured()) {
    showLogin('Firebase isn\'t configured yet — fill in js/firebase-config.js first.', true);
    el.loginForm.querySelector('button').disabled = true;
    return;
  }

  el.loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!el.loginForm.checkValidity()) { el.loginForm.reportValidity(); return; }

    var btn = el.loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    el.loginNote.classList.remove('is-err');
    el.loginNote.textContent = 'Signing in…';

    signIn(el.email.value.trim(), el.pass.value).then(function () {
      el.pass.value = '';
      showBoard();
    }).catch(function (err) {
      var human = {
        'EMAIL_NOT_FOUND': 'No account with that email.',
        'INVALID_PASSWORD': 'Wrong password.',
        'INVALID_LOGIN_CREDENTIALS': 'Email or password is wrong.',
        'USER_DISABLED': 'That account is disabled.',
        'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many attempts — wait a minute and try again.',
        'OPERATION_NOT_ALLOWED': 'Turn on Email/Password in Firebase console → Authentication → Sign-in method.'
      }[err.message] || err.message;
      el.loginNote.textContent = human;
      el.loginNote.classList.add('is-err');
    }).then(function () {
      btn.disabled = false;
    });
  });

  el.signOut.addEventListener('click', function () {
    forgetSession();
    showLogin('Signed out.', false);
  });

  el.refresh.addEventListener('click', function () { loadBookings(); });

  el.alerts.addEventListener('click', function () {
    if (alertsOn()) { setAlerts(false); return; }

    // Ask for permission from inside the click — browsers refuse otherwise.
    // Safari on iOS only offers this once the site is on the Home Screen.
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(function () { setAlerts(true); chime(); });
    } else {
      setAlerts(true);
      chime();                      // also unlocks audio for later alerts
    }
  });

  // Coming back to the tab means you've seen them.
  window.addEventListener('focus', function () {
    if (Object.keys(freshIds).length) clearFresh();
  });

  document.querySelectorAll('.board__filters .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.board__filters .chip')
        .forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      filter = chip.dataset.filter;
      render();
    });
  });

  // Pick up where you left off if the browser still holds a refresh token.
  var stored = null;
  try { stored = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }

  if (stored) {
    session.refreshToken = stored;
    refreshSession(stored).then(showBoard).catch(function () {
      forgetSession();
      showLogin();
    });
  } else {
    showLogin();
  }

})();
