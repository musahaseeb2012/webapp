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
    refresh:    document.getElementById('refreshBtn')
  };

  var session = { idToken: null, refreshToken: null, expiresAt: 0, email: null };
  var bookings = [];
  var filter = 'new';

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

  /* ------------------------------------------------------------ bookings */

  function loadBookings() {
    el.status.hidden = false;
    el.status.textContent = 'Loading bookings…';

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
        render();
      });
    }).catch(function (err) {
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
      var tel = String(b.phone || '').replace(/[^\d+]/g, '');
      return '' +
      '<li class="booking' + (done ? ' is-done' : '') + '" data-index="' + i + '">' +
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
    el.board.hidden = false;
    el.signOut.hidden = false;
    el.refresh.hidden = false;
    loadBookings();
  }

  function showLogin(message, isError) {
    el.loginPanel.hidden = false;
    el.board.hidden = true;
    el.signOut.hidden = true;
    el.refresh.hidden = true;
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

  el.refresh.addEventListener('click', loadBookings);

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
