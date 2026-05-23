# Entry-Level Full Stack Technical Test

| | |
|---|---|
| **Frontend** | React + Vite |
| **Backend** | Spring Boot + H2 Database |
| **Estimated time** | 2–4 hours |

## Objective

Build a simple **Notes** application consisting of:

- A single-page React application
- A Spring Boot REST API
- A simple H2 in-memory database
- CRUD operations for notes

The goal is to assess:

- Basic frontend development skills
- API development fundamentals
- Understanding of REST principles
- Ability to structure a small full-stack application
- Basic state management and data persistence

## Requirements

### Frontend Requirements

Create a React application using:

- Vite
- React

The application should contain:

#### Single Page Layout

The page should include:

- A heading/title
- A list of notes
- An **Add Note** button

#### Notes List

Each note should display:

- Note heading/title
- Note content
- Created date
- Edit icon/button
- Delete icon/button

#### Add Note Modal

When the user clicks **Add Note**:

- A modal/dialog should open allowing the user to enter:
  - Note heading
  - Note content

Submitting the form should:

- Send the data to the backend API
- Refresh/update the note list

#### Edit Note

The user should be able to:

- Edit an existing note
- Save the updated note using the API

#### Delete Note

The user should be able to:

- Delete a note from the list
- See the frontend update after deletion

### Backend Requirements

Create a Spring Boot application using:

- Spring Boot
- Spring Initializr
- H2 Database

Use [Spring Initializr](https://start.spring.io/) to generate the project.

#### Required Dependencies

Suggested dependencies:

- Spring Web
- Spring Data JPA
- H2 Database
- Lombok (optional)
- Swagger (optional bonus)
- Spring Security (optional bonus)

#### Data Model

Suggested **Note** entity:

| Field | |
|---|---|
| `id` | |
| `heading` | |
| `content` | |
| `createdDate` | |

#### API Requirements

Implement the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | Get all notes |
| `POST` | `/api/notes` | Create note |
| `PATCH` | `/api/notes/{id}` | Update note |
| `DELETE` | `/api/notes/{id}` | Delete note |

#### Database

Use:

- H2 in-memory database
- JPA/Hibernate for persistence

No external database setup should be required.

#### Suggested API Behaviour — Create Note

The backend should:

- Receive heading/content
- Generate/store:
  - ID
  - Created date/time

## Technical Expectations

### Frontend

Candidates should demonstrate:

- Basic React component structure
- State management using hooks
- API communication using `fetch` or `axios`
- Basic modal implementation
- Simple styling/layout

### Backend

Candidates should demonstrate:

- REST controller creation
- Service/repository structure
- JPA entity setup
- Basic validation and error handling
- Proper HTTP status codes

## Bonus Tasks (Optional)

### Authentication

Implement basic authentication using **Spring Security Basic Auth**.

Protect the following endpoints:

- `POST`
- `PATCH`
- `DELETE`

`GET` requests may remain public.

### Additional Bonus Ideas

Optional enhancements:

- Loading indicators
- Form validation
- Confirmation before delete
- Responsive styling
- Search/filter notes
- Unit tests
- linking notes to creator
- Docker setup

## Deliverables

The candidate should provide:

- Source code repository
- README with setup instructions
- Screenshots (optional)

### Expected Setup Instructions

The README should explain:

**Frontend**

```bash
npm install
npm run dev
```

**Backend**

```bash
./mvnw spring-boot:run
```

## Evaluation Criteria

| Area | What We Look For |
|------|------------------|
| Code Structure | Clear and maintainable code |
| React Fundamentals | Components, hooks, state |
| API Design | RESTful endpoints |
| Java/Spring Knowledge | Controllers, services, JPA |
| Database Usage | Proper entity persistence |
| Problem Solving | Working end-to-end solution |
| UX | Clean/simple user experience |
| Bonus | Security implementation |

## Suggested Tech Stack Versions

| Technology | Suggested Version |
|------------|-------------------|
| Java | 17+ |
| Spring Boot | 3.x |
| Node.js | Latest LTS |
| React | 18+ |

## Notes

The emphasis is on:

- Clean working functionality
- Readable code
- Simplicity over over-engineering
