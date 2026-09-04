# CampusOS

An intelligent university platform for AUST — a dashboard over the five campus
systems (class schedule, rooms, events, announcements, assignments) with a
Gemini-powered agent sitting on top of it that reads live data and can act on it.

---

## Project Overview

CampusOS puts a student's scattered campus information in one place and lets
them just ask for it. The React dashboard shows all five campus systems, and the
prompt bar on the dashboard talks to an AI agent running on the backend. The
agent uses **real Gemini function calling** — it is given a set of tools rather
than a copy of the data, so every question triggers fresh SQL against
PostgreSQL. That means an edit made a second ago is what the agent sees; nothing
is cached and no campus data is ever baked into the prompt. Beyond answering, it
can take action — booking a room or registering the signed-in user for an event
— and it is built to stop and ask when a request is vague, and to refuse when it
is asked to do something it should not.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Backend | Node.js (ESM), Express 4 |
| Database | PostgreSQL 17, accessed through Prisma 5 |
| LLM | Google Gemini via `@google/genai` (default `gemini-3.6-flash`) |
| Language | JavaScript throughout |

---

## Setup

**Prerequisites:** Node.js 20+, a running PostgreSQL 17 server, and a Gemini API
key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 1. Create the database

```bash
createdb campusos
```

Or from `psql`:

```sql
CREATE DATABASE campusos;
```

### 2. Backend

```bash
cd BACKEND
npm install

cp .env.example .env      # then edit .env — see Environment Variables below

npx prisma db push        # creates the 7 tables from prisma/schema.prisma
npm run seed              # loads the seed JSON into PostgreSQL
npm start                 # http://localhost:3000
```

`npm run seed` prints the row counts it inserted. Expect:
`schedules: 24, rooms: 20, events: 7, announcements: 8, assignments: 8`.

### 3. Frontend

In a second terminal:

```bash
cd FRONTEND/CampusOS
npm install

cp .env.example .env      # the default already points at localhost:3000

npm run dev               # http://localhost:5173
```

Open http://localhost:5173. The prompt bar sits on the dashboard; the badge in
its top-right reads **Live** when the backend endpoint is configured.

---

## Environment Variables

### `BACKEND/.env`

| Key | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | `postgresql://USER:PASSWORD@localhost:5432/campusos` |
| `GEMINI_API_KEY` | yes | Google AI Studio key. Without it the API still runs, but `/api/agent` returns 503. |
| `GEMINI_MODEL` | no | Defaults to `gemini-3.6-flash`. See the note on quotas below. |
| `PORT` | no | Defaults to `3000`. |

### `FRONTEND/CampusOS/.env`

| Key | Required | Description |
|---|---|---|
| `VITE_AGENT_ENDPOINT` | yes | `http://localhost:3000/api/agent`. If unset, the prompt bar runs in an offline demo mode and says so instead of inventing answers. |

Both `.env` files are gitignored. `.env.example` is committed in each folder —
**no real keys are in this repository.**

> **Gemini free-tier quota.** The free tier allows roughly 20 requests per day
> *per model*, and one question costs 2–3 calls because each tool round-trip is
> its own request. That works out to about 7 questions per model per day. If you
> hit a 429, either switch `GEMINI_MODEL` to another model (each has its own
> quota) or enable billing on the Google Cloud project.

---

## How to Use the Agent

Ask in the prompt bar on the dashboard. It handles four kinds of request:

**Looking things up**
- "When is my next class?"
- "What classes do I have on Wednesday?"
- "What assignments do I have due this week?"
- "Show me all high priority announcements."

**Reasoning across several systems**
- "I'm free until 2 PM — is there anything on campus I could drop into?"
- "Which labs have a projector and can fit at least 30 people?"

Asking where a class is checks the timetable *and* announcements, because a
notice may have moved it — a recent announcement wins, and the agent says so.

**Taking action**
- "Book Room 7A02 tomorrow from 3 PM to 5 PM."
- "Register me for the Guest Lecture on Deep Learning."

A completed action is confirmed with a green **Done** chip in the reply.

