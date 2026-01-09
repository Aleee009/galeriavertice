# Galería de Arte – Proyecto Web

Este proyecto es una aplicación frontend construida con **HTML, CSS y JavaScript**.  
Simula una plataforma de galería de arte donde los usuarios pueden explorar obras, artistas, categorías y perfiles.

El objetivo principal de este repositorio es mantener una **estructura clara, escalable y fácil de mantener**, para que cualquier miembro del equipo pueda entender rápidamente cómo está organizado el proyecto.

---

## Estructura general del proyecto
/project
├── index.html
├── /pages
├── /assets
│ ├── /css
│ ├── /js
│ ├── /img
│ └── /icons
├── /data
├── /partials
└── README.md


---

## Concepto de la estructura

El proyecto sigue tres principios fundamentales:

1. **Separación de responsabilidades**  
   HTML define la estructura, CSS define la apariencia y JavaScript define el comportamiento.

2. **Escalabilidad**  
   La estructura permite añadir nuevas páginas, estilos o funcionalidades sin romper lo existente.

3. **Mantenibilidad**  
   Cualquier persona del equipo puede encontrar rápidamente dónde debe modificar algo.

---

## Descripción detallada de carpetas

### `/pages`
Contiene todas las vistas HTML de la aplicación, excepto `index.html` que es la página principal.

Cada archivo representa una pantalla completa:
- `obras.html` → listado de obras  
- `obra-detalle.html` → detalle de una obra  
- `artistas.html` → listado de artistas  
- `artista-detalle.html` → perfil de un artista  
- `perfil.html` → perfil del usuario  
- `login.html` y `registro.html` → autenticación  

**Regla:**  
Un archivo HTML = una vista.

---

### `/assets/css`
Contiene todos los estilos del proyecto.  
No se escriben estilos directamente en los archivos HTML.

| Archivo | Qué contiene |
|--------|--------------|
| `styles.css` | Archivo principal que importa todos los demás |
| `reset.css` | Normalización entre navegadores |
| `variables.css` | Colores, tipografías y espaciados |
| `base.css` | Estilos generales (body, texto, enlaces) |
| `layout.css` | Estructura (header, footer, grids, secciones) |
| `components.css` | Botones, cards, formularios, modales |
| `pages.css` | Estilos específicos por página |

En los HTML solo se importa `styles.css`.

---

### `/assets/js`
Contiene toda la lógica JavaScript del proyecto.

| Archivo | Responsabilidad |
|--------|----------------|
| `main.js` | Funciones globales (menú, header, footer, navegación) |
| `pages.js` | Lógica específica de cada vista |
| `auth.js` | Login, registro y control de sesión |
| `utils.js` | Funciones auxiliares reutilizables |

Cada página HTML define su identidad con:

```html
<body data-page="obras">
