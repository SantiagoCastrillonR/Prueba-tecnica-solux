# Solux Chat

Prueba técnica: **chat en tiempo real**.

Este archivo es el **Manual de Ejecución**: 

## Contenido

1. [Estructura del repositorio](#1-estructura-del-repositorio)
2. [Tecnologías y por qué las elegí](#2-tecnologías-y-por-qué-las-elegí)
3. [Ejecutar con Docker (recomendado)](#3-ejecutar-con-docker-recomendado)
4. [Usuarios de prueba](#4-usuarios-de-prueba)
5. [Ejecutar sin Docker](#5-ejecutar-sin-docker)
6. [Variables de entorno](#6-variables-de-entorno)

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

## 2. Tecnologías 

| Parte       | Tecnología             | 
| ----------- | ---------------------- | 
| Frontend    | Next.js + React        | 
| Estilos     | Tailwind CSS           | 
| Estado      | Context API            | 
| Backend     | NestJS                 | 
| Tiempo real | Socket.IO              | 
| Base de datos | PostgreSQL           | 
| ORM         | Drizzle                | 
| Sesión      | JWT en cookie `httpOnly` | 
| Contenedores | Docker Compose        |                                    

## 3. Ejecutar con Docker 

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

**http://localhost:3000**.

| Dirección                        | Descripcion                         |
| -------------------------------- | ------------------------------ |
| http://localhost:3000            | La aplicación web              |
| http://localhost:4000/api        | La API                         |
| http://localhost:4000/api/docs   | Documentación de la API (Swagger) |
| http://localhost:4000/health     | Estado de la API y la base de datos |

## 4. Usuarios de prueba

Todos tienen la contraseña **`Solux2026!`**

| Correo             | 
| ------------------ | 
| `ana@solux.test`   | 
| `bruno@solux.test` | 
| `carla@solux.test` | 
| `david@solux.test` | 


## 5. Ejecutar sin Docker

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

| Archivo                               | Se usa cuando...                 | 
| ------------------------------------- | -------------------------------- | 
| `.env.example` (raíz)                 | Ejecutas todo con Docker         | 
| `Backend/Back-SOLUX/.env.example`     | Ejecutas la API sin Docker       | 
| `Frontend/Front-SOLUX/.env.example`   | Ejecutas la web sin Docker       | 


Variables del `.env.example` de la raíz (Docker):

| Variable                                          | 
| ------------------------------------------------- | 
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | 
| `JWT_SECRET`                                      | 
| `API_NODE_ENV`                                    | 
| `COOKIE_SECURE`                                   | 
| `RUN_SEED`                                        | 
| `WEB_ORIGIN`                                      | 
| `WEB_PORT`, `API_PORT`                            | 
| `PUBLIC_API_URL`, `PUBLIC_WS_URL`                 | 

Las variables para ejecutar sin Docker están explicadas en el [README del backend](Backend/Back-SOLUX/README.md#3-variables-de-entorno) y en el [del frontend](Frontend/Front-SOLUX/README.md#3-variables-de-entorno).