**Being vague, or asking for too much**
- "Just book me any room tomorrow afternoon." → it asks which room and what
  time rather than guessing, and books nothing.
- "Cancel someone else's booking" / "change my marks" → it declines.

Replies are tagged in the UI: **Needs detail** when it wants more information,
**Declined** when it refuses, plus "Read from" chips showing which systems it
consulted.

---

## How the Agent Works

Everything lives in `BACKEND/src/agent/`:

| File | Role |
|---|---|
| `tools.js` | Tool declarations and their Prisma implementations |
| `systemPrompt.js` | System instruction, rebuilt per request with today's date and the signed-in user |
| `agentService.js` | The function-calling loop |

Gemini is given eleven tools. Nine touch the database — six read
(`list_schedules`, `list_rooms`, `find_free_rooms`, `list_events`,
`list_announcements`, `list_assignments`) and three write (`book_room`,
`register_for_event`, `cancel_booking`). The remaining two,
`ask_clarifying_question` and `decline_request`, let the model signal
"I need more information" or "I won't do this" as an explicit, testable decision
rather than as prose we would have to guess at.

`find_free_rooms` checks existing bookings **and** the class timetable, so the
agent will not offer a room that has a lecture in it.

**Safety is structural, not just prompt text.** There is no tool to delete
records, change marks, or act for another student, so the model cannot do those
things however it is asked. On top of that the write tools enforce their own
rules in code: you may only cancel your own booking, actions require a signed-in
user, and double-bookings, past dates, full events and malformed input are all
rejected before anything is written.

---

## API

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/agent` | Ask the agent. Body: `{ question, history, user }` |
| `GET` | `/api/agent/status` | Whether a key is configured, and the active model |
| `GET` | `/api/health` | Health check |
| — | `/api/schedules`, `/api/rooms`, `/api/events`, `/api/announcements`, `/api/assignments` | Full CRUD per system |

Every response uses the same envelope: `{ status, success, data, info }`.

---

## Repository Structure

```
├── BACKEND/
│   ├── prisma/schema.prisma      # 7 models: Schedule, Room, RoomBooking,
│   │                             # Event, EventRegistration, Announcement, Assignment
│   └── src/
│       ├── agent/                # Gemini tools, prompt, function-calling loop
│       ├── controllers/ services/ models/ routes/
│       ├── db/                   # Prisma client + seed script
│       └── server.js
│
└── FRONTEND/CampusOS/
    └── src/
        ├── Components/           # Layout, Sidebar, Topbar, PromptBar
        ├── Pages/                # Dashboard + the five systems
        ├── data/                 # Seed JSON
        └── lib/                  # campusAgent.js — the single seam to the backend
```

---

## Current Status

Working end to end: the PostgreSQL database and seed, the REST API for all five
systems, and the Gemini agent — answering, acting, asking when unclear, and
refusing when it should.

Known gaps, stated plainly rather than discovered while marking:

- **The dashboard pages read the seed JSON directly, not the API.** All five
  sections render, but they are not yet wired to the backend, so a change made
  through the API will not appear on the page until it is reloaded from the
  database.
- **No add / edit / delete UI.** The REST endpoints exist and work, but the
  dashboard has no forms to drive them; mutations currently need the API
  directly (or the agent, for booking and registration).
- Authentication is a local-storage stub, not real auth.

---

## Troubleshooting

**`npm run seed` reports it cannot find a seed file** — it looks in
`data/` and `FRONTEND/CampusOS/src/data/` and prints both paths. Run it from
inside `BACKEND/`.

**Agent replies with a 503** — `GEMINI_API_KEY` is missing from `BACKEND/.env`.
Check `GET /api/agent/status`.

**Agent replies with a 429** — the free-tier daily quota is spent. Switch
`GEMINI_MODEL` or enable billing.

**Prompt bar says "Not connected"** — `VITE_AGENT_ENDPOINT` is unset in
`FRONTEND/CampusOS/.env`. Vite only reads `.env` at startup, so restart
`npm run dev` after changing it.
