/**
 * generar-vapid.js — Genera las claves VAPID para Web Push
 * ─────────────────────────────────────────────────────────────────────────
 * Ejecutar UNA SOLA VEZ con Node.js (no necesita instalar nada):
 *
 *   node generar-vapid.js
 *
 * Guarda el resultado. Si las cambias en el futuro, todos los suscriptores
 * pierden las notificaciones y deben volver a activarlas desde el panel.
 * ─────────────────────────────────────────────────────────────────────────
 */
const crypto = require('crypto');

function generateVAPIDKeys() {
  const kp = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding:  { type: 'spki',  format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }
  });
  const privObj = crypto.createPrivateKey({ key: kp.privateKey, format: 'der', type: 'pkcs8' });
  const pubObj  = crypto.createPublicKey(privObj);
  const privJwk = privObj.export({ format: 'jwk' });
  const pubJwk  = pubObj.export({ format: 'jwk' });
  const x = Buffer.from(pubJwk.x, 'base64');
  const y = Buffer.from(pubJwk.y, 'base64');
  const d = Buffer.from(privJwk.d, 'base64');
  const pub = Buffer.concat([Buffer.from([0x04]), x, y]);
  const b64 = b => b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return { publicKey: b64(pub), privateKey: b64(d) };
}

const keys = generateVAPIDKeys();

const line = '═'.repeat(58);
console.log('\n' + line);
console.log('  CLAVES VAPID — Europa Jor Automotive Service');
console.log(line + '\n');
console.log('VAPID_PUBLIC_KEY  (pegar en config.js):');
console.log('  ' + keys.publicKey);
console.log('\nVAPID_PRIVATE_KEY (solo en Netlify — nunca públicamente):');
console.log('  ' + keys.privateKey);
console.log('\n' + line);
console.log('\nPASO A — Editar assets/js/config.js:');
console.log('  vapidPublicKey: \'' + keys.publicKey + '\',\n');
console.log('PASO B — En Netlify: Site settings → Environment variables:');
console.log('  VAPID_PUBLIC_KEY  = ' + keys.publicKey);
console.log('  VAPID_PRIVATE_KEY = ' + keys.privateKey);
console.log('  VAPID_EMAIL       = mailto:admin@europajor.es\n');
console.log('PASO C — Redeploy en Netlify (para que cargue las variables).\n');
console.log('⚠️  No subas VAPID_PRIVATE_KEY a GitHub ni la compartas.');
console.log(line + '\n');
