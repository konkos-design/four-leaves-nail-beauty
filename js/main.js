(function () {
  'use strict';
  var root = document.documentElement;
  var unhide = function () { root.classList.remove('js-anim'); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* header + mobile bar */
  var hdr = $('#hdr'), mbar = $('#mbar'), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('is-solid', y > 30);
    var menuOpen = document.body.classList.contains('menu-open');
    hdr.classList.toggle('is-hidden', !menuOpen && y > 500 && y > lastY + 2);
    if (y < lastY - 2) hdr.classList.remove('is-hidden');
    if (mbar) mbar.classList.toggle('show', y > window.innerHeight * 0.6);
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* burger */
  var burger = $('#burger');
  if (burger) burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    hdr.classList.add('is-solid'); hdr.classList.remove('is-hidden');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.mnav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); document.body.style.overflow = ''; }); });

  /* reveal */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv').forEach(function (el, i) {
    if (!el.style.getPropertyValue('--dl')) {
      var sib = el.parentElement ? $$(':scope > .rv', el.parentElement).indexOf(el) : 0;
      if (sib > 0) el.style.setProperty('--dl', Math.min(sib, 5) * 0.08 + 's');
    }
    io.observe(el);
  });

  /* hero orb slideshow */
  var orb = $('.orb');
  if (orb) {
    var imgs = $$('img', orb), dots = $('.orb-dots'), cur = 0, timer;
    imgs.forEach(function (im, i) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Photo ' + (i + 1));
      if (i === 0) b.className = 'on';
      b.addEventListener('click', function () { show(i); restart(); });
      dots.appendChild(b);
    });
    var bs = $$('button', dots);
    function show(i) {
      imgs[cur].classList.remove('on'); bs[cur].classList.remove('on');
      cur = i; imgs[cur].classList.add('on'); bs[cur].classList.add('on');
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show((cur + 1) % imgs.length); }, 4200); }
    restart();
  }

  /* draggable strips (mouse drag; touch scrolls natively) */
  $$('[data-drag]').forEach(function (el) {
    var down = false, sx = 0, sl = 0, moved = 0, v = 0, lx = 0, raf;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = lx = e.clientX; sl = el.scrollLeft; v = 0; cancelAnimationFrame(raf);
      el.classList.add('drag'); el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      v = e.clientX - lx; lx = e.clientX;
      el.scrollLeft = sl - dx;
    });
    function up() {
      if (!down) return; down = false; el.classList.remove('drag');
      (function glide() { v *= 0.93; el.scrollLeft -= v; if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide); })();
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* clover hover link */
  var mainClv = $('.clv--main');
  $$('.leaf-txt[data-for]').forEach(function (t) {
    var lf = mainClv && mainClv.querySelector('.lf[data-leaf="' + t.dataset.for + '"] path');
    if (!lf) return;
    t.addEventListener('mouseenter', function () { lf.style.filter = 'brightness(1.18) saturate(1.2)'; });
    t.addEventListener('mouseleave', function () { lf.style.filter = ''; });
  });

  /* services tabs */
  var tabs = $$('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t); $('#' + x.getAttribute('aria-controls')).hidden = x !== t; });
    });
  });
  var hashMap = { '#manicure': 't-mani', '#extensions': 't-mani', '#designs': 't-art', '#pedicure': 't-pedi' };
  if (hashMap[location.hash]) { var ht = $('#' + hashMap[location.hash]); if (ht) ht.click(); }

  /* lightbox */
  var lb = $('#lb');
  if (lb) {
    var links = $$('#masonry a'), li = 0, lbImg = $('img', lb), cap = $('.lb__c', lb), lastFocus;
    function openLb(i) {
      li = (i + links.length) % links.length;
      lbImg.src = links[li].getAttribute('href');
      cap.textContent = (li + 1) + ' / ' + links.length;
    }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); lastFocus = a; openLb(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb__x', lb).focus(); }); });
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__p', lb).addEventListener('click', function () { openLb(li - 1); });
    $('.lb__n', lb).addEventListener('click', function () { openLb(li + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') openLb(li - 1); if (e.key === 'ArrowRight') openLb(li + 1);
    });
    var tsx = 0;
    lb.addEventListener('touchstart', function (e) { tsx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tsx; if (Math.abs(dx) > 50) openLb(li + (dx < 0 ? 1 : -1)); });
  }

  /* open / closed status (Halifax time) */
  var st = $('#status');
  if (st) {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Halifax', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ''; };
      var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      var mins = (+get('hour') % 24) * 60 + (+get('minute'));
      var openAt = (wd === 0 || wd === 6) ? 600 : 540, closeAt = 1080;
      var isOpen = mins >= openAt && mins < closeAt;
      st.classList.add(isOpen ? 'open' : 'closed');
      $('span', st).textContent = isOpen ? 'Open now, until 6 pm' : 'Closed now, opens at ' + (mins >= closeAt ? ((wd === 5 || wd === 6) ? '10 am' : '9 am') + ' tomorrow' : (openAt === 600 ? '10 am' : '9 am'));
      var tr = $('#hours tr[data-d="' + wd + '"]'); if (tr) tr.classList.add('today');
    } catch (e) { }
  }

  /* ---------- GSAP ---------- */
  if (!window.gsap || reduce) { unhide(); fallbackStamps(); return; }
  gsap.registerPlugin(ScrollTrigger);
  var wide = matchMedia('(min-width: 921px)').matches;
  (function () {

    /* hero intro (home) */
    if ($('.hero')) {
      gsap.set('.hero h1 .ln > span', { y: 0, yPercent: 125 });
      gsap.set('.hero__where,.hero__lead,.hero__cta,.hero__note', { opacity: 0, y: 18 });
      gsap.set('.orb-wrap', { clipPath: 'circle(0% at 50% 50%)' });
      unhide();
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.orb-wrap', { clipPath: 'circle(75% at 50% 50%)', duration: 1.5, ease: 'power4.inOut', clearProps: 'clipPath' }, 0)
        .to('.hero__where', { opacity: 1, y: 0, duration: .8 }, .15)
        .to('.hero h1 .ln > span', { yPercent: 0, duration: 1.1, stagger: .12 }, .25)
        .to('.hero__lead,.hero__cta,.hero__note', { opacity: 1, y: 0, duration: .9, stagger: .09 }, .7);
    }
    /* inner page hero */
    if ($('.phero')) {
      gsap.set('.phero h1 .ln > span', { y: 0, yPercent: 125 });
      gsap.set('.phero p,.phero .kick', { opacity: 0, y: 16 });
      gsap.set('.phero__clv .lf', { scale: 0, svgOrigin: '200 200' });
      unhide();
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.phero .kick', { opacity: 1, y: 0, duration: .7 }, .05)
        .to('.phero h1 .ln > span', { yPercent: 0, duration: 1.05, stagger: .1 }, .15)
        .to('.phero p', { opacity: 1, y: 0, duration: .8 }, .55)
        .to('.phero__clv .lf', { scale: 1, duration: .9, stagger: .12, ease: 'back.out(1.6)' }, .3);
      gsap.to('.phero__clv', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    unhide();

    /* main clover: leaves grow one by one, then slow turn while scrolling */
    if (mainClv) {
      gsap.set('.clv--main .lf', { scale: 0, svgOrigin: '200 200' });
      gsap.set('.clv--main .stem', { strokeDasharray: 200, strokeDashoffset: 200 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: '.clover', start: 'top 70%' } });
      tl.to('.clv--main .stem', { strokeDashoffset: 0, duration: .8, ease: 'power2.out' })
        .to('.clv--main .lf', { scale: 1, duration: .9, stagger: .16, ease: 'back.out(1.7)' }, .15);
      gsap.fromTo('.clv--main', { rotate: -14 }, { rotate: 14, ease: 'none', scrollTrigger: { trigger: '.clover', start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    /* loyalty stamps */
    var stamps = $$('#card .stamp:not(.stamp--free)');
    if (stamps.length) {
      ScrollTrigger.create({ trigger: '#card', start: 'top 72%', once: true, onEnter: function () {
        stamps.forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, 160 * i); });
        gsap.fromTo('.stamp--free', { scale: .6 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.45)', delay: 160 * stamps.length / 1000 });
      } });
    }

  })();
  /* desktop-only scroll effects (safe to revert on resize) */
  gsap.matchMedia().add('(min-width: 921px)', function () {
    if ($('.orb')) gsap.to('.orb', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if ($('#card')) gsap.fromTo('#card', { rotate: -6 }, { rotate: -1.5, ease: 'none', scrollTrigger: { trigger: '#loyalty', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('.photo img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -4, scale: 1.08 }, { yPercent: 4, scale: 1.08, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  setTimeout(unhide, 3000);

  function fallbackStamps() { $$('#card .stamp').forEach(function (s) { s.classList.add('on'); }); }
})();
