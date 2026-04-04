# Europa Jor Automotive Service — Web corporativa
**Taller mecánico multimarca · Calle La Centrífuga 62, Vecindario, Gran Canaria**
📞 638 317 126 · https://wa.me/34638317126

---

## 📁 Estructura del proyecto

```
europa-jor/
│
├── index.html                    ← HOME completa (autónoma, todo en un archivo)
├── servicios.html                ← Página de servicios
├── sobre-nosotros.html           ← Historia y valores
├── equipo.html                   ← Equipo humano
├── cita-previa.html              ← Página de cita (versión extendida)
├── contacto.html                 ← Mapa + datos de contacto
├── faq.html                      ← Preguntas frecuentes
├── blog.html                     ← Blog / noticias
├── sitemap.xml                   ← Sitemap SEO ✅
├── robots.txt                    ← Directrices crawlers ✅
│
├── legal/
│   ├── aviso-legal.html
│   ├── privacidad.html
│   ├── cookies.html
│   └── accesibilidad.html
│
└── assets/
    ├── css/
    │   ├── tokens.css            ← Variables de diseño (colores, tipografía)
    │   ├── base.css              ← Reset + componentes reutilizables
    │   └── layout.css            ← Header, footer, nav, WhatsApp flotante
    │
    ├── js/
    │   └── main.js               ← JS compartido para páginas secundarias
    │                               (menú móvil, scroll reveal, lazy load…)
    │                               El calendario de citas está en index.html
    │
    ├── fonts/
    │   └── README-fonts.txt      ← Instrucciones para autoalojar fuentes
    │
    ├── brand/
    │   ├── logo/
    │   │   ├── logo-europa-jor.png   ← LOGO OFICIAL (PNG con fondo negro)
    │   │   └── logo-te.svg           ← Logo vectorial alternativo editable
    │   └── favicon/
    │       └── favicon.svg           ← Favicon SVG base
    │
    ├── img/
    │   ├── hero/          ← Foto principal del taller (1200×700 px)
    │   ├── taller/        ← Fotos interior/exterior (800×600 px)
    │   ├── equipo/        ← Fotos del equipo (400×500 px)
    │   ├── servicios/     ← Una foto por servicio (600×400 px)
    │   ├── blog/          ← Imágenes destacadas artículos (800×450 px)
    │   └── og/            ← Imagen Open Graph para redes (1200×630 px)
    │
    └── icons/             ← SVG icons custom si se necesitan
```

---

## ✅ Funcionalidades implementadas

### HOME (index.html) — archivo autónomo
- **SEO local completo**: Schema.org AutoRepair+LocalBusiness, meta geo, OpenGraph
- **Calendario de citas interactivo** con franjas cada 2h:
  - L-V: 8:00 · 10:00 · 12:00 · 14:00 · 16:00 · 18:00
  - Sábado: 8:00 · 10:00 · 12:00
  - Domingo: cerrado
  - Reservas guardadas en localStorage (ver nota más abajo)
  - Flujo 4 pasos: día → franja → datos → confirmación WhatsApp
- **Horario actualizado**: Lun–Vie 8:00–19:00 · Sáb 9:00–13:00
- **Logo Europa Jor** integrado con mix-blend-mode (fondo transparente en header)
- **WhatsApp flotante** con mensaje pre-rellenado y animación de entrada
- **Scroll reveal** con IntersectionObserver + fallback
- **Menú móvil** accesible (Escape, aria-expanded, bloqueo de scroll)
- **Responsive** Mobile-first: 1200px → 1024px → 768px → 480px

---

## 🖼️ Imágenes pendientes de añadir

### Alta prioridad (impactan SEO y conversión directamente)
| Imagen | Carpeta | Tamaño | Formato |
|--------|---------|--------|---------|
| Foto exterior/interior taller | `assets/img/hero/` | 1200×700 px | JPG + WebP |
| OG image para redes | `assets/img/og/` | 1200×630 px | JPG |
| Interior del taller | `assets/img/taller/` | 800×600 px | JPG + WebP |

### Cómo referenciarlas en el HTML
```html
<!-- Hero con soporte WebP -->
<picture>
  <source srcset="assets/img/hero/hero-taller.webp" type="image/webp">
  <img src="assets/img/hero/hero-taller.jpg"
       alt="Interior de Europa Jor Automotive Service en Vecindario"
       width="1200" height="700" loading="lazy" decoding="async">
</picture>
```

---

## 📅 Calendario de citas — Nota técnica

### Estado actual (demo local)
Las reservas se guardan en `localStorage` del navegador con la clave
`europajor_bookings_v1`. Esto funciona perfectamente en **un solo
dispositivo** (p.ej. el ordenador del taller para gestión interna).

### Para reservas compartidas en tiempo real (producción)
Sustituir en index.html las funciones `loadBookings()` y `saveBookings()`
por llamadas a uno de estos servicios:

**Opción A — Firebase (recomendada, gratis)**
```js
// Reemplazar loadBookings() por:
async function loadBookings() {
  const res = await fetch('https://tu-proyecto.firebaseio.com/bookings.json');
  return await res.json() || {};
}
// Reemplazar saveBooking() por:
async function saveBooking(dateStr, slot, data) {
  await fetch(`https://tu-proyecto.firebaseio.com/bookings/${dateStr}/${slot}.json`,
    { method: 'PUT', body: JSON.stringify(data) });
}
```

**Opción B — Supabase**
Crear tabla `bookings (date TEXT, slot TEXT, nombre TEXT, telefono TEXT, ...)`
y usar el cliente JS de Supabase.

**Opción C — Formspree + Google Sheets** (sin bloqueo de slots)
Conectar el formulario a Formspree y recibir las citas por email/sheet.

---

## 🔍 Checklist SEO — Antes de publicar

- [ ] Subir al dominio (recomendado: `europajor.es`)
- [ ] Actualizar URLs en `sitemap.xml` al dominio real
- [ ] Actualizar `<link rel="canonical">` en cada página
- [ ] Añadir foto OG real (1200×630) y actualizar `og:image` en `<head>`
- [ ] Verificar en **Google Search Console**
- [ ] Crear/actualizar **Google Business Profile** con misma dirección y horario
- [ ] Configurar **Google Analytics 4** (añadir snippet antes de `</head>`)
- [ ] Sustituir testimonios de muestra por reseñas reales de Google
- [ ] Añadir mínimo 5 fotos reales del taller

---

## 🔧 Configuración rápida del formulario de cita

El formulario redirige a WhatsApp con los datos pre-escritos.
Para conectar a email sin backend usar **Formspree**:

1. Crear cuenta en https://formspree.io
2. Cambiar en el HTML: `<form action="https://formspree.io/f/TU_ID" method="POST">`
3. Añadir `<input type="hidden" name="_subject" value="Nueva cita Europa Jor">`

---

## ⚙️ Stack técnico

| Capa | Tecnología |
|------|-----------|
| HTML | HTML5 semántico con ARIA roles |
| CSS | CSS3 puro, variables nativas, sin frameworks |
| JS | Vanilla ES6, sin dependencias, sin bundler |
| Fuentes | Google Fonts (Barlow Condensed + Nunito Sans) |
| SEO | Schema.org JSON-LD (AutoRepair + LocalBusiness) |
| Compatibilidad | Chrome 80+, Firefox 75+, Safari 14+, Edge 80+ |
