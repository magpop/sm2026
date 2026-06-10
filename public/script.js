/* ============================================================
   WEDDING INVITATION — script.js
   Safi & Maribelle · July 25, 2026
   ============================================================ */

const CONFIG = {
  weddingDate:  new Date('2026-07-25T18:30:00'),  // Ceremony at 6:30 PM
  coupleNames:  'Safi & Maribelle',
  rsvpDeadline: 'July 1, 2026',
};

// Guest tier: set by URL param, used by RSVP form (1 | 2 | 3 | null=unlimited)
let GUEST_TIER = null;

// ─────────────────────────────────────────────────────────────
// 1. FLOATING PINK PETALS
// ─────────────────────────────────────────────────────────────
(function initPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  // Soft pink rose petal colours
  const PETAL_COLORS = [
    'rgba(255,182,193,0.70)',  // light pink
    'rgba(255,153,176,0.60)',  // rose pink
    'rgba(255,214,224,0.65)',  // blush
    'rgba(255,192,203,0.70)',  // classic pink
    'rgba(250,200,215,0.60)',  // dusty rose
    'rgba(255,230,240,0.75)',  // very pale pink
    'rgba(255,255,255,0.50)',  // white foam petal
  ];

  // Petal-like border-radius shapes
  const SHAPES = [
    '50% 0 50% 0',
    '60% 0 60% 0',
    '50% 20% 50% 20%',
    '70% 30% 70% 30%',
    '45% 55% 45% 55%',
  ];

  function spawnPetal() {
    const el    = document.createElement('div');
    el.className = 'petal';
    const size   = 6 + Math.random() * 10;
    const left   = Math.random() * 100;
    const dur    = 8 + Math.random() * 10;
    const delay  = Math.random() * 6;
    const color  = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const shape  = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const rot    = -15 + Math.random() * 30;

    Object.assign(el.style, {
      width:             size + 'px',
      height:            (size * 1.45) + 'px',
      left:              left + '%',
      background:        color,
      animationDuration: dur + 's',
      animationDelay:    delay + 's',
      borderRadius:      shape,
      transform:         `rotate(${rot}deg)`,
    });

    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay + 2) * 1000 * 2);
  }

  // Stagger initial spawn
  for (let i = 0; i < 25; i++) {
    setTimeout(spawnPetal, i * 350);
  }
  setInterval(spawnPetal, 700);
})();

// ─────────────────────────────────────────────────────────────
// 2. SCROLL REVEAL (IntersectionObserver)
// ─────────────────────────────────────────────────────────────
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => observer.observe(el));
})();

// ─────────────────────────────────────────────────────────────
// 3. COUNTDOWN TIMER
// ─────────────────────────────────────────────────────────────
(function initCountdown() {
  const cdDays    = document.getElementById('cd-days');
  const cdHours   = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');
  if (!cdDays) return;

  const pad = (n, w = 2) => String(n).padStart(w, '0');

  function tick() {
    const diff = CONFIG.weddingDate.getTime() - Date.now();
    if (diff <= 0) {
      cdDays.textContent = '000';
      cdHours.textContent = cdMinutes.textContent = cdSeconds.textContent = '00';
      return;
    }
    cdDays.textContent    = pad(Math.floor(diff / 86400000), 3);
    cdHours.textContent   = pad(Math.floor((diff % 86400000) / 3600000));
    cdMinutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
    cdSeconds.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
})();

// ─────────────────────────────────────────────────────────────
// 4. BACKGROUND MUSIC
// ─────────────────────────────────────────────────────────────
(function initMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-toggle');
  const icon  = btn ? btn.querySelector('.music-icon') : null;
  if (!audio || !btn) return;

  audio.volume = 0.35;
  let playing = false;

  function fadeIn() {
    audio.volume = 0;
    audio.play().then(() => {
      const iv = setInterval(() => {
        if (audio.volume < 0.33) audio.volume = Math.min(0.35, audio.volume + 0.02);
        else clearInterval(iv);
      }, 80);
    }).catch(() => {});
  }

  function fadeOut() {
    const iv = setInterval(() => {
      if (audio.volume > 0.03) audio.volume = Math.max(0, audio.volume - 0.02);
      else { audio.pause(); clearInterval(iv); }
    }, 80);
  }

  function toggle() {
    if (playing) {
      fadeOut();
      btn.classList.remove('playing');
      if (icon) icon.textContent = '♪';
      btn.setAttribute('aria-label', 'Play music');
    } else {
      fadeIn();
      btn.classList.add('playing');
      if (icon) icon.textContent = '♫';
      btn.setAttribute('aria-label', 'Pause music');
    }
    playing = !playing;
  }

  btn.addEventListener('click', toggle);

  // Auto-play on scroll or user interaction
  const tryAuto = () => { if (!playing) toggle(); };
  document.addEventListener('click', tryAuto, { once: true });
  document.addEventListener('touchstart', tryAuto, { once: true });
  document.addEventListener('scroll', tryAuto, { once: true, passive: true });
})();

