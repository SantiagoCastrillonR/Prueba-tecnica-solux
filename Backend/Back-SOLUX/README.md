# Solux Chat - Backend

Esta es la API del chat. Se encarga de los usuarios, el inicio de sesión, los chats y los mensajes en tiempo real.

Para levantar todo el proyecto, mira el [README principal](../../README.md).

## Contenido

1. [Estructura de carpetas](#1-estructura-de-carpetas)
2. [Tecnologías](#2-tecnologías)
3. [Ejecutar con Docker](#3-ejecutar-con-docker)
4. [Ejecutar sin Docker](#4-ejecutar-sin-docker)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Endpoints](#6-endpoints)
7. [Postman](#7-postman)

## 1. Estructura de carpetas

```
src/
├── modules/
│   ├── auth/     registro, login y logout
│   ├── users/    usuarios
│   └── chats/    chats, mensajes y socket
└── shared/       base de datos y cosas comunes
```

Cada módulo tiene tres carpetas: `domain` (las reglas), `application` (los casos de uso) e `infrastructure` (los controladores, el socket y la base de datos).

## 2. Tecnologías

- NestJS
- Socket.IO
- PostgreSQL con Drizzle
- JWT en una cookie para la sesión
- bcrypt para las contraseñas

## 3. Ejecutar con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

## 4. Ejecutar sin Docker

### Requisitos

- Node.js 24 o superior
- pnpm 12
- PostgreSQL

### Pasos

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

El `docker compose up -d` de esta carpeta solo levanta la base de datos. Si ya tienes PostgreSQL instalado, te lo puedes saltar.

La API queda en http://localhost:4000/api y Swagger en http://localhost:4000/api/docs.

## 5. Variables de entorno

Están en el archivo `.env.example`:

- `NODE_ENV`: `development` o `production`.
- `PORT`: puerto de la API.
- `API_PREFIX`: prefijo de las rutas (`api`).
- `DATABASE_URL`: conexión a la base de datos.
- `DATABASE_SSL`: en `false` si la base de datos es local.
- `JWT_SECRET`: clave para la sesión, mínimo 32 caracteres.
- `JWT_EXPIRES_IN`: cuánto dura la sesión.
- `CORS_ORIGIN`: la URL del frontend.
- `COOKIE_SECURE`: tiene que estar en `false` si no usas https.
- `BCRYPT_ROUNDS`: para cifrar las contraseñas.

## 6. Endpoints

- `POST /api/auth/register`: crear cuenta
- `POST /api/auth/login`: iniciar sesión
- `POST /api/auth/logout`: cerrar sesión
- `GET /api/auth/me`: usuario actual
- `GET /api/users`: lista de usuarios
- `POST /api/chats`: crear un chat
- `GET /api/chats`: mis chats
- `GET /api/chats/:id/messages`: mensajes de un chat


## 7. Postman

En la carpeta `postman` está la colección para probar la API. 
