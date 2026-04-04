/**
 * netlify/functions/send-push.js
 * ─────────────────────────────────────────────────────────────────────────
 * Netlify Function serverless — envía notificaciones Web Push a los admins.
 * Se ejecuta en el servidor de Netlify (Node.js), nunca en el navegador.
 *
 * Llamada desde: firebase-db.js → EJPush.notifyAdmin()
 * Librería: web-push (npm) — implementa el protocolo Web Push + VAPID oficial
 * ─────────────────────────────────────────────────────────────────────────
 */

const webpush = require('web-push');

exports.handler = async function (event) {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // CORS — permitir llamadas desde el propio dominio
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const { subscriptions, payload } = body;

    if (!subscriptions || !subscriptions.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: 0, reason: 'No subscriptions' }) };
    }

    // Claves VAPID — inyectadas como variables de entorno en Netlify
    // (nunca hardcodeadas aquí para que no queden expuestas en el repositorio)
    const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
    const VAPID_EMAIL   = process.env.VAPID_EMAIL || 'mailto:admin@europajor.es';

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      console.error('[send-push] Variables de entorno VAPID no configuradas');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'VAPID keys not configured in Netlify environment variables' }),
      };
    }

    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

    const notification = JSON.stringify({
      title:   payload.title   || '🔧 Nueva cita — Europa Jor',
      body:    payload.body    || 'Tienes una nueva reserva',
      icon:    '/assets/icons/icon-192.png',
      badge:   '/assets/icons/badge-96.png',
      tag:     'nueva-cita',
      renotify: true,
      data: {
        url:     '/admin.html',
        dateStr: payload.dateStr || '',
        slot:    payload.slot    || '',
        nombre:  payload.nombre  || '',
      },
    });

    let sent = 0, failed = 0;
    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(sub, notification)
          .then(() => { sent++; })
          .catch(err => {
            failed++;
            console.warn('[send-push] Fallo en sub:', err.statusCode, err.message);
            // Si la suscripción ha expirado (410 Gone) se puede eliminar de Firebase
          })
      )
    );

    console.log(`[send-push] Enviadas: ${sent}, Fallidas: ${failed}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sent, failed }),
    };

  } catch (err) {
    console.error('[send-push] Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
