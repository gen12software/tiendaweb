# Tienda Web

E-commerce construido con Next.js 15, Supabase y MercadoPago.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Estilos:** Tailwind CSS
- **Base de datos / Auth:** Supabase
- **Pagos:** MercadoPago

## Setup local

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd tiendaweb
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completar `.env.local` con los valores reales:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon/public de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role de Supabase (solo server) |
| `MP_ACCESS_TOKEN` | Access token de MercadoPago |
| `MP_WEBHOOK_SECRET` | Secret para verificar webhooks de MercadoPago |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (default: `http://localhost:3000`) |

Las claves de Supabase se encuentran en: **Project Settings → API**.
El access token de MercadoPago se obtiene en: **Tus integraciones → Credenciales**.

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```
