/**
 * config.js — Europa Jor Automotive Service
 * ─────────────────────────────────────────────────────────────────────────
 * MODO DEMO LOCAL
 * Las reservas se guardan en localStorage del navegador.
 * Para activar Firebase en producción: ver DEPLOY.md
 * ─────────────────────────────────────────────────────────────────────────
 */
window.EJConfig = {

  firebase: {
    // Vacío = modo demo local (localStorage)
    // Para producción: pegar la URL de Firebase Realtime Database
    databaseURL: 'https://europa-jor-citas-default-rtdb.europe-west1.firebasedatabase.app/',
    fcmServerKey:   '',
    vapidPublicKey: 'BPdjxfYIiGV9Xwbq40x-fxDYPDT1hHSc379Iyr3Utlkw2TxdbtjOU0EsMIHbWe0LrvB3mQm5Ycm3jFYSO4xGm40',
  },

  taller: {
    nombre:    'Europa Jor Automotive Service',
    telefono:  '+34638317126',
    whatsapp:  '34638317126',
    direccion: 'Calle La Centrífuga 62, Vecindario, Gran Canaria',
  },

  // PIN del panel de administración (demo: 1234)
  adminPin: '1234',

};
