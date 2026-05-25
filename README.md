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

### Option 2 — run backend and frontend separately

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

## API endpoints

| Method   | Endpoint            | Description   |
|----------|---------------------|---------------|
| GET      | `/api/notes`        | Get all notes |
| POST     | `/api/notes`        | Create a note |
| PATCH    | `/api/notes/{id}`   | Update a note |
| DELETE   | `/api/notes/{id}`   | Delete a note |

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
