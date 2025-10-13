# NASWeb

Herramienta visual de búsqueda de arquitecturas neuronales usando algoritmos bioinspirados.

## Índice

- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Arquitectura y flujo](#arquitectura-y-flujo)
- [API / Rutas](#api--rutas)
- [Recursos adicionales](#recursos-adicionales)

## Requisitos previos

- Node.js >= 18.x (verifica con `node -v`).
- npm >= 9.x (verifica con `npm -v`).
- Acceso a la API/servicios externos necesarios (_____).
- Credenciales o llaves requeridas para el backend (_____).

## Instalación

```bash
# 1. Clona el repositorio
git clone _____

# 2. Entra al directorio del proyecto
cd NASWeb

# 3. Instala dependencias
npm install
```

## Variables de entorno

Completa el archivo `.env` con los valores reales. Si no existe, crea uno en la raíz del proyecto.

```ini
# Archivo: .env
PORT=_____
API_URL=_____
LOG_LEVEL=_____
```

> Nota: ajusta las variables según tu despliegue (ej. puerto del backend, URL de la API de búsqueda, claves, etc.).

## Scripts disponibles

Todos los comandos se ejecutan desde la raíz del proyecto.

```bash
# Levanta el servidor en modo desarrollo (usa nodemon)
npm run dev

# Ejecuta el servidor sin nodemon (si así lo configuras)
node index.js

# Script de pruebas (personalízalo antes de usar)
npm test
```

- `npm run dev`: inicia Express con reinicio en caliente, ignorando los archivos dentro de `public/` según `nodemonConfig`.
- `npm test`: actualmente muestra un mensaje de marcador; reemplázalo por tu suite de pruebas.

## Estructura del proyecto

```
NASWeb/
├─ index.js            # Punto de entrada de Express
├─ controllers/
│  └─ logic.js         # Controladores principales (completa descripción)
├─ routes/
│  └─ router.js        # Definición de rutas HTTP
├─ public/
│  ├─ css/index.css    # Estilos personalizados (glassmorphism + overrides de Bootstrap)
│  ├─ js/start.form.js # Lógica del formulario y consumo de API
│  └─ img/             # Recursos gráficos
└─ views/
   ├─ start.ejs        # Vista principal con controles y resultados
   ├─ home.ejs         # Vista principal (solo informativa)
   └─ partials/        # Fragmentos compartidos (_header, _footer, _nav)
```


## Arquitectura y flujo

1. El cliente (EJS + Bootstrap) renderiza las vistas desde Express.
2. Los controles del formulario disparan peticiones `fetch` a `http://127.0.0.1:3000/api/search` (ajusta la URL según ambiente).
3. La respuesta se muestra en la tarjeta de resultados mediante `public/js/start.form.js`.
4. El botón de descarga ofrece opciones (.json / .pth) para la arquitectura optimizada (implementación pendiente en el backend: _____).


## API / Rutas

Completa esta sección con las rutas reales (método, URL, descripción y respuesta esperada).

| Método | Ruta        | Descripción                        | Controlador           |
|--------|-------------|------------------------------------|-----------------------|
| POST   | /api/search | Inicia la búsqueda de arquitecturas (_____). | controllers/logic.js |
| GET    | _____       | _____                              | _____                 |



## Recursos adicionales

- Guía de estilo / UI: _____
- Documentación técnica: _____
- Roadmap / tareas pendientes: _____

---