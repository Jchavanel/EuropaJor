# 🚀 Guía de despliegue — Europa Jor Automotive Service
## Netlify (hosting) + Firebase (base de datos de citas)
**Tiempo estimado: 20–30 minutos. Sin conocimientos técnicos previos.**

---

## ¿Por qué Netlify + Firebase?

| | Netlify | Firebase |
|---|---|---|
| **Para qué** | Alojar los archivos HTML/CSS/JS | Guardar las reservas de citas |
| **Coste** | **Gratis** (plan Starter) | **Gratis** (Spark plan, 1GB) |
| **HTTPS** | ✅ Automático | — |
| **Dominio** | Gratis (nombre.netlify.app) o propio | — |
| **CDN global** | ✅ | — |

---

## PASO 1 — Crear la base de datos en Firebase

### 1.1 Crear cuenta y proyecto
1. Ve a **https://console.firebase.google.com**
2. Inicia sesión con una cuenta de Google (crea una si no tienes)
3. Pulsa **"Crear un proyecto"**
4. Nombre: `europa-jor-citas` (o el que quieras)
5. Desactiva Google Analytics (no es necesario) → **Crear proyecto**

### 1.2 Crear la base de datos Realtime
1. En el menú izquierdo → **"Compilación"** → **"Realtime Database"**
2. Pulsa **"Crear base de datos"**
3. Ubicación: elige **"europe-west1 (Belgium)"** (la más cercana a Canarias)
4. En modo de seguridad: selecciona **"Modo de prueba"** → **Siguiente** → Listo

> ⚠️ El modo de prueba expira en 30 días. Antes de que expire, ve a la pestaña
> **"Reglas"** y copia estas reglas permanentes:
> ```json
> {
>   "rules": {
>     "bookings": {
>       ".read":  true,
>       ".write": true
>     }
>   }
> }
> ```
> Pulsa **"Publicar"**.

### 1.3 Copiar la URL de la base de datos
1. Verás una URL como:
   `https://europa-jor-citas-default-rtdb.europe-west1.firebaseio.com/`
2. **Cópiala** — la necesitarás en el siguiente paso

---

## PASO 2 — Configurar el proyecto

Abre el archivo **`assets/js/config.js`** con cualquier editor de texto
(Bloc de notas en Windows, TextEdit en Mac) y edita estas líneas:

```js
window.EJConfig = {
  firebase: {
    // Pega aquí la URL que copiaste:
    databaseURL: 'https://europa-jor-citas-default-rtdb.europe-west1.firebaseio.com',
  },
  taller: {
    nombre:   'Europa Jor Automotive Service',
    telefono: '+34638317126',
    whatsapp: '34638317126',
  },
  // ¡CAMBIA ESTO! PIN para acceder al panel de administración
  adminPin: 'TU_PIN_SECRETO',
};
```

**Guarda el archivo.**

---

## PASO 3 — Publicar en Netlify

### Opción A — Arrastrar y soltar (más fácil ✅)
1. Ve a **https://app.netlify.com**
2. Crea una cuenta gratuita (puedes usar tu cuenta de Google)
3. En el panel principal verás una zona:
   **"Drag and drop your site output folder here"**
4. Abre la carpeta `taller-europa` en tu ordenador
5. **Arrastra la carpeta completa** a esa zona de Netlify
6. ¡Listo! En 30 segundos tendrás una URL como `https://amazing-name-123456.netlify.app`

### Opción B — GitHub (para actualizaciones automáticas)
1. Crea cuenta en **https://github.com**
2. Crea un repositorio nuevo → sube la carpeta `taller-europa`
3. En Netlify: **"Add new site"** → **"Import an existing project"** → GitHub
4. Selecciona el repositorio → Deploy
5. Cada vez que actualices GitHub, Netlify se actualiza automáticamente

---

## PASO 4 — Conectar tu dominio propio (opcional)

Si tienes o quieres un dominio como `europajor.es`:

### Comprar dominio (si no tienes)
- **Nominalia**: https://www.nominalia.com (~10€/año)
- **Hostinger**: https://www.hostinger.es (~8€/año)