// ─────────────────────────────────────────────────────────────
// 5. (Removed standalone video player, now video bg)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 6. COPY ACCOUNT NUMBER (gift section)
// ─────────────────────────────────────────────────────────────
function copyAccount() {
  const numEl   = document.getElementById('account-number');
  const msgEl   = document.getElementById('gift-copied-msg');
  const copyBtn = document.getElementById('copy-account-btn');
  if (!numEl) return;

  const text = numEl.textContent.trim();

  const succeed = () => {
    if (msgEl) msgEl.classList.remove('hidden');
    if (copyBtn) {
      copyBtn.classList.add('copied');
      const span = copyBtn.querySelector('.copy-icon-text');
      if (span) span.textContent = 'Copied!';
    }
    setTimeout(() => {
      if (msgEl) msgEl.classList.add('hidden');
      if (copyBtn) {
        copyBtn.classList.remove('copied');
        const span = copyBtn.querySelector('.copy-icon-text');
        if (span) span.textContent = 'Copy';
      }
    }, 2500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(succeed).catch(() => {
      // Fallback
      legacyCopy(text);
      succeed();
    });
  } else {
    legacyCopy(text);
    succeed();
  }
}

function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); } catch (_) {}
  document.body.removeChild(ta);
}

// ─────────────────────────────────────────────────────────────
// 7. GUEST TIER  —  read from ?guests=1|2|3|unlimited
// ─────────────────────────────────────────────────────────────
// Generate invitation links:
//   /           → ?guests=1    (1 person)
//   /           → ?guests=2    (up to 2 people)
//   /           → ?guests=3    (up to 3 people)
//   /           → ?guests=unlimited  (open number — couple uses this)
(function initGuestTier() {
  const params    = new URLSearchParams(window.location.search);
  const tier      = (params.get('guests') || '').toLowerCase().trim();
  const textEl    = document.getElementById('allocation-text');
  const unlimEl   = document.getElementById('unlimited-input');
  const hiddenEl  = document.getElementById('rsvp-guests-hidden');

  if (!textEl) return;

  if (tier === '1') {
    GUEST_TIER = 1;
    textEl.textContent = 'Your invitation is reserved for 1 guest';
    if (hiddenEl) hiddenEl.value = '1';
  } else if (tier === '2') {
    GUEST_TIER = 2;
    textEl.textContent = 'Your invitation is reserved for up to 2 guests';
    if (hiddenEl) hiddenEl.value = '2';
  } else if (tier === '3') {
    GUEST_TIER = 3;
    textEl.textContent = 'Your invitation is reserved for up to 3 guests';
    if (hiddenEl) hiddenEl.value = '3';
  } else {
    // unlimited or no param
    GUEST_TIER = null;
    textEl.textContent = 'How many guests will be joining you?';
    if (unlimEl) unlimEl.classList.remove('hidden');
    if (hiddenEl) hiddenEl.value = '1';
  }
})();

