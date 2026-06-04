# Pingpong Ranking · Oficina

Ranking de partidos de pingpong de la oficina. Mobile-first, URL pública para ver
el ranking; registrar/editar requiere un PIN compartido. Diseño basado en el manual
de marca **Tazki**.

## Stack

- **Rails 7.2** (Ruby 3.3.11 vía rbenv) · API JSON + shell de la SPA.
- **React 18 + Vite** (`vite_rails`) · front en `app/frontend/`.
- **PostgreSQL (Supabase)** en development/production · **SQLite** en test (offline).
- React Router · TanStack Query · Lucide icons.

## Reglas de puntaje

| Partido | Gana el ganador | Bonus al perdedor |
| --- | --- | --- |
| A 11 | 2 puntos | +1 si el perdedor anota **más de 8** (9+) |
| A 21 | 3 puntos | +1 si el perdedor anota **más de 15** (16+) |

El resultado es opcional; sin marcador no se puede otorgar el bonus. En deuce cuenta
el marcador real (ej. 32–30 también da el bonus). Fuente de verdad:
[`app/models/match_scoring.rb`](app/models/match_scoring.rb).

## Setup

1. **Dependencias**

   ```sh
   bundle install
   npm install
   ```

2. **Variables de entorno** — copia `env.example` a `.env` y completa:

   ```sh
   # Supabase -> Project Settings -> Database -> Connection string -> URI (puerto 5432)
   DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
   # PIN compartido del equipo para escrituras
   APP_PIN=2468
   ```

3. **Base de datos** (contra Supabase)

   ```sh
   bin/rails db:migrate
   bin/rails db:seed     # opcional: jugadores + partidos de ejemplo
   ```

## Correr en desarrollo

```sh
bin/dev          # levanta Rails (:3000) + Vite juntos
```

Abre <http://localhost:3000>. El ranking es la landing.

## Tests

Corren offline contra SQLite, sin tocar Supabase:

```sh
bin/rails test
```

## Deploy

Pendiente de afinar según el host (Render / Fly / Railway). Requisitos:

- Variables: `DATABASE_URL` (Supabase), `APP_PIN`, `RAILS_MASTER_KEY` (de `config/master.key`).
- El build de assets corre `vite build` dentro de `assets:precompile`, así que la imagen
  de deploy necesita **Node disponible** (ajustar el `Dockerfile` o usar un buildpack con Node).
