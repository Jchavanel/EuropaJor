/**
 * sw.js — Service Worker
 * Europa Jor Automotive Service — Panel de citas PWA
 * ─────────────────────────────────────────────────────────────────────────
 * Funciones:
 *  1. Cache offline: admin.html funciona sin conexión
 *  2. Push notifications: recibe alertas de nuevas citas
 *  3. Background sync: refresca datos al recuperar conexión
 * ─────────────────────────────────────────────────────────────────────────
 */

'use strict';

var CACHE_NAME = 'europajor-admin-v1';
var OFFLINE_URLS = [
  '/admin.html',
  '/assets/js/config.js',
  '/assets/js/firebase-db.js',
  '/assets/js/main.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/badge-96.png',
  '/manifest.json'
];

// ── INSTALL: pre-cachear recursos esenciales ──────────────────────────
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(OFFLINE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: limpiar caches antiguas ────────────────────────────────
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ── FETCH: estrategia Network-first, caché como fallback ─────────────
self.addEventListener('fetch', function (event) {
  // Solo manejar GET y URLs del mismo origen
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      // Si la respuesta es válida, actualizar la caché
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function () {
      // Sin red → servir desde caché
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        // Fallback: admin.html para rutas desconocidas
        if (url.pathname.includes('.html')) {
          return caches.match('/admin.html');
        }
      });
    })
  );
});

// ── PUSH: recibir notificaciones push ────────────────────────────────
self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '📅 Nueva cita', body: event.data ? event.data.text() : 'Revisa el panel' };
  }

  var title   = data.title   || '🔧 Europa Jor — Nueva cita';
  var options = {
    body:    data.body    || 'Tienes una nueva reserva en el panel',
    icon:    '/assets/icons/icon-192.png',
    badge:   '/assets/icons/badge-96.png',
    tag:     data.tag     || 'nueva-cita',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url:      data.url  || '/admin.html',
      dateStr:  data.dateStr  || '',
      slot:     data.slot     || '',
      nombre:   data.nombre   || ''
    },
    actions: [
      { action: 'open',    title: '📋 Ver cita'    },
      { action: 'dismiss', title: '✕ Descartar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── NOTIFICATIONCLICK: abrir el panel al pulsar la notificación ──────
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  var targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/admin.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clients) {
        // Si el panel ya está abierto, enfocarlo
        for (var i = 0; i < clients.length; i++) {
          var c = clients[i];
          if (c.url.includes('admin.html') && 'focus' in c) {
            return c.focus();
          }
        }
        // Si no está abierto, abrirlo
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── MESSAGE: recibir mensajes de la página para enviar notif local ───
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    var d = event.data.payload || {};
    self.registration.showNotification(
      d.title || '🔧 Nueva cita recibida',
      {
        body:    d.body    || '',
        icon:    '/assets/icons/icon-192.png',
        badge:   '/assets/icons/badge-96.png',
        tag:     'nueva-cita',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: '/admin.html' }
      }
    );
  }
});
