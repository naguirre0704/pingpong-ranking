# CLAUDE.md — Pingpong Ranking

Contexto del proyecto para retomar cambios sin re-explicar. App interna para llevar el
ranking de partidos de pingpong de la oficina. Mobile-first, URL pública. Marca **Tazki**.

## TL;DR
- **Qué es:** registrar partidos 1v1, acumular puntos y mostrar un ranking. La landing es el ranking.
- **Stack:** Rails 7.2 (monolito) + React 18/Vite, Postgres en Supabase, deploy en Render.
- **Repo:** https://github.com/naguirre0704/pingpong-ranking (público). Branch `main`.
- **Ubicación local:** `~/proyectos/pingpong-ranking`.

## Stack y arquitectura
- **Monolito Rails**: sirve la API JSON **y** el shell de la SPA React (no es API-only).
- **Ruby 3.3.11** vía **rbenv** (`.ruby-version`). **Rails 7.2.3.1**.
- **React 18 + Vite** con `vite_rails`. Front en **`app/frontend/`** (no `src/`).
  El alias **`~` apunta a `app/frontend`** (ej. `import { App } from '~/App'`).
- **React Router** + **TanStack Query** + **lucide-react** (íconos).
- **DB:** PostgreSQL (Supabase) en development/production · **SQLite** en test (offline).

## Comandos
Las terminales nuevas necesitan rbenv. En cada comando one-off usa:
```sh
export PATH="/opt/homebrew/bin:$HOME/.rbenv/shims:$PATH"; eval "$(rbenv init - zsh)"
```
(Para que sea permanente, agregar `eval "$(rbenv init - zsh)"` a `~/.zshrc`.)

- **Dev (Rails :3000 + Vite):** `bin/dev`
- **Tests (SQLite, offline):** `unset DATABASE_URL; bin/rails test`  → 28 tests
- **Migrar test DB:** `unset DATABASE_URL; RAILS_ENV=test bin/rails db:migrate`
- **Build front:** `bin/vite build`
- **Migrar/seed Supabase (local):** requiere `DATABASE_URL` en `.env`; luego `bin/rails db:migrate` / `db:seed`

> Importante: para tests/migraciones de test, **`DATABASE_URL` debe estar SIN setear**
> (un valor vacío hace que Rails intente parsearlo y falle). En `.env` va comentado por defecto.

## Dominio: reglas de puntaje (lo central)
Fuente de verdad: [`app/models/match_scoring.rb`](app/models/match_scoring.rb) (PORO, testeado).
- Ganar **a 11** → **2 pts**. Ganar **a 21** → **3 pts**.
- **Bonus al perdedor (+1)** si registró marcador y superó el umbral:
  - a 11: perdedor **> 8** (9+). a 21: perdedor **> 15** (16+).
- Sin marcador no hay bonus (no se puede saber). En deuce cuenta el marcador real (32–30 da bonus).
- Los puntos se **calculan y guardan** al crear el partido (`winner_points`, `loser_points`),
  para que el ranking sea estable aunque cambien las reglas.

## Modelos / datos
- **Player**: `name` (único, requerido), `dominant_hand` (`right|left|ambidextrous`, requerido),
  `team` (lista fija en `Player::TEAMS`: Tecnología, Customer Success, Ventas, Onboarding, Soporte,
  Finanzas, RRHH, Revops; **opcional** en DB porque hay jugadores previos, pero el form lo exige),
  `age` (**opcional**, vive en la DB pero NO se pide en el producto), `active` (archivado).
  Borrar un jugador con partidos lo **archiva** (`active=false`); sin partidos se borra de verdad.
- **Match**: `winner`/`loser` (FK a players), `target` (11|21), `winner_score`/`loser_score`
  (opcionales, van juntos o ninguno), `winner_points`/`loser_points`, `played_at`.
  Valida: jugadores distintos, resultado completo-o-ausente, coherencia (ganador > perdedor,
  llega al target, deuce gana por 2).
  Scope `Match.between(a, b)`: partidos entre dos jugadores en cualquier orden (usado por el H2H).
- **Ranking** ([`app/models/ranking.rb`](app/models/ranking.rb)): agrega puntos/wins/PJ por jugador
  activo, ordena por `puntos ↓, wins ↓, win_rate ↓, nombre`.

## API (JSON, bajo `/api`)
- `GET /ranking` · `GET/POST/PATCH/DELETE /players` · `GET/POST/PATCH/DELETE /matches` · `POST /session`
- `GET /matches` acepta `limit` y, para el mano a mano, `player_a`/`player_b` (filtra por la pareja).
- **Auth por PIN**: escrituras requieren header `X-App-Pin` == `ENV["APP_PIN"]`. Ver ranking es público.
  `POST /session` valida el PIN para que el front lo guarde. Base: [`app/controllers/api/base_controller.rb`](app/controllers/api/base_controller.rb).
- El catch-all de rutas no-API sirve la SPA ([`SpaController`](app/controllers/spa_controller.rb)).

## Frontend (pantallas)
Mobile-first, una `app` centrada (max 560px), bottom-nav de 5 ítems.
- **Ranking** (`/`, landing): toggle **Puntos / % Victorias / Equipos**. Líder con barra superior violeta.
  En % marca "Pocos partidos" si `< 3 PJ`. **Equipos** agrupa el ranking por `team` y **suma** los puntos
  de sus integrantes (se calcula en el front desde la respuesta de `/ranking`, que ahora trae `team`).
