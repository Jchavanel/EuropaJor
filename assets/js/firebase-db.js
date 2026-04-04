/**
 * firebase-db.js — Europa Jor Automotive Service
 * ─────────────────────────────────────────────────────────────────────────
 * Capa de abstracción de base de datos.
 * Usa Firebase Realtime Database si está configurado en config.js.
 * Si no hay config o falla la red, cae automáticamente a localStorage.
 *
 * API pública (todas las funciones son async):
 *   EJDb.loadAll()               → { '2026-03-15': { '08:00': {...} } }
 *   EJDb.save(date, slot, data)  → true | false
 *   EJDb.remove(date, slot)      → true | false
 *   EJDb.isReady()               → boolean (Firebase conectado)
 *
 * Compatibilidad: cualquier browser moderno con fetch() y Promise.
 * ─────────────────────────────────────────────────────────────────────────
 */
(function (global) {
  'use strict';

  var LOCAL_KEY = 'europajor_bookings_v1';

  // ── Configuración (inyectada desde config.js) ────────────────────────
  var cfg = (global.EJConfig && global.EJConfig.firebase) || null;
  var FB_URL = cfg ? cfg.databaseURL.replace(/\/$/, '') : null;
  var FB_SECRET = cfg ? (cfg.databaseSecret || '') : '';  // opcional: reglas públicas de lectura/escritura

  // ── Helper: construir URL de Firebase REST ──────────────────────────
  function fbUrl(path) {
    var url = FB_URL + path + '.json';
    if (FB_SECRET) url += '?auth=' + FB_SECRET;
    return url;
  }

  // ── localStorage fallback ────────────────────────────────────────────
  var ls = {
    loadAll: function () {
      try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); }
      catch (e) { return {}; }
    },
    save: function (date, slot, data) {
      var db = ls.loadAll();
      if (!db[date]) db[date] = {};
      db[date][slot] = data;
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(db)); return true; }
      catch (e) { return false; }
    },
    remove: function (date, slot) {
      var db = ls.loadAll();
      if (!db[date] || !db[date][slot]) return false;
      delete db[date][slot];
      if (!Object.keys(db[date]).length) delete db[date];
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(db)); return true; }
      catch (e) { return false; }
    }
  };

  // ── Firebase REST ─────────────────────────────────────────────────────
  var fb = {
    loadAll: async function () {
      try {
        var res = await fetch(fbUrl('/bookings'), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = await res.json();
        return data || {};
      } catch (e) {
        console.warn('[EJDb] Firebase loadAll falló, usando localStorage:', e.message);
        return ls.loadAll();
      }
    },
    save: async function (date, slot, data) {
      try {
        var res = await fetch(fbUrl('/bookings/' + date + '/' + slot), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        ls.save(date, slot, data); // mirror local como caché
        return true;
      } catch (e) {
        console.warn('[EJDb] Firebase save falló:', e.message);
        return ls.save(date, slot, data);
      }
    },
    remove: async function (date, slot) {
      try {
        var res = await fetch(fbUrl('/bookings/' + date + '/' + slot), {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        ls.remove(date, slot); // mirror local
        return true;
      } catch (e) {
        console.warn('[EJDb] Firebase remove falló:', e.message);
        return ls.remove(date, slot);
      }
    }
  };

  // ── API pública ──────────────────────────────────────────────────────
  global.EJDb = {
    isFirebase: !!FB_URL,
    isReady: function () { return !!FB_URL; },

    loadAll: async function () {
      if (FB_URL) return fb.loadAll();
      return Promise.resolve(ls.loadAll());
    },
    save: async function (date, slot, data) {
      if (FB_URL) return fb.save(date, slot, data);
      return Promise.resolve(ls.save(date, slot, data));
    },
    remove: async function (date, slot) {
      if (FB_URL) return fb.remove(date, slot);
      return Promise.resolve(ls.remove(date, slot));
    }
  };

})(window);

/* ─────────────────────────────────────────────────────────────────────────
   EJPush — Notificaciones Web Push (VAPID + Netlify Function)
   Versión corregida: usa el protocolo Web Push estándar.
   La API FCM Legacy (fcm.googleapis.com/fcm/send) fue dada de baja en jun-2024.
   Las llamadas push NUNCA se hacen desde el navegador (CORS bloqueado).
   Arquitectura: navegador → /api/send-push (Netlify Function) → Web Push → móvil
   ───────────────────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  var cfg    = (global.EJConfig && global.EJConfig.firebase) || {};
  var FB_URL = cfg.databaseURL ? cfg.databaseURL.replace(/\/$/, '') : null;

  /* Convierte base64url a Uint8Array (requerido por PushManager.subscribe) */
  function urlBase64ToUint8Array(b64) {
    var pad = '='.repeat((4 - b64.length % 4) % 4);
    var raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, function (c) { return c.charCodeAt(0); });
  }

  /* Clave segura para indexar la suscripción en Firebase */
  function subKey(sub) {
    var ep = sub.endpoint || '';
    return btoa(ep).replace(/[^a-zA-Z0-9]/g, '').slice(-60);
  }

  global.EJPush = {

    /* ── Suscribirse a notificaciones push ──────────────────────────────
       Llamar desde admin.html cuando el usuario pulsa "Activar ahora".
       Devuelve la suscripción si tiene éxito, null si falla o se deniega. */
    subscribe: async function () {
      var vapidKey = cfg.vapidPublicKey || '';
      var isDemo   = !vapidKey || vapidKey === '';

      /* MODO DEMO (localhost / sin vapidKey) — notificación nativa directa */
      if (isDemo) {
        if (!('Notification' in window)) return null;
        var perm = await Notification.requestPermission();
        return perm === 'granted' ? { demo: true } : null;
      }

      /* MODO PRODUCCIÓN — Web Push real */
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[EJPush] Push API no disponible en este navegador');
        return null;
      }

      try {
        var perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          console.warn('[EJPush] Permiso denegado');
          return null;
        }

        var reg = await navigator.serviceWorker.ready;
        var sub = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        /* Guardar la suscripción en Firebase para que index.html la use */
        if (FB_URL) {
          await fetch(FB_URL + '/admin_push_subs/' + subKey(sub) + '.json', {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              sub:       JSON.parse(JSON.stringify(sub)),  // serializar PushSubscription
              userAgent: navigator.userAgent.slice(0, 80),
              ts:        new Date().toISOString()
            })
          });
        }

        console.log('[EJPush] ✅ Suscripción activa:', sub.endpoint.slice(-30));
        return sub;

      } catch (err) {
        console.error('[EJPush] Error al suscribir:', err);
        return null;
      }
    },

    /* ── Enviar notificación push a todos los admins suscritos ──────────
       Llamar desde index.html justo después de guardar una reserva nueva.
       El envío real lo hace la Netlify Function /api/send-push (Node.js)
       porque los navegadores no pueden llamar a FCM directamente (CORS). */
    notifyAdmin: async function (booking) {
      var fecha = (booking.dateStr || '').split('-').reverse().join('/');
      var body  = (booking.nombre || 'Cliente') +
                  ' · ' + fecha +
                  ' a las ' + (booking.slot || '') + ' h';

      /* MODO DEMO: notificación nativa sin servidor */
      if (!FB_URL) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔧 Nueva cita — Europa Jor', {
            body:     body,
            icon:     '/assets/icons/icon-192.png',
            badge:    '/assets/icons/badge-96.png',
            tag:      'nueva-cita',
            renotify: true
          });
        }
        return;
      }

      /* MODO PRODUCCIÓN: leer suscripciones de Firebase → llamar Netlify Function */
      try {
        /* 1. Leer suscripciones guardadas */
        var res = await fetch(FB_URL + '/admin_push_subs.json', { cache: 'no-store' });
        if (!res.ok) return;
        var data = await res.json();
        if (!data) return;

        var subs = Object.values(data)
          .map(function (item) { return item.sub; })
          .filter(Boolean);

        if (!subs.length) {
          console.log('[EJPush] Sin suscriptores — nadie recibirá push');
          return;
        }

        /* 2. Llamar a la Netlify Function (servidor → Web Push → móvil) */
        var payload = {
          title:   '🔧 Nueva cita — Europa Jor',
          body:    body,
          dateStr: booking.dateStr || '',
          slot:    booking.slot    || '',
          nombre:  booking.nombre  || ''
        };

        var pushRes = await fetch('/api/send-push', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ subscriptions: subs, payload: payload })
        });

        if (pushRes.ok) {
          var result = await pushRes.json();
          console.log('[EJPush] Push enviada:', result);
        } else {
          var errText = await pushRes.text();
          console.warn('[EJPush] Error en /api/send-push:', pushRes.status, errText);
        }

      } catch (err) {
        console.warn('[EJPush] Error al notificar:', err.message);
      }
    },

    /* ── Cancelar suscripción (opcional, para "desactivar notifs") ──── */
    unsubscribe: async function () {
      if (!('serviceWorker' in navigator)) return;
      try {
        var reg = await navigator.serviceWorker.ready;
        var sub = await reg.pushManager.getSubscription();
        if (!sub) return;
        /* Borrar de Firebase */
        if (FB_URL) {
          await fetch(FB_URL + '/admin_push_subs/' + subKey(sub) + '.json', {
            method: 'DELETE'
          });
        }
        await sub.unsubscribe();
        console.log('[EJPush] Suscripción cancelada');
      } catch (err) {
        console.warn('[EJPush] Error al desuscribir:', err);
      }
    }
  };

})(window);
