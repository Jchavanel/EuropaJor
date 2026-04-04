# Informe de cambios y auditoría SEO — Europa Jor

## Cambio aplicado

### `vehiculos.html`
Se ha eliminado la barra de filtros basada en selectores desplegables (`marca`, `combustible`, `precio`, `estado`) en la página pública de vehículos.

Se mantiene:
- búsqueda por texto libre (`marca`, `modelo`, `versión`)
- contador de vehículos visibles
- ordenación actual del catálogo
- integración existente con Firebase/localStorage

También se ha ajustado:
- el texto del estado vacío del catálogo
- el enlace de footer que apuntaba a `vehiculos.html?f=disponible`
- el copy principal SEO de la cabecera de vehículos

## Configuración que no se ha tocado

No se ha modificado:
- configuración de Firebase
- `netlify.toml`
- funciones de Netlify
- variables de entorno

## Errores detectados en el proyecto

### 1) Páginas públicas secundarias con estructura provisional
Estas páginas siguen siendo plantillas mínimas con contenido genérico:
- `servicios.html`
- `sobre-nosotros.html`
- `equipo.html`
- `contacto.html`
- `blog.html`
- `faq.html`
- `cita-previa.html`
- legales en `/legal/`

Problemas:
- títulos SEO genéricos
- sin meta description
- sin canonical
- contenido muy escaso o provisional

Impacto:
- debilitan la calidad SEO global del dominio
- pueden indexarse como thin content

### 2) CSS roto en varias páginas
Varias páginas cargan `assets/css/styles.css`, pero ese archivo no existe.

Afectadas:
- `servicios.html`
- `sobre-nosotros.html`
- `equipo.html`
- `contacto.html`
- `blog.html`
- `faq.html`
- `cita-previa.html`
- páginas legales

Impacto:
- páginas sin estilos o con maquetación rota
- mala experiencia de usuario
- empeora señales de calidad

### 3) Rutas incorrectas en páginas legales
Las páginas dentro de `/legal/` enlazan como si estuvieran en raíz.

Ejemplos:
- `href="index.html"` debería ser `../index.html`
- `src="assets/js/main.js"` debería ser `../assets/js/main.js`

Impacto:
- navegación rota
- JS/CSS no cargan correctamente en legales

### 4) Inconsistencia de dominio en SEO técnico
En el proyecto aparecen varias versiones de dominio:
- `https://incredible-cannoli-e74a77.netlify.app/`
- `https://europajor.es/`
- `https://tallereuropa.es/`

Impacto:
- señales SEO fragmentadas
- canonical/schema/sitemap no alineados
- riesgo de indexación inconsistente

### 5) `robots.txt` mejorable
Actualmente bloquea `/assets/`.

Impacto:
- puede dificultar renderizado y evaluación correcta de recursos
- especialmente mala práctica si dentro de `/assets/` hay CSS, JS o imágenes clave

### 6) `sitemap.xml` incompleto
No incluye todas las URLs relevantes del proyecto, por ejemplo `vehiculos.html`.

Impacto:
- peor descubrimiento de URLs
- menor coherencia de indexación

## Diagnóstico SEO local y regional

### Fortaleza actual
La home principal ya trabaja bastante bien estas entidades:
- taller mecánico multimarca
- Vecindario
- Gran Canaria
- Santa Lucía de Tirajana
- sur de Gran Canaria

También incluye:
- dirección física
- teléfono
- horarios
- mapa
- datos estructurados de negocio local

### Bloqueadores SEO reales
Para posicionar como:
- taller de vehículos en Vecindario
- taller de vehículos multimarca en Gran Canaria
- taller mecánico multimarca en Vecindario

los frenos actuales son:

1. dominio/canonical/schema inconsistentes
2. páginas secundarias pobres o provisionales
3. sitemap incompleto
4. robots mejorable
5. ausencia de páginas de servicio bien desarrolladas

## Recomendaciones prioritarias

### Prioridad alta
1. Unificar un único dominio canónico en todo el proyecto
2. Corregir `robots.txt` para no bloquear recursos importantes
3. Añadir `vehiculos.html` y páginas clave al `sitemap.xml`
4. Reparar rutas y CSS rotos
5. Poner `noindex` a páginas provisionales o completarlas

### Prioridad media
1. Crear páginas reales para:
   - taller mecánico en Vecindario
   - taller multimarca en Vecindario
   - diagnosis electrónica en Vecindario
   - cambio de aceite y filtros en Vecindario
   - frenos y suspensión en Gran Canaria sur
2. Añadir meta titles y descriptions únicas por página
3. Reforzar testimonios reales y datos de confianza

### Prioridad comercial/local
1. Optimizar Google Business Profile
2. Conseguir reseñas con términos naturales como:
   - taller en Vecindario
   - taller multimarca
   - mecánico de confianza en Gran Canaria
3. Mantener NAP idéntico en web, directorios y ficha de negocio

## Siguiente corrección recomendada
El siguiente paso con más retorno sería:
- corregir SEO técnico base (`canonical`, `robots`, `sitemap`, dominios)
- arreglar las páginas públicas provisionales o marcarlas como `noindex`