- **Registrar** (`/registrar`): **flujo result-first**. Eliges 2 jugadores → anotas el marcador →
  el sistema **deduce el ganador** (mayor puntaje) y **preselecciona el tipo**:
  marcador más alto **≥ 21 → a 21**, si no **a 11** (editable; cubre el caso raro de un a-11 a 30–28).
  Hay un atajo opcional **"Registrar sin marcador"** (solo ganador), porque el resultado es opcional.
- **Jugadores** (`/jugadores`): crear/editar (nombre + mano hábil + equipo) / archivar. PIN para escribir.
- **Historial** (`/historial`): feed de partidos (card reutilizable [`MatchCard.jsx`](app/frontend/components/MatchCard.jsx)),
  borrar con PIN. Tocar un partido abre el **mano a mano** (`/historial/entre/:aId/:bId`,
  [`HeadToHeadPage.jsx`](app/frontend/pages/HeadToHeadPage.jsx)): dos selectores para cambiar cualquiera
  de los dos jugadores (navega con `replace`), marcador de victorias y la lista filtrada por la pareja.
- **Reglas** (`/reglas`): definición de puntajes (estática) con sección "por definir".
- **PIN**: contexto + bottom-sheet ([`auth/PinProvider.jsx`](app/frontend/auth/PinProvider.jsx)),
  guardado en `localStorage`. `ensurePin()` abre el modal si hace falta antes de una escritura.
- **Banner de temporada** ([`components/SeasonBanner.jsx`](app/frontend/components/SeasonBanner.jsx)):
  aviso dismissible arriba del contenido; expira solo por fecha y recuerda el cierre en `localStorage`
  (key con período, ej. `tazki.seasonBanner.q2-2026.dismissed`). El de cierre de Q2 expira el 26 jun 2026.

## Diseño (marca Tazki)
- Tokens en [`app/frontend/styles/tokens.css`](app/frontend/styles/tokens.css) (violeta `#6C5CFF`,
  navy `#0B1530`, neutrales, Inter). Estilos en `base.css` + `components.css`.
- **Casi plano**, hairlines, sin gradientes. Barra superior **clara** con el lockup `tazki`
  ([`app/frontend/images/tazki-logo.png`](app/frontend/images/tazki-logo.png)) — el wordmark es navy,
  por eso fondo claro.
- **Voz**: español de Chile, tutea, **sin emoji ni signos de admiración**. Números es-CL
  (`1.205`, `87,5%`, `28 abr`) en [`lib/format.js`](app/frontend/lib/format.js).
- Empty states con placeholder honesto (no inventar el SVG del pulpo; el manual lo prohíbe).
- Favicon + íconos PWA en `public/` (`icon.svg`, `apple-touch-icon.png`, `icon-192/512.png`,
  `manifest.json`). Para regenerar PNGs desde el SVG se usó `sharp` (no quedó como dependencia).

## Deploy (Render + Supabase)
- **Dominio:** producción en `https://pingpong.tazkiapp.dev` (dominio custom en Render + CNAME en
  `tazkiapp.dev`). La app es agnóstica al host (`config.hosts` está abierto), no hubo cambios de código.
- **Render**, servicio web **Docker** (no Static/Vercel/Netlify: no corren Ruby). Blueprint en
  [`render.yaml`](render.yaml). El [`Dockerfile`](Dockerfile) instala **Node** para `vite build`
  dentro de `assets:precompile`.
- En cada arranque el entrypoint corre `db:prepare` → **migra Supabase solo** (no siembra, porque la
  DB ya existe). Push a `main` ⇒ redeploy automático.
- **Variables en Render**: `DATABASE_URL`, `APP_PIN`, `RAILS_MASTER_KEY`,
  `RAILS_SERVE_STATIC_FILES=true`, `RAILS_LOG_TO_STDOUT=true`.
- **`DATABASE_URL` debe ser el "Session pooler" de Supabase** (host `...pooler.supabase.com:5432`,
  usuario `postgres.<ref>`) + `?sslmode=require`. La conexión "Direct" es **IPv6** y Render no la alcanza.
- `RAILS_MASTER_KEY` = contenido de `config/master.key` (gitignored; NO va en el repo).

## Gotchas / convenios
- No poner secretos en archivos trackeados. `.env`, `config/master.key` y los sqlite están gitignored.
- Tests usan SQLite: si seedeas la test DB para un smoke local, **púrgala** antes de correr la suite
  (`rm storage/test.sqlite3 && RAILS_ENV=test bin/rails db:migrate`) o fallan por datos residuales.
- Imports del front siempre con alias `~/...` (= `app/frontend/`).
- Al cambiar reglas de puntaje, tocar **solo** `MatchScoring` y su mirror de preview en
  [`lib/scoring.js`](app/frontend/lib/scoring.js); actualizar `test/models/match_scoring_test.rb`.
- En `base.css`, `html, body` usan `overflow-x: clip` (NO `hidden`): con `hidden` se vuelven
  contenedor de scroll y en PWA standalone rompían el scroll vertical y el `position: sticky` del appbar.
