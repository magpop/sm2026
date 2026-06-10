/* ============================================================
   WEDDING INVITATION — script.js
   ============================================================ */

// ── CONFIGURATION ── (edit these values for your wedding)
const CONFIG = {
  weddingDate:   new Date('2026-10-18T16:00:00'),   // Wedding date/time
  coupleNames:   'Sophia & Alexander',
  rsvpDeadline:  'September 1, 2026',
};

// ─────────────────────────────────────────────────────────────
// 1. FLOATING PETALS
// ─────────────────────────────────────────────────────────────
(function initPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  const PETAL_COLORS = [
    'rgba(212,184,197,0.75)',  // mauve-pink
    'rgba(201,169,110,0.55)',  // gold
    'rgba(232,213,176,0.65)',  // gold-light
    'rgba(197,217,197,0.65)',  // sage
    'rgba(245,230,232,0.8)',   // soft rose
    'rgba(255,255,255,0.6)',   // white
  ];

  function spawnPetal() {
    const el = document.createElement('div');
    el.className = 'petal';
    const size    = 8 + Math.random() * 14;
    const left    = Math.random() * 100;
    const dur     = 7 + Math.random() * 10;
    const delay   = Math.random() * 6;
    const color   = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const skewX   = -20 + Math.random() * 40;

    Object.assign(el.style, {
      width:  size + 'px',
      height: size + 'px',
      left:   left + '%',
      background:           color,
      animationDuration:    dur + 's',
      animationDelay:       delay + 's',
      transform:            `skewX(${skewX}deg)`,
      borderRadius:         Math.random() > 0.5 ? '50% 0 50% 0' : '50%',
    });

    container.appendChild(el);

    // Remove after one cycle to keep DOM clean
    el.addEventListener('animationiteration', () => {
      el.style.animationDelay = '0s';
    }, { once: true });

    setTimeout(() => el.remove(), (dur + delay + 2) * 1000 * 4);
  }

  // Spawn 30 initial petals staggered
  for (let i = 0; i < 30; i++) {
    setTimeout(spawnPetal, i * 300);
  }

  // Keep spawning every 800ms
  setInterval(spawnPetal, 800);
})();

