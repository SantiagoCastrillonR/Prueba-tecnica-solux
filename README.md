# Solux Chat

Prueba técnica: **chat en tiempo real**.

Es una aplicación web donde puedes registrarte, iniciar sesión, crear chats con una o varias personas y enviar mensajes que llegan al instante, sin recargar la página.

Este archivo es el **Manual de Ejecución**: explica cómo poner a funcionar el proyecto.

## Contenido

1. [Estructura del repositorio](#1-estructura-del-repositorio)
2. [Tecnologías y por qué las elegí](#2-tecnologías-y-por-qué-las-elegí)
3. [Ejecutar con Docker (recomendado)](#3-ejecutar-con-docker-recomendado)
4. [Usuarios de prueba](#4-usuarios-de-prueba)
5. [Cómo probar el chat](#5-cómo-probar-el-chat)
6. [Ejecutar sin Docker](#6-ejecutar-sin-docker)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Qué incluye el proyecto](#8-qué-incluye-el-proyecto)
9. [Problemas comunes](#9-problemas-comunes)

## 1. Estructura del repositorio

```
.
├── Backend/Back-SOLUX/     API con NestJS, Socket.IO y PostgreSQL
├── Frontend/Front-SOLUX/   Página web con Next.js y Tailwind
├── docker-compose.yml      Levanta base de datos + API + web
└── .env.example            Variables de entorno de ejemplo (para Docker)
```

Cada carpeta tiene su propio README con más detalle:

- [README del backend](Backend/Back-SOLUX/README.md)
- [README del frontend](Frontend/Front-SOLUX/README.md)

## 2. Tecnologías y por qué las elegí

| Parte       | Tecnología             | Por qué                                                                  |
| ----------- | ---------------------- | ------------------------------------------------------------------------ |
| Frontend    | Next.js + React        | Era obligatorio, y facilita las rutas y la organización de las páginas.  |
| Estilos     | Tailwind CSS           | Permite hacer una interfaz limpia y responsive rápido.                   |
| Estado      | Context API            | Es suficiente para la sesión, el socket y los chats; no hace falta otra librería. |
| Backend     | NestJS                 | Ordena el código en módulos y trae validación y WebSockets integrados.   |
| Tiempo real | Socket.IO              | Ya trae reconexión automática y "salas" para enviar cada mensaje solo a los miembros del chat. |
| Base de datos | PostgreSQL           | Los datos son relacionales: usuarios, chats y mensajes.                  |
| ORM         | Drizzle                | Es sencillo y funciona muy bien con TypeScript.                          |
| Sesión      | JWT en cookie `httpOnly` | El navegador guarda el token y JavaScript no lo puede leer (más seguro). |
| Contenedores | Docker Compose        | Levanta todo con un solo comando.                                        |

## 3. Ejecutar con Docker (recomendado)

### Requisitos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) abierto
- Los puertos **3000** y **4000** libres

### Pasos

```bash
git clone https://github.com/SantiagoCastrillonR/Prueba-tecnica-solux.git
cd Prueba-tecnica-solux
docker compose up --build
```

La primera vez tarda unos minutos. Cuando termine, abre **http://localhost:3000**.

No hay que configurar nada más. Al arrancar, la API crea las tablas y carga unos usuarios de prueba.

| Dirección                        | Qué es                         |
| -------------------------------- | ------------------------------ |
| http://localhost:3000            | La aplicación web              |
| http://localhost:4000/api        | La API                         |
| http://localhost:4000/api/docs   | Documentación de la API (Swagger) |
| http://localhost:4000/health     | Estado de la API y la base de datos |

### Comandos útiles

```bash
docker compose up --build -d   # arrancar en segundo plano
docker compose ps              # ver el estado de los contenedores
docker compose logs -f api     # ver los logs de la API
docker compose down            # apagar
docker compose down -v         # apagar y borrar la base de datos
```

## 4. Usuarios de prueba

Todos tienen la contraseña **`Solux2026!`**

| Correo             | Tiene chats                                   |
| ------------------ | --------------------------------------------- |
| `ana@solux.test`   | Chat con Bruno y grupo "Equipo SOLUX"         |
| `bruno@solux.test` | Chat con Ana y grupo "Equipo SOLUX"           |
| `carla@solux.test` | Grupo "Equipo SOLUX"                          |
| `david@solux.test` | Ninguno (sirve para crear un chat desde cero) |

También puedes registrar un usuario nuevo desde la pantalla de registro.

## 5. Cómo probar el chat

1. Abre una ventana normal del navegador y entra con **Ana**.
2. Abre una ventana de incógnito y entra con **Bruno**.
3. Entra al chat entre los dos y escribe algo. El mensaje aparece en la otra ventana sin recargar.
4. Entra con **David**: no puede ver los mensajes de Ana y Bruno, porque no participa en ese chat.
5. Prueba la desconexión: ejecuta `docker compose restart api`. La página muestra **"Sin conexión"** y, cuando la API vuelve, se reconecta sola.

## 6. Ejecutar sin Docker

### Requisitos

- Node.js 24 o superior
- pnpm 12 (`npm install -g pnpm`)
- PostgreSQL 18. Puedes usar uno instalado en tu equipo o levantar solo la base de datos con Docker (paso 2 de abajo).

### Backend (terminal 1)

```bash
cd Backend/Back-SOLUX
cp .env.example .env      # crear el archivo de variables
pnpm install              # instalar dependencias
docker compose up -d      # (opcional) levantar solo PostgreSQL en el puerto 5433
pnpm db:migrate           # crear las tablas
pnpm db:seed              # cargar los usuarios de prueba
pnpm start:dev            # arrancar la API en http://localhost:4000
```

### Frontend (terminal 2)

```bash
cd Frontend/Front-SOLUX
cp .env.example .env.local   # crear el archivo de variables
npm install                  # instalar dependencias
npm run dev                  # arrancar la web en http://localhost:3000
```

## 7. Variables de entorno

El proyecto tiene **tres** archivos de ejemplo, uno para cada forma de ejecutarlo:

| Archivo                               | Se usa cuando...                 | Se copia como |
| ------------------------------------- | -------------------------------- | ------------- |
| `.env.example` (raíz)                 | Ejecutas todo con Docker         | `.env`        |
| `Backend/Back-SOLUX/.env.example`     | Ejecutas la API sin Docker       | `.env`        |
| `Frontend/Front-SOLUX/.env.example`   | Ejecutas la web sin Docker       | `.env.local`  |

Con Docker **no hace falta crear el `.env`**: todas las variables tienen un valor por defecto. Solo cópialo si quieres cambiar algo (por ejemplo, un puerto ocupado).

Variables del `.env.example` de la raíz (Docker):

| Variable                                          | Para qué sirve                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Usuario, contraseña y nombre de la base de datos.                              |
| `JWT_SECRET`                                      | Clave secreta para firmar la sesión. Mínimo 32 caracteres.                       |
| `API_NODE_ENV`                                    | `development` o `production`. En `production` se desactiva Swagger.              |
| `COOKIE_SECURE`                                   | Debe ser `false` en `http://localhost`; si no, el navegador no guarda la sesión. |
| `RUN_SEED`                                        | Si es `true`, carga los usuarios de prueba al arrancar.                          |
| `WEB_ORIGIN`                                      | Dirección de la web, para que la API acepte sus peticiones (CORS).               |
| `WEB_PORT`, `API_PORT`                            | Puertos de la web y de la API en tu equipo.                                      |
| `PUBLIC_API_URL`, `PUBLIC_WS_URL`                 | Direcciones de la API y del socket que usa la web. Si las cambias, usa `--build`. |

Las variables para ejecutar sin Docker están explicadas en el [README del backend](Backend/Back-SOLUX/README.md#3-variables-de-entorno) y en el [del frontend](Frontend/Front-SOLUX/README.md#3-variables-de-entorno).

Los archivos `.env` reales no se suben al repositorio (están en `.gitignore`).

## 8. Qué incluye el proyecto

**Requisitos mínimos**

- Registro, inicio y cierre de sesión.
- Rutas protegidas: sin sesión no se puede entrar al chat ni conectarse al socket.
- Lista de usuarios y creación de chats con una o varias personas.
- Lista de mis chats, ordenada por el último mensaje.
- Mensajes en tiempo real con Socket.IO, mostrando quién lo envió y a qué hora.
- Cada usuario solo recibe los mensajes de sus chats.
- Validación de datos en el frontend (Zod) y en el backend (class-validator), con mensajes de error claros.
- Indicadores de carga (spinners y skeletons) y botones deshabilitados mientras hay una petición en curso.

**Puntos extra**

- Docker Compose: base de datos, API y web con un solo comando.
- Animaciones al aparecer mensajes, cambiar de chat y abrir ventanas.
- Tailwind CSS, con diseño adaptable a celular.
- Usuarios, chats y mensajes guardados en PostgreSQL: el historial se conserva.
- Estado global con Context API (sesión, socket y chats).
- Aviso de "Sin conexión" y reconexión automática; al reconectar se recuperan los mensajes perdidos.

## 9. Problemas comunes

| Problema                                   | Solución                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| El puerto 3000 o 4000 está ocupado         | Cierra lo que lo use, o cambia `WEB_PORT` / `API_PORT` en el `.env`.        |
| Inicio sesión pero la sesión se pierde     | Revisa que `COOKIE_SECURE` sea `false`.                                     |
| Cambié el código y no se ve el cambio      | Vuelve a ejecutar `docker compose up --build`.                              |
| PowerShell no deja ejecutar `npm`          | Usa `npm.cmd` en lugar de `npm`.                                            |
| La API no arranca: "Invalid environment variables" | Falta una variable en el `.env` o `JWT_SECRET` tiene menos de 32 caracteres. |