### Conectar el dominio a Netlify
1. En Netlify → tu sitio → **"Domain settings"**
2. **"Add custom domain"** → escribe `europajor.es`
3. Netlify te dará unos **registros DNS** (tipo A o CNAME)
4. Ve al panel de tu registrador de dominio → **Gestión DNS**
5. Añade los registros que te indica Netlify
6. Espera 5-30 minutos → el dominio quedará activo con HTTPS automático

---

## PASO 5 — Actualizar las URLs del proyecto

Una vez tengas la URL definitiva (netlify.app o dominio propio),
actualiza estos archivos:

### sitemap.xml
Reemplaza `https://europajor.es/` por tu URL real en todas las líneas.

### index.html — canonical y OG
Busca y actualiza:
```html
<link rel="canonical" href="https://europajor.es/">
<meta property="og:url" content="https://europajor.es/">
```

---

## PASO 6 — Proteger el panel de administración

El panel `admin.html` es accesible para cualquiera que conozca la URL.
Pasos recomendados para mayor seguridad:

1. **Cambiar el PIN**: ya lo hiciste en `config.js` (paso 2)
2. **Ocultar la URL**: no la publiques, solo el taller debe conocerla
3. **Netlify Password Protection** (opcional, plan Pro ~19$/mes):
   - Site settings → Access control → Password protection
4. **Para el futuro**: migrar el panel a Netlify Identity (gratis, auth de verdad)

---

## ✅ Checklist final antes de publicar

- [ ] `config.js` — URL de Firebase actualizada
- [ ] `config.js` — PIN de administrador cambiado
- [ ] `sitemap.xml` — URLs actualizadas al dominio real
- [ ] `index.html` — canonical y og:url actualizados
- [ ] Probar reserva completa desde móvil
- [ ] Probar cancelación con el enlace de WhatsApp
- [ ] Acceder a `admin.html` y verificar que aparecen las reservas
- [ ] Subir fotos reales del taller (ver `README.md` para tamaños)
- [ ] Crear Google Business Profile con la misma dirección y horario
- [ ] Verificar en Google Search Console

---

## 🔧 Solución de problemas frecuentes

### "Las reservas no se guardan / no aparecen en el calendario"
→ Verifica que la URL en `config.js` es exactamente la de Firebase (sin `/` al final)
→ Revisa las reglas de Firebase (pestaña "Reglas" en Realtime Database)
→ Abre las DevTools del navegador (F12) → pestaña Console → busca errores

### "La web no carga los archivos CSS/JS"
→ Asegúrate de haber subido la carpeta completa `taller-europa/` con todas las subcarpetas
→ Netlify necesita todos los archivos, incluidos `assets/js/config.js` y `assets/js/firebase-db.js`

### "El dominio no funciona después de configurar DNS"
→ Los cambios DNS pueden tardar hasta 24h (normalmente 15-30 minutos)
→ Prueba con https://dnschecker.org para ver si ya se ha propagado

### "El calendario del admin no muestra las citas del móvil"
→ Si acabas de activar Firebase, las citas anteriores guardadas en localStorage no migran automáticamente.
→ Las nuevas reservas ya se guardan en Firebase y son visibles en todos los dispositivos.

---

## 📱 Acceso desde móvil

- **Web pública**: simplemente abre la URL en cualquier navegador del móvil
- **Panel admin**: `https://tu-dominio.es/admin.html` — funciona en móvil
- **Añadir a pantalla de inicio** (recomendado para el taller):
  - Safari (iOS): compartir → "Añadir a pantalla de inicio"
  - Chrome (Android): menú → "Añadir a pantalla de inicio"

---

## 💰 Resumen de costes

| Servicio | Plan | Coste |
|----------|------|-------|
| Netlify Hosting | Starter | **0 €/mes** |
| Firebase Realtime DB | Spark | **0 €/mes** (hasta 1GB, ~500.000 reservas) |
| Dominio `.es` | — | ~8-10 €/año (opcional) |
| **TOTAL** | | **0 € / mes** |

---

*Guía generada para Europa Jor Automotive Service — Vecindario, Gran Canaria*

## Nodo Firebase — Vehículos
```json
{ "rules": { "vehiculos": { ".read": true, ".write": true } } }
```