// ─────────────────────────────────────────────────────────────
// 8. RSVP FORM
// ─────────────────────────────────────────────────────────────
(function initRsvp() {
  const form          = document.getElementById('rsvp-form');
  const btnYes        = document.getElementById('btn-attending');
  const btnNo         = document.getElementById('btn-not-attending');
  const attendingVal  = document.getElementById('attending-value');
  const guestGroup    = document.getElementById('guest-count-group');
  const guestInput    = document.getElementById('rsvp-guests');      // unlimited stepper
  const hiddenGuest   = document.getElementById('rsvp-guests-hidden');
  const minusBtn      = document.getElementById('guests-minus');
  const plusBtn       = document.getElementById('guests-plus');
  const submitBtn     = document.getElementById('rsvp-submit');
  const submitText    = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  const responseDiv   = document.getElementById('rsvp-response');

  if (!form) return;

  // ── Attending toggle ──────────────────────────────────────
  let isAttending = true;

  function setAttending(value) {
    isAttending = value;
    attendingVal.value = String(value);
    if (value) {
      btnYes.classList.add('active');    btnNo.classList.remove('active');
      btnYes.setAttribute('aria-pressed', 'true');
      btnNo.setAttribute('aria-pressed', 'false');
      if (guestGroup) guestGroup.style.display = '';
    } else {
      btnNo.classList.add('active');     btnYes.classList.remove('active');
      btnNo.setAttribute('aria-pressed', 'true');
      btnYes.setAttribute('aria-pressed', 'false');
      if (guestGroup) guestGroup.style.display = 'none';
    }
  }

  btnYes.addEventListener('click', () => setAttending(true));
  btnNo.addEventListener('click',  () => setAttending(false));

  // ── Guest count (unlimited tier only) ────────────────────
  function updateGuests(delta) {
    if (!guestInput) return;
    const next = Math.min(30, Math.max(1, (parseInt(guestInput.value) || 1) + delta));
    guestInput.value = next;
    if (hiddenGuest) hiddenGuest.value = next;
  }
  if (minusBtn) minusBtn.addEventListener('click', () => updateGuests(-1));
  if (plusBtn)  plusBtn.addEventListener('click',  () => updateGuests(+1));

  function getGuestCount() {
    if (GUEST_TIER !== null) return GUEST_TIER;
    return parseInt((guestInput ? guestInput.value : null) || hiddenGuest?.value) || 1;
  }

  // ── UI helpers ────────────────────────────────────────────
  function showResponse(msg, type) {
    responseDiv.textContent = msg;
    responseDiv.className   = `rsvp-response ${type}`;
    responseDiv.classList.remove('hidden');
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitText.classList.toggle('hidden', on);
    submitLoading.classList.toggle('hidden', !on);
  }

  // ── Submit ────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvp-name').value.trim();
    if (!name || name.length < 2) {
      showResponse('Please enter your full name.', 'error');
      document.getElementById('rsvp-name').focus();
      return;
    }

    setLoading(true);
    responseDiv.classList.add('hidden');

    const guestNamesEl = document.getElementById('rsvp-guest-names');
    const payload = {
      name,
      attending:  isAttending,
      guestCount: getGuestCount(),
      guestNames: guestNamesEl ? guestNamesEl.value.trim() : '',
      message:    document.getElementById('rsvp-message').value.trim(),
    };

    try {
      const res  = await fetch('/api/rsvp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showResponse(
          isAttending
            ? (data.updated
                ? `✓ We've updated your RSVP, ${name}! See you on July 25th! 🎉`
                : `✓ Wonderful, ${name}! We can't wait to celebrate with you! 🎉`)
            : `✓ Thank you for letting us know, ${name}. We'll miss you on our special day. 💕`,
          'success'
        );
        form.reset();
        setAttending(true);
        if (guestInput) guestInput.value = 1;
        if (hiddenGuest) hiddenGuest.value = GUEST_TIER || 1;
      } else {
        showResponse(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showResponse('Could not connect to the server. Please check your connection and try again.', 'error');
      console.error('RSVP error:', err);
    } finally {
      setLoading(false);
    }
  });
})();

// ─────────────────────────────────────────────────────────────
// 9. PARALLAX HERO (subtle)
// ─────────────────────────────────────────────────────────────
(function initParallax() {
  const hero = document.querySelector('.hero-section');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= hero.offsetHeight) hero.style.setProperty('--parallax-y', `${y * 0.35}px`);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  const style = document.createElement('style');
  style.textContent = `.hero-section::after { transform: translateY(var(--parallax-y, 0)); }`;
  document.head.appendChild(style);
})();

// ─────────────────────────────────────────────────────────────
// 10. SMOOTH ANCHOR NAV
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
