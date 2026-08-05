/**
 * api/send-push.js
 * Vercel Serverless Function — envía notificaciones Web Push a los admins.
 * Endpoint: POST /api/send-push
 */

const webpush = require('web-push');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { subscriptions, payload } = req.body || {};

    if (!subscriptions || !subscriptions.length)
      return res.status(200).json({ sent: 0, reason: 'No subscriptions' });

    const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
    const VAPID_EMAIL   = process.env.VAPID_EMAIL || 'mailto:admin@europajor.es';

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      console.error('[send-push] Variables VAPID no configuradas en Vercel');
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

    const notification = JSON.stringify({
      title:    payload.title   || '\u{1F527} Nueva cita \u2014 Europa Jor',
      body:     payload.body    || 'Tienes una nueva reserva',
      icon:     '/assets/icons/icon-192.png',
      badge:    '/assets/icons/badge-96.png',
      tag:      'nueva-cita',
      renotify: true,
      data: {
        url:     '/admin.html',
        dateStr: payload.dateStr || '',
        slot:    payload.slot    || '',
        nombre:  payload.nombre  || '',
      },
    });

    let sent = 0, failed = 0;
    await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(sub, notification)
          .then(() => { sent++; })
          .catch(err => { failed++; console.warn('[send-push] Sub fallida:', err.statusCode); })
      )
    );

    console.log(`[send-push] Enviadas: ${sent}, Fallidas: ${failed}`);
    return res.status(200).json({ sent, failed });

  } catch (err) {
    console.error('[send-push] Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
