# Solux Chat - Frontend

Página web del chat. Se conecta al [backend](../../Backend/Back-SOLUX) para los datos (REST) y para los mensajes en tiempo real (Socket.IO).

> Si solo quieres ver la aplicación funcionando, sigue el [README principal](../../README.md): con Docker se levanta todo con un solo comando.

## Contenido

1. [Tecnologías](#1-tecnologías)
2. [Cómo ejecutarlo](#2-cómo-ejecutarlo)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Pantallas](#4-pantallas)
5. [Estructura de carpetas](#5-estructura-de-carpetas)
6. [Estado global (contextos)](#6-estado-global-contextos)
7. [Cómo se envía un mensaje](#7-cómo-se-envía-un-mensaje)
8. [Scripts](#8-scripts)

## 1. Tecnologías

- **Next.js 16 + React 19** con TypeScript.
- **Tailwind CSS 4** para los estilos.
- **socket.io-client** para el tiempo real.
- **Zod** para validar los formularios.
- **Motion** para las animaciones.

## 2. Cómo ejecutarlo

Primero el backend tiene que estar corriendo en el puerto 4000. Después:

```bash
cp .env.example .env.local   # 1. crear el archivo de variables
npm install                  # 2. instalar dependencias
npm run dev                  # 3. arrancar en http://localhost:3000
```

## 3. Variables de entorno

Están en [.env.example](.env.example). Con los valores de ejemplo funciona sin cambiar nada.

| Variable              | Valor de ejemplo            | Para qué sirve                          |
| --------------------- | --------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Dirección de la API REST                |
| `NEXT_PUBLIC_WS_URL`  | `http://localhost:4000`     | Dirección del servidor de Socket.IO     |

Llevan el prefijo `NEXT_PUBLIC_` porque las usa el navegador. Next.js las incluye al compilar, así que si las cambias hay que reiniciar `npm run dev` (o volver a compilar). La app comprueba al arrancar que sean URLs válidas ([env.ts](src/lib/env.ts)).

## 4. Pantallas

| Ruta              | Qué muestra                                          |
| ----------------- | ---------------------------------------------------- |
| `/login`          | Iniciar sesión                                       |
| `/register`       | Crear cuenta                                         |
| `/chats`          | Lista de mis chats y botón para crear uno nuevo      |
| `/chats/[chatId]` | La conversación                                      |

Si no hay sesión, `/chats` redirige a `/login`. Si ya hay sesión, `/login` redirige a `/chats`.

En el celular se ve la lista **o** la conversación; en pantallas grandes se ven las dos al tiempo.

## 5. Estructura de carpetas

```
src/
├── app/          páginas (rutas de Next.js)
├── components/
│   ├── auth/     formularios de login y registro
│   ├── chat/     lista de chats, conversación, burbujas, nuevo chat...
│   └── ui/       componentes reutilizables: botón, input, spinner, skeleton...
├── providers/    contextos: sesión, socket y chats
├── hooks/        hooks para usar los contextos y los mensajes de un chat
├── services/     llamadas a la API
├── schemas/      validaciones con Zod
├── lib/          utilidades: fetch, socket, errores, formato de fechas
├── types/        tipos de TypeScript
└── proxy.ts      redirige al login si no hay cookie de sesión
```

## 6. Estado global (contextos)

Usé **Context API**, con tres contextos:

| Contexto         | Qué guarda                                                      |
| ---------------- | --------------------------------------------------------------- |
| `AuthProvider`   | El usuario actual y las funciones `login`, `register` y `logout` |
| `SocketProvider` | La conexión del socket y su estado (conectado / reconectando)   |
| `ChatsProvider`  | La lista de chats, que se actualiza en tiempo real              |

Los mensajes de la conversación abierta están en el hook [useChatMessages](src/hooks/useChatMessages.ts), porque solo los usa esa pantalla.

## 7. Cómo se envía un mensaje

1. El usuario escribe y pulsa Enviar.
2. El mensaje aparece de inmediato con el estado "Enviando…".
3. Se envía por el socket (`chat:message`) y el servidor responde si lo guardó.
4. Si se guardó, se muestra la hora. Si falló (por ejemplo, sin conexión), aparece "No se envió" con un botón **Reintentar**.
5. Los demás miembros del chat lo reciben por el socket al instante.

Si el socket se desconecta, arriba aparece el aviso **"Sin conexión. Reintentando…"**. Al reconectar, se vuelven a pedir los mensajes que llegaron mientras tanto.

## 8. Scripts

| Comando             | Qué hace                     |
| ------------------- | ---------------------------- |
| `npm run dev`       | Arrancar en modo desarrollo  |
| `npm run build`     | Compilar                     |
| `npm run start`     | Ejecutar lo compilado        |
| `npm run lint`      | Revisar el código            |
| `npm run typecheck` | Revisar los tipos            |
