# ParcelTrust Frontend


[![Build](https://github.com/amollrod/parceltrust-front/actions/workflows/pipeline.yml/badge.svg)](https://github.com/amollrod/parceltrust-front/actions/workflows/pipeline.yml)
[![License: GPLv3](https://img.shields.io/badge/license-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)
[![TFG Document License: CC BY-NC 3.0 + GNU FDL 1.3](https://img.shields.io/badge/TFG%20License-CC%20BY--NC%203.0%20%2B%20GNU%20FDL%201.3-blue)](https://creativecommons.org/licenses/by-nc/3.0/es/)

Frontend de la aplicación **ParcelTrust**, desarrollado con [Preact](https://preactjs.com/), [Vite](https://vitejs.dev/) y [Bootstrap](https://getbootstrap.com/). Este frontend consume la API del sistema de trazabilidad de paquetes basado en blockchain y ofrece autenticación vía OAuth2.

![arquitecturaFront.jpg](arquitecturaFront.jpg)

---

## Arquitectura y tecnologías utilizadas

* [Vite](https://vitejs.dev/) como bundler
* [Preact](https://preactjs.com/) como framework UI
* [React Router DOM](https://reactrouter.com/) para enrutamiento SPA
* [Bootstrap 5](https://getbootstrap.com/) para UI y estilos
* [oidc-client-ts](https://github.com/authts/oidc-client-ts) para autenticación OAuth2
* Docker + NGINX para despliegue autocontenible

---

## Estructura básica del proyecto

```
parceltrust-front/
├── public/             # Archivos públicos
├── src/
│   ├── context/        # Contexto de autenticación
│   ├── components/     # Componentes reutilizables (Navbar, etc.)
│   ├── pages/          # Vistas principales
│   ├── routes/         # Definición de rutas
│   ├── services/       # Servicios de API y lógica OIDC
│   ├── main.tsx        # Punto de entrada
│   └── app.tsx         # Enrutador principal
├── Dockerfile
├── nginx.conf
└── README.md
```

---

## Requisitos

* Node.js v20+
* npm v9+
* Docker (opcional para contenedor)
* Token de acceso a GHCR (si quieres hacer `docker pull` de la imagen precompilada)

---

## Instalación y ejecución local (modo desarrollo)

```bash
# Clonar el repositorio
git clone https://github.com/amollrod/parceltrust-front.git
cd parceltrust-front

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación se iniciará en `http://localhost:5173`.

---

## Compilación para producción

```bash
npm run build
```

El resultado se genera en el directorio `/dist` y está listo para ser servido mediante NGINX o cualquier servidor estático.

---

## Uso con Docker (local)

Puedes construir y correr el frontend con Docker de forma autocontenida:

### Construir imagen Docker

```bash
docker build -t parceltrust-front .
```

### Ejecutar contenedor en el puerto 5173

```bash
docker run -p 5173:80 parceltrust-front
```

Luego abre: [http://localhost:5173](http://localhost:5173)

---

## Imagen desde GitHub Container Registry (GHCR)

Este proyecto publica automáticamente su imagen Docker en GHCR tras cada push a `master`.

### 1. Solicitar acceso

El propietario del repositorio ha generado un token de acceso para hacer `read:packages`. Contacta a [amollrod@uoc.edu](mailto:amollrod@uoc.edu?subject=[GitHub]%20ACCESS%20TOKEN).

### 2. Iniciar sesión en GHCR

```bash
echo YOUR_TOKEN | docker login ghcr.io -u amollrod --password-stdin
```

### 3. Descargar y ejecutar imagen

```bash
docker pull ghcr.io/amollrod/parceltrust-front:latest
docker run -p 5173:80 ghcr.io/amollrod/parceltrust-front:latest
```

Accede a la aplicación en: [http://localhost:5173](http://localhost:5173).

---

## Licencias

- Este repositorio está licenciado bajo los términos de la [GNU General Public License v3.0](./LICENSE)
- La memoria del TFG está protegida bajo: [CC BY-NC 3.0 España](https://creativecommons.org/licenses/by-nc/3.0/es/) y [GNU Free Documentation License 1.3](https://www.gnu.org/licenses/fdl-1.3.html)


Proyecto desarrollado como parte del TFG de **Alex Moll Rodríguez** para la **UOC** en 2025.