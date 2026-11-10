# Solux Chat - Backend

API del chat. Maneja los usuarios, la sesión, los chats y los mensajes en tiempo real.

> Si solo quieres ver la aplicación funcionando, sigue el [README principal](../../README.md): con Docker se levanta todo con un solo comando.

## Contenido

1. [Tecnologías](#1-tecnologías)
2. [Cómo ejecutarlo](#2-cómo-ejecutarlo)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Endpoints](#5-endpoints)
6. [Eventos del socket](#6-eventos-del-socket)
7. [Base de datos](#7-base-de-datos)
8. [Probar con Postman](#8-probar-con-postman)
9. [Scripts](#9-scripts)

## 1. Tecnologías

- **NestJS**: framework de Node.js para la API.
- **Socket.IO**: mensajes en tiempo real.
- **PostgreSQL + Drizzle ORM**: base de datos.
- **JWT en cookie `httpOnly`**: sesión del usuario.
- **bcrypt**: guardar las contraseñas cifradas.
- **class-validator**: validar los datos que llegan.
- **Swagger**: documentación de la API en `/api/docs`.

## 2. Cómo ejecutarlo

Requisitos: Node.js 24 o superior, pnpm 12 y PostgreSQL (o Docker para levantar solo la base de datos).

```bash
cp .env.example .env      # 1. crear el archivo de variables
pnpm install              # 2. instalar dependencias
docker compose up -d      # 3. (opcional) levantar PostgreSQL en el puerto 5433
pnpm db:migrate           # 4. crear las tablas
pnpm db:seed              # 5. (opcional) cargar los usuarios de prueba
pnpm start:dev            # 6. arrancar la API
```

La API queda en http://localhost:4000/api y Swagger en http://localhost:4000/api/docs.

## 3. Variables de entorno

Están en [.env.example](.env.example). Al arrancar, la API revisa que todas existan y tengan un formato correcto ([env.validation.ts](src/shared/config/env.validation.ts)). Si falta alguna, se detiene y muestra cuál.

| Variable         | Ejemplo                                                   | Para qué sirve                                                 |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `NODE_ENV`       | `development`                                             | Entorno. En `production` se desactiva Swagger.                 |
| `PORT`           | `4000`                                                    | Puerto de la API.                                              |
| `API_PREFIX`     | `api`                                                     | Prefijo de las rutas (`/api/...`).                             |
| `CORS_ORIGIN`    | `http://localhost:3000`                                   | Dirección del frontend, que puede hacer peticiones a la API.   |
| `DATABASE_URL`   | `postgres://postgres:postgres@localhost:5433/solux_chat`  | Conexión a PostgreSQL.                                         |
| `DATABASE_SSL`   | `false`                                                   | Usar SSL con la base de datos (solo en servicios en la nube).  |
| `JWT_SECRET`     | (texto largo)                                             | Clave para firmar la sesión. Mínimo 32 caracteres.             |
| `JWT_EXPIRES_IN` | `1d`                                                      | Cuánto dura la sesión (`1d` = un día).                         |
| `COOKIE_SECURE`  | `false`                                                   | `true` solo con HTTPS. En localhost debe ser `false`.          |
| `BCRYPT_ROUNDS`  | `10`                                                      | Qué tan fuerte es el cifrado de contraseñas.                   |

## 4. Estructura de carpetas

```
src/
├── main.ts              punto de entrada
├── app.setup.ts         configuración: CORS, validación, cookies, Swagger
├── seed.ts              carga los datos de prueba
├── modules/
│   ├── auth/            registro, login, logout y protección de rutas
│   ├── users/           lista de usuarios
│   └── chats/           chats, mensajes y el socket
└── shared/              cosas comunes: base de datos, configuración, errores
```

Cada módulo está dividido en tres capas:

| Capa              | Qué contiene                                                          | Ejemplo                            |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------- |
| `domain/`         | Las reglas del negocio, sin depender de NestJS ni de la base de datos | `Chat`, `Message`, excepciones     |
| `application/`    | Los casos de uso (una acción del usuario = un archivo) y los DTOs     | `SendMessageUseCase`, `CreateChatDto` |
| `infrastructure/` | Lo que conecta con el exterior: HTTP, socket y base de datos          | `ChatController`, `ChatGateway`, repositorios |

Así, por ejemplo, la regla "solo los miembros pueden escribir en un chat" está en un solo lugar y la usan tanto la API REST como el socket.

## 5. Endpoints

Todos empiezan por `/api`. Menos registro, login, logout y `/health`, todos necesitan sesión.

| Método | Ruta                    | Qué hace                                                    |
| ------ | ----------------------- | ----------------------------------------------------------- |
| POST   | `/auth/register`        | Crear cuenta                                                |
| POST   | `/auth/login`           | Iniciar sesión (guarda la cookie)                           |
| POST   | `/auth/logout`          | Cerrar sesión (borra la cookie y cierra el socket)          |
| GET    | `/auth/me`              | Usuario actual                                              |
| GET    | `/users`                | Lista de usuarios (sin incluirme)                           |
| GET    | `/users/:id`            | Un usuario                                                  |
| POST   | `/chats`                | Crear chat. Con 1 persona es directo; con más, es un grupo  |
| GET    | `/chats`                | Mis chats, ordenados por el último mensaje                  |
| GET    | `/chats/:id/messages`   | Historial de mensajes de un chat (solo si soy miembro)      |
| GET    | `/health` (sin `/api`)  | Estado de la API y la base de datos                         |

Cuando hay un error, la respuesta siempre tiene la misma forma:

```json
{
  "statusCode": 409,
  "code": "USER_ALREADY_EXISTS",
  "message": "..."
}
```

El frontend usa el `code` para mostrar un mensaje claro en español.

## 6. Eventos del socket

El socket usa la misma cookie de la sesión: si no hay sesión válida, la conexión se rechaza.

| Evento         | Dirección          | Qué hace                                         |
| -------------- | ------------------ | ------------------------------------------------ |
| `chat:message` | cliente → servidor | Enviar un mensaje. El servidor responde si se guardó o no |
| `chat:message` | servidor → cliente | Llega un mensaje nuevo de uno de mis chats       |
| `chat:created` | servidor → cliente | Alguien me agregó a un chat nuevo                |
| `chat:join`    | cliente → servidor | Unirse a la sala de un chat                      |

**Cómo se asegura que cada usuario reciba solo sus mensajes:** al conectarse, el socket entra a una "sala" por cada chat en el que participa. Cuando alguien envía un mensaje, el servidor comprueba que es miembro, lo guarda y lo envía solo a la sala de ese chat.

Cada mensaje lleva un `clientId` generado por el navegador. Si el mismo mensaje se envía dos veces (por ejemplo, al reconectar), no se duplica.

## 7. Base de datos

| Tabla               | Qué guarda                                                |
| ------------------- | --------------------------------------------------------- |
| `users`             | Usuarios. El correo es único y la contraseña va cifrada   |
| `chats`             | Chats directos y grupos                                   |
| `chat_participants` | Qué usuarios están en cada chat                           |
| `messages`          | Mensajes, con su remitente y la hora del servidor         |
| `revoked_sessions`  | Sesiones cerradas con logout, para que el token no sirva más |

Algunas reglas también las asegura la base de datos, no solo el código: el correo no se puede repetir, solo un miembro del chat puede guardar mensajes en él, y entre dos personas solo puede existir un chat directo.

Las tablas se crean con las migraciones de [drizzle/](drizzle/). Las migraciones no se editan una vez creadas, porque alguien ya pudo aplicarlas en su base de datos. Por eso, cuando simplifiqué el proyecto, agregué una migración nueva (`0005`) que quita las columnas que ya no se usaban.

## 8. Probar con Postman

En [postman/](postman/) está la colección con las peticiones principales:

| Carpeta           | Qué prueba                                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| 1. Autenticación  | Registro, correo repetido, datos inválidos, login correcto e incorrecto   |
| 2. Usuarios       | Lista de usuarios                                                          |
| 3. Chats          | Crear un chat, ver mis chats y ver los mensajes                            |
| 4. Cerrar sesión  | Logout, y que después de cerrar sesión no se pueda acceder                 |

Para usarla, impórtala en Postman y ejecútala en orden (por ejemplo, con **Run collection**). El login guarda la cookie de sesión y las siguientes peticiones la usan. También se puede ejecutar desde la terminal:

```bash
npx newman run postman/solux-chat.postman_collection.json
```

Necesita la API corriendo y los usuarios de prueba cargados. El login y el registro aceptan 5 intentos por minuto: si la ejecutas varias veces seguidas, espera un minuto.

Los mensajes en tiempo real van por Socket.IO, así que se prueban desde la aplicación web (ver el [README principal](../../README.md#5-cómo-probar-el-chat)).

## 9. Scripts

| Comando           | Qué hace                              |
| ----------------- | ------------------------------------- |
| `pnpm start:dev`  | Arrancar en modo desarrollo           |
| `pnpm build`      | Compilar                              |
| `pnpm db:migrate` | Aplicar las migraciones               |
| `pnpm db:seed`    | Cargar los datos de prueba            |
| `pnpm db:studio`  | Ver la base de datos en el navegador  |
| `pnpm lint`       | Revisar el código                     |
