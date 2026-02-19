# GreenUp Backend (Express + TypeScript)

A minimal API server for GreenUp, built with Express and Supabase. It does not replace Supabase Auth — it complements it with custom endpoints when needed.

## Features

- Health check: `GET /health`
- Authenticated user info: `GET /me` (verifies Supabase access token)
- Fetch your `profiles` row: `GET /profiles/me`
- Update your `profiles` row: `POST /profiles/update`

## Requirements

- Node.js 18+
- Supabase project URL and anon key
- (Optional) Supabase Service Role Key if you plan to do admin/server-only operations

## Setup

1. Create an `.env` file in this folder with:

```
PORT=8787
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # optional
```

2. Install dependencies:

```
npm install
```

3. Start the server in dev mode:

```
npm run dev
```

The API will run on `http://localhost:8787` by default.

## Auth: how it works

- The client (your Expo app) logs in using Supabase Auth and receives an access token.
- Send that token to this backend as a Bearer token: `Authorization: Bearer <access_token>`.
- The middleware calls `supabase.auth.getUser(token)` to verify and loads the user.

## Example requests

```
GET /health

GET /me
Authorization: Bearer <token>

GET /profiles/me
Authorization: Bearer <token>

POST /profiles/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "frode",
  "first_name": "Frode",
  "last_name": "Maneskold"
}
```

Note: The `profiles` table should include an `id` UUID column that matches `auth.users.id`, and Row Level Security (RLS) policies must allow the authenticated user to select/update their own row.

## Production

```
npm run build
npm start
```

Deploy wherever you prefer (Render, Fly.io, Railway, etc.). Set the same env variables in your hosting provider.


