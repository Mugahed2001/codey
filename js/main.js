(() => {
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');

  /* ---------- theme (light default, dark optional) ---------- */
  const themeBtn = document.getElementById('themeBtn');
  const storedTheme = localStorage.getItem('codey-theme');
  if (storedTheme) html.setAttribute('data-theme', storedTheme);

  themeBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('codey-theme', next);
  });

  /* ---------- language (ar default, en optional) ---------- */
  const langBtn = document.getElementById('langBtn');
  const langLabel = document.getElementById('langLabel');
  const dict = window.CODEY_I18N || { ar: {}, en: {} };
  let currentLang = localStorage.getItem('codey-lang') || 'ar';

  const applyLang = (lang) => {
    currentLang = lang;
    const table = dict[lang] || {};
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    langLabel.textContent = lang === 'ar' ? 'EN' : 'AR';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (table[key] !== undefined) el.textContent = table[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const key = el.getAttribute('data-i18n-ph');
      if (table[key] !== undefined) el.setAttribute('placeholder', table[key]);
    });
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && table['meta.desc']) metaDesc.setAttribute('content', table['meta.desc']);

    localStorage.setItem('codey-lang', lang);
    if (window.codeyRelayoutSwap) requestAnimationFrame(window.codeyRelayoutSwap);
  };

  langBtn.addEventListener('click', () => applyLang(currentLang === 'ar' ? 'en' : 'ar'));
  applyLang(currentLang);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- navbar scroll state ---------- */
  const nav = document.getElementById('nav');
  const fab = document.getElementById('fabCta');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    fab.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    burger.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---------- reveal on scroll (manual rect check: more reliable than
     IntersectionObserver across resizes/print/headless-capture) ---------- */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const checkReveals = () => {
    const vh = window.innerHeight;
    revealEls.forEach(el => {
      if (el.classList.contains('in')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < vh - 60 && rect.bottom > 0) el.classList.add('in');
    });
  };
  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals);
  window.addEventListener('load', checkReveals);
  checkReveals();

  /* ---------- animated counters ---------- */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-card__num').forEach(c => counterIo.observe(c));

  /* ---------- hero word-swap (vertical slide, not a typewriter) ----------
     translateY(%) is relative to the track's OWN height (all stacked words),
     not a single word — so we measure pixel height per word instead. */
  const swapWrap = document.querySelector('.hero__title-swap');
  const track = document.getElementById('swapTrack');
  let swapIdx = 0;
  if (track && swapWrap) {
    const items = Array.from(track.children);
    const layoutSwap = () => {
      const h = items[0].getBoundingClientRect().height;
      swapWrap.style.height = h + 'px';
      track.style.transition = 'none';
      track.style.transform = `translateY(${-swapIdx * h}px)`;
      void track.offsetHeight;
      track.style.transition = '';
    };
    layoutSwap();
    window.addEventListener('resize', layoutSwap);
    window.addEventListener('load', layoutSwap);
    window.codeyRelayoutSwap = layoutSwap;

    setInterval(() => {
      swapIdx = (swapIdx + 1) % items.length;
      const h = items[0].getBoundingClientRect().height;
      track.style.transform = `translateY(${-swapIdx * h}px)`;
    }, 2400);
  }

  /* ---------- smooth anchor scroll offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 76;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- contact form (static, no backend yet) ---------- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const submitLabel = document.getElementById('submitLabel');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const message = form.message.value.trim();
    if (!name || !message) return;

    const table = dict[currentLang] || {};
    submitLabel.textContent = table['contact.sending'] || 'Sending...';
    setTimeout(() => {
      const subject = encodeURIComponent('Codey project — ' + name);
      const body = encodeURIComponent(
        `Name: ${name}\nPhone: ${form.phone.value}\nEmail: ${form.email.value}\n\nDetails:\n${message}`
      );
      window.location.href = `mailto:info@codeysaa.com?subject=${subject}&body=${body}`;
      submitLabel.textContent = table['contact.submit'] || 'Send';
      note.textContent = table['contact.sent'] || '';
      form.reset();
    }, 450);
  });
})();