// ─────────────────────────────────────────────────────────────
// 2. SCROLL REVEAL (IntersectionObserver)
// ─────────────────────────────────────────────────────────────
(function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.reveal-fade, .reveal-up, .reveal-left, .reveal-right'
  );

  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
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

  function pad(n, width = 2) {
    return String(n).padStart(width, '0');
  }

  function tick() {
    const now  = Date.now();
    const diff = CONFIG.weddingDate.getTime() - now;

    if (diff <= 0) {
      cdDays.textContent    = '000';
      cdHours.textContent   = '00';
      cdMinutes.textContent = '00';
      cdSeconds.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    cdDays.textContent    = pad(days, 3);
    cdHours.textContent   = pad(hours);
    cdMinutes.textContent = pad(minutes);
    cdSeconds.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();

// ─────────────────────────────────────────────────────────────
// 4. BACKGROUND MUSIC
// ─────────────────────────────────────────────────────────────
(function initMusic() {
  const audio  = document.getElementById('bg-music');
  const btn    = document.getElementById('music-toggle');
  const icon   = btn ? btn.querySelector('.music-icon') : null;
  if (!audio || !btn) return;

  audio.volume = 0.35;
  let playing  = false;

  function fadeIn() {
    audio.volume = 0;
    audio.play().then(() => {
      const interval = setInterval(() => {
        if (audio.volume < 0.33) {
          audio.volume = Math.min(0.35, audio.volume + 0.02);
        } else {
          clearInterval(interval);
        }
      }, 80);
    }).catch(() => { /* autoplay blocked */ });
  }

  function fadeOut() {
    const interval = setInterval(() => {
      if (audio.volume > 0.03) {
        audio.volume = Math.max(0, audio.volume - 0.02);
      } else {
        audio.pause();
        clearInterval(interval);
      }
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

  // Try to auto-play after first user gesture anywhere on page
  const tryAutoPlay = () => {
    if (!playing) {
      toggle();
      document.removeEventListener('click', tryAutoPlay);
      document.removeEventListener('touchstart', tryAutoPlay);
    }
  };
  document.addEventListener('click', tryAutoPlay, { once: true });
  document.addEventListener('touchstart', tryAutoPlay, { once: true });
})();

// ─────────────────────────────────────────────────────────────
// 5. RSVP FORM
// ─────────────────────────────────────────────────────────────
(function initRsvp() {
  const form          = document.getElementById('rsvp-form');
  const btnYes        = document.getElementById('btn-attending');
  const btnNo         = document.getElementById('btn-not-attending');
  const attendingVal  = document.getElementById('attending-value');
  const guestGroup    = document.getElementById('guest-count-group');
  const dietaryGroup  = document.getElementById('dietary-group');
  const guestInput    = document.getElementById('rsvp-guests');
  const minusBtn      = document.getElementById('guests-minus');
  const plusBtn       = document.getElementById('guests-plus');
  const submitBtn     = document.getElementById('rsvp-submit');
  const submitText    = document.getElementById('submit-text');
  const submitLoading = document.getElementById('submit-loading');
  const responseDiv   = document.getElementById('rsvp-response');

  if (!form) return;

  // ── Attending toggle ─────────────────────────────────────
  let isAttending = true;

  function setAttending(value) {
    isAttending = value;
    attendingVal.value = String(value);

    if (value) {
      btnYes.classList.add('active');
      btnNo.classList.remove('active');
      btnYes.setAttribute('aria-pressed', 'true');
      btnNo.setAttribute('aria-pressed', 'false');
      guestGroup.style.display   = '';
      dietaryGroup.style.display = '';
    } else {
      btnNo.classList.add('active');
      btnYes.classList.remove('active');
      btnNo.setAttribute('aria-pressed', 'true');
      btnYes.setAttribute('aria-pressed', 'false');
      guestGroup.style.display   = 'none';
      dietaryGroup.style.display = 'none';
    }
  }

  btnYes.addEventListener('click', () => setAttending(true));
  btnNo.addEventListener('click',  () => setAttending(false));

  // ── Guest count ──────────────────────────────────────────
  function updateGuests(delta) {
    const current = parseInt(guestInput.value) || 1;
    const next    = Math.min(10, Math.max(1, current + delta));
    guestInput.value = next;
  }
  minusBtn.addEventListener('click', () => updateGuests(-1));
  plusBtn.addEventListener('click',  () => updateGuests(+1));

  // ── Form submission ──────────────────────────────────────
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

    const payload = {
      name,
      attending:    isAttending,
      guestCount:   parseInt(guestInput.value) || 1,
      dietaryNotes: document.getElementById('rsvp-dietary').value.trim(),
      message:      document.getElementById('rsvp-message').value.trim(),
    };

    try {
      const res  = await fetch('/api/rsvp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const updated = data.updated;
        if (isAttending) {
          showResponse(
            updated
              ? `✓ We've updated your RSVP, ${name}! We can't wait to see you on October 18th. 🎉`
              : `✓ Wonderful! We've received your RSVP, ${name}. We can't wait to celebrate with you! 🎉`,
            'success'
          );
        } else {
          showResponse(
            `✓ Thank you for letting us know, ${name}. We'll miss you on our special day. 💕`,
            'success'
          );
        }
        form.reset();
        setAttending(true);
        guestInput.value = 1;
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
// 6. PARALLAX HERO (subtle)
// ─────────────────────────────────────────────────────────────
(function initParallax() {
  const hero = document.querySelector('.hero-section');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroH = hero.offsetHeight;
        if (y <= heroH) {
          hero.style.setProperty('--parallax-y', `${y * 0.35}px`);
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Apply parallax via CSS custom property
  const style = document.createElement('style');
  style.textContent = `.hero-section::after { transform: translateY(var(--parallax-y, 0)); }`;
  document.head.appendChild(style);
})();

// ─────────────────────────────────────────────────────────────
// 7. SMOOTH ANCHOR NAVIGATION
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
