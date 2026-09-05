(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- navbar scroll state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    fab.classList.toggle('show', window.scrollY > 500);
  };
  const fab = document.getElementById('fabCta');
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

  /* ---------- cursor glow (desktop only) ---------- */
  const glow = document.getElementById('cursorGlow');
  const isTouch = matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll('.stat__num');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
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
  counters.forEach(c => counterIo.observe(c));

  /* ---------- hero typewriter ---------- */
  const words = ['منتج رقمي.', 'نظام SaaS.', 'تطبيق متكامل.', 'منصّة قابلة للنمو.'];
  const twEl = document.getElementById('typewriter');
  let wi = 0, ci = 0, deleting = false;

  const tick = () => {
    const word = words[wi];
    if (!deleting) {
      ci++;
      twEl.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      ci--;
      twEl.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 75);
  };
  tick();

  /* ---------- smooth anchor scroll offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
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

    submitLabel.textContent = 'جارٍ الإرسال...';
    setTimeout(() => {
      const subject = encodeURIComponent('طلب مشروع من ' + name);
      const body = encodeURIComponent(
        `الاسم: ${name}\nالهاتف: ${form.phone.value}\nالبريد: ${form.email.value}\n\nتفاصيل المشروع:\n${message}`
      );
      window.location.href = `mailto:info@codeysaa.com?subject=${subject}&body=${body}`;
      submitLabel.textContent = 'إرسال الطلب';
      note.textContent = 'سيُفتح تطبيق البريد لديك لإتمام الإرسال.';
      form.reset();
    }, 500);
  });
})();
