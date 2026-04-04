# 📲 Guía PWA — Instalar panel de citas como app en Android
## Europa Jor Automotive Service

---

## ¿Qué es una PWA y por qué no necesitas el Play Store?

Una **PWA (Progressive Web App)** es una web que funciona como app nativa:
- Se instala desde Chrome en Android con un toque
- Aparece en el cajón de apps con su icono propio
- Funciona **sin abrir el navegador**
- Recibe **notificaciones push** cuando llega una cita nueva
- Funciona **sin conexión** (caché offline)
- **Sin cuota de desarrollador** ni proceso de revisión del Play Store

---

## PASO 1 — Configurar Firebase Cloud Messaging (FCM)

### 1.1 Obtener las claves necesarias
1. Ve a **https://console.firebase.google.com** → tu proyecto
2. Pulsa el engranaje ⚙️ → **"Configuración del proyecto"**
3. Pestaña **"Cloud Messaging"**

Necesitas dos valores:

**Server key (clave del servidor)**
→ En la sección "Cloud Messaging API (Legacy)" → copia la "Clave del servidor"
→ Si no aparece, pulsa los 3 puntos → "Manage API in Google Cloud Console" → habilitar

**VAPID Public Key (Web Push)**
→ En la sección "Configuración web" → "Certificados de Web Push"
→ Si no hay ninguno, pulsa **"Generate key pair"**
→ Copia la **clave pública** (la que empieza por B...)

### 1.2 Pegar las claves en config.js
Abre `assets/js/config.js` y rellena:

```js
firebase: {
  databaseURL:   'https://europa-jor-citas-default-rtdb.europe-west1.firebaseio.com',
  fcmServerKey:  'AAAA...tu-server-key',       // ← del paso 1.1
  vapidPublicKey: 'BEl62...tu-clave-publica',  // ← del paso 1.1
},
adminPin: 'TU_PIN_SECRETO',  // ← cámbialo!
```

### 1.3 Reglas Firebase para notificaciones
En Firebase → Realtime Database → Reglas, añadir el nodo `admin_push_subs`:

```json
{
  "rules": {
    "bookings": {
      ".read":  true,
      ".write": true
    },
    "admin_push_subs": {
      ".read":  true,
      ".write": true
    }
  }
}
```

---

## PASO 2 — Publicar en Netlify (con HTTPS obligatorio)

⚠️ **Las notificaciones push y el Service Worker solo funcionan con HTTPS.**
Netlify lo activa automáticamente — no hay que hacer nada extra.

Sigue el PASO 3 de `DEPLOY.md` (arrastrar carpeta a Netlify).

---

## PASO 3 — Instalar la app en el móvil del taller

### En Android (Chrome) — recomendado ✅
1. Abre Chrome en el móvil Android del taller
2. Navega a `https://tu-dominio.netlify.app/admin.html`
3. Introduce el PIN de acceso
4. Aparecerá automáticamente un **banner en la parte inferior**:
   *"Instalar como app — Accede más rápido y recibe notificaciones de nuevas citas"*
5. Pulsa **"Instalar"**
6. Chrome preguntará confirmación → **"Instalar"**
7. La app aparece en el cajón de apps con el icono naranja de Europa Jor ✅

**Si el banner no aparece automáticamente:**
- Menú de Chrome (3 puntos) → "Añadir a pantalla de inicio"

### En iPhone (Safari) — funcional pero sin push automático ⚠️
1. Abre Safari → navega a la URL del admin
2. Botón de compartir → **"Añadir a pantalla de inicio"**
3. La app se instala ✅
4. Las notificaciones push en iOS requieren iOS 16.4+ y el usuario debe haberla "instalado"

---

## PASO 4 — Activar notificaciones push

1. Abre la app instalada (no desde el navegador, desde el icono)
2. Entra con el PIN
3. Aparece una barra amarilla: **"Activa las notificaciones push..."**
4. Pulsa **"Activar ahora"**
5. El sistema mostrará el diálogo de permisos → **"Permitir"**
6. ✅ A partir de ahora, cada vez que un cliente reserve una cita recibirás:
   - Una notificación en el móvil aunque la app esté cerrada
   - Sonido y vibración
   - Al pulsar la notificación → abre el panel directamente en la cita nueva

---

## 🔔 Cómo funcionan las notificaciones

```
Cliente reserva cita en la web
         ↓
index.html guarda en Firebase
         ↓
index.html llama a EJPush.notifyAdmin()
         ↓
FCM entrega la push al móvil del taller
         ↓
Service Worker (sw.js) la recibe aunque la app esté cerrada
         ↓
🔔 Notificación: "🔧 Nueva cita — Juan García · 15/03 a las 10:00 h"
         ↓
Taller pulsa la notificación → abre el panel en admin.html
```

---

## 🛠️ Solución de problemas

### "No aparece el botón de instalar"
→ Chrome solo lo muestra si: estás en HTTPS, no está ya instalada, y la visita es reciente
→ Alternativa manual: menú Chrome → "Añadir a pantalla de inicio"

### "Las notificaciones no llegan cuando la app está cerrada"
→ Verifica que las claves FCM en `config.js` son correctas
→ Asegúrate de que el permiso de notificaciones está concedido en Android:
   Ajustes → Apps → Chrome (o la PWA) → Notificaciones → Activar

### "La app no funciona sin conexión"
→ Cierra y vuelve a abrir para que el Service Worker se instale
→ La primera vez siempre necesita conexión para cachear los archivos

### "Quiero instalar la app en varios móviles del taller"
→ Repite el proceso en cada móvil → cada uno tendrá su suscripción push independiente
→ Todos recibirán la notificación cuando llegue una cita nueva

---

## 📊 Compatibilidad

| Plataforma | Instalación | Push notifications | Offline |
|---|---|---|---|
| Android Chrome 80+ | ✅ Automática | ✅ | ✅ |
| Android Firefox | ✅ | ✅ | ✅ |
| iPhone Safari 16.4+ | ✅ Manual | ✅ (iOS 16.4+) | ✅ |
| iPhone Safari < 16.4 | ✅ Manual | ❌ | ✅ |
| PC Chrome/Edge | ✅ | ✅ | ✅ |

---

*Europa Jor Automotive Service — Vecindario, Gran Canaria*
