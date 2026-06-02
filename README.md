# Notes App

A simple full-stack notes application. Create, view, edit and delete notes from a clean single-page UI.

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19 + Vite                     |
| Backend  | Spring Boot + Spring Data JPA       |
| Database | H2 in-memory (no setup required)    |

---

## How to run

### Option 1 — Docker (no local Java or Node required)

```bash
docker compose up --build
```

- Frontend: `http://localhost`
- Backend: `http://localhost:8000`

To stop: `docker compose down`

---

### Option 2 — start everything with one command

```bash
./start.sh
```

The script will:
- Check that Java and Node.js are installed
- Install frontend `node_modules` automatically if missing
- Start the backend on `http://localhost:8000`
- Start the frontend on `http://localhost:5173`

Press `Ctrl+C` to stop both servers.

---

### Option 3 — run backend and frontend separately

**Backend**
```bash
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## What it does

- **View notes** — all notes are listed on the dashboard, newest first
- **Add note** — click `+ Add Note`, fill in a heading and content, click Save
- **Edit note** — click a note card to select it, then click Edit
- **Delete note** — click a note card to select it, then click Delete (asks for confirmation)

---

## Authentication (JWT) + temp vs saved notes

This app supports two modes:

- **Signed out (guest)**: notes are **temporary** and stored only in the browser (frontend uses `localStorage`).
- **Signed in**: notes are **saved** in the backend database and scoped to the signed-in user.

### How auth works

- The backend exposes auth endpoints under `/api/auth`.
- On success, the backend returns a **JWT access token**.
- The frontend includes that token on API requests using:

	`Authorization: Bearer <token>`

All notes endpoints (`/api/notes/**`) require a valid token.

### JWT details (dev)

- Algorithm: **HS256** (HMAC)
- Config: `app.security.jwt.secret` in [src/main/resources/application.yaml](src/main/resources/application.yaml)
- Token expiry: **7 days**
- Claims:
	- `sub` = user email
	- `uid` = user id

For production, provide the secret via environment variables / secret manager and rotate it as needed.

---

## API endpoints

| Method   | Endpoint            | Description   |
|----------|---------------------|---------------|
| POST     | `/api/auth/register`| Register user (returns JWT) |
| POST     | `/api/auth/login`   | Login user (returns JWT) |
| GET      | `/api/notes`        | Get saved notes (auth required) |
| POST     | `/api/notes`        | Create saved note (auth required) |
| PATCH    | `/api/notes/{id}`   | Update saved note (auth required) |
| DELETE   | `/api/notes/{id}`   | Delete saved note (auth required) |

### Example: register + use token

```bash
# Register
curl -s -X POST http://localhost:8000/api/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"email":"demo@example.com","password":"demo1234"}'

# Response: {"token":"...","email":"demo@example.com"}

# Use the token to call notes
TOKEN="<paste token here>"
curl -s http://localhost:8000/api/notes \
	-H "Authorization: Bearer $TOKEN"
```

### Example: create a saved note (auth required)

```bash
TOKEN="<paste token here>"
curl -s -X POST http://localhost:8000/api/notes \
	-H 'Content-Type: application/json' \
	-H "Authorization: Bearer $TOKEN" \
	-d '{"heading":"Hello","content":"This is saved to my account"}'
```

---

## H2 database console

The in-memory H2 console is available while the backend is running:

```
http://localhost:8000/h2-console
```

- JDBC URL: `jdbc:h2:mem:notesdb`
- Username: `sa`
- Password: *(leave blank)*

---

## Requirements

- Java 21+
- Node.js (latest LTS) + npm

---

Created by Jagan Jijo — [Portfolio](https://jagan-jijo.github.io/portfolio/) · [LinkedIn](https://www.linkedin.com/in/jagan-jijo/)
