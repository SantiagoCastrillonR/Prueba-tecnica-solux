# Solux Chat - Frontend

Esta es la página web del chat. Aquí el usuario inicia sesión, ve sus chats y envía mensajes.

Para levantar todo el proyecto, mira el [README principal](../../README.md).

## Contenido

1. [Estructura de carpetas](#1-estructura-de-carpetas)
2. [Tecnologías](#2-tecnologías)
3. [Ejecutar con Docker](#3-ejecutar-con-docker)
4. [Ejecutar sin Docker](#4-ejecutar-sin-docker)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Pantallas](#6-pantallas)

## 1. Estructura de carpetas

```
src/
├── app/          las páginas
├── components/   los componentes
├── providers/    los contextos (sesión, socket y chats)
├── hooks/        hooks para usar los contextos
├── services/     las llamadas a la API
├── schemas/      validaciones con Zod
└── types/        los tipos
```

## 2. Tecnologías

- Next.js y React
- TypeScript
- Tailwind CSS
- socket.io-client
- Zod
- Context API para el estado global

## 3. Ejecutar con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

## 4. Ejecutar sin Docker

### Requisitos

- Node.js 24 o superior
- El backend corriendo en el puerto 4000

### Pasos

```bash
cp .env.example .env.local
npm install
npm run dev
```

La página queda en http://localhost:3000.

## 5. Variables de entorno

Están en el archivo `.env.example`:

- `NEXT_PUBLIC_API_URL`: la URL de la API (`http://localhost:4000/api`).
- `NEXT_PUBLIC_WS_URL`: la URL del socket (`http://localhost:4000`).


## 6. Pantallas

- `/login`
- `/register`
- `/chats`
- `/chats/[chatId]`

