/**
 * main.js — Europa Jor Automotive Service
 * Funcionalidad compartida en todas las páginas secundarias
 * ─────────────────────────────────────────────────────────────────────────
 * NOTA: El Booking Calendar (calendario de citas) está integrado
 * directamente en index.html para mayor autonomía.
 * Este archivo cubre el resto de páginas: menú móvil, scroll reveal,
 * lazy loading, header scroll y smooth scroll con offset.
 *
 * Sin dependencias externas. Compatible: Chrome 80+, Firefox 75+,
 * Safari 14+, Edge 80+
 */

(function () {
  'use strict';

  /* ── Menú móvil ─────────────────────────────────────── */
  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var nav    = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function openMenu()  { nav.classList.add('open');    toggle.setAttribute('aria-expanded','true');  document.body.style.overflow = 'hidden'; }
    function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); document.body.style.overflow = ''; }

    toggle.addEventListener('click', function () {
      nav.classList.contains('open') ? closeMenu() : openMenu();
    });
    nav.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  /* ── Header sombra al scroll ─────────────────────────── */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    if ('IntersectionObserver' in window) {
      var s = document.createElement('div');
      s.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:1px;pointer-events:none;visibility:hidden;';
      document.body.prepend(s);
      new IntersectionObserver(function (entries) {
        header.classList.toggle('scrolled', !entries[0].isIntersecting);
      }).observe(s);
    } else {
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 10);
      }, { passive: true });
    }
  }

  /* ── Scroll reveal ───────────────────────────────────── */
  function initScrollReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── Active nav por sección ──────────────────────────── */
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var links    = document.querySelectorAll('.main-nav a[href^="#"]');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) {
            l.removeAttribute('aria-current');
            if (l.getAttribute('href') === '#' + entry.target.id) l.setAttribute('aria-current','page');
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ── Lazy load de imágenes (fallback data-src) ───────── */
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return;
    if (!('IntersectionObserver' in window)) return;
    var imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.removeAttribute('data-src');
          io.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(function (img) { io.observe(img); });
  }

  /* ── Smooth scroll con offset de header ─────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var header = document.querySelector('.site-header');
        var offset = header ? header.offsetHeight + 16 : 96;
        var top    = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();
    initActiveNav();
    initLazyImages();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
