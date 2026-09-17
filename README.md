# Task API

A beginner friendly RESTful CRUD API for making a to-do list, made with Node.js and Express.
Task from the FlyRank Backend Internship (Week 2).

## What it does

Exposes five endpoints to create, read, update, and delete tasks. Data is stored
in a SQLite database (`tasks.db`), so it survives server restarts. Interactive
documentation is available at `/docs` via Swagger UI.

## Requirements

- Node.js 18 or newer
- npm

## Run it

```bash
npm install
node index.js
```

The server starts on `http://localhost:3000`.

Swagger UI: `http://localhost:3000/docs`

## Endpoints

| Method | Path          | Description        | Success | Errors       |
|--------|---------------|--------------------|---------|--------------|
| GET    | /             | API info           | 200     | —            |
| GET    | /health       | Health check       | 200     | —            |
| GET    | /tasks        | List all tasks     | 200     | —            |
| GET    | /tasks/:id    | Get one task       | 200     | 404          |
| POST   | /tasks        | Create a task      | 201     | 400          |
| PUT    | /tasks/:id    | Update a task      | 200     | 400, 404     |
| DELETE | /tasks/:id    | Delete a task      | 204     | 404          |

## Example request

GET /tasks HTTP/1.1
Host: localhost:3000

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
{ "id": 6, "title": "Learn Express", "done": 0 },
{ "id": 7, "title": "Build CRUD API", "done": 0 },
{ "id": 8, "title": "Push to Github", "done": 0 },
{ "id": 9, "title": "Adding Database", "done": 0 },
{ "id": 10, "title": "Trying another task", "done": 0 },
{ "id": 12, "title": "Attempt 3", "done": 1 }
]

## Swagger UI

![Swagger UI screenshot](./swagger.png)


## Notes

Tasks are persisted in SQLite, so they survive server restarts. In Assignment 1
this data lived only in memory and reset on every restart — moving the storage
layer to a database is the whole point of this assignment, and none of the
endpoints had to change.



## Example SQL

Run against `tasks.db` in DB Browser for SQLite:

```sql
SELECT * FROM tasks WHERE done = 1;
```

Returns only the tasks marked as completed. Right after a fresh start all three
seeded tasks have `done = 0`, so this returns no rows until a task is updated
through `PUT /tasks/:id`.

## What it does

Exposes five endpoints to create, read, update, and delete tasks. Data is stored
in a SQLite database (`tasks.db`), so it survives server restarts. Interactive
documentation is available at `/docs` via Swagger UI.


## Storage

Tasks are stored in a SQLite database (`tasks.db`) instead of in memory.
SQLite was chosen because it needs no separate server, lives in a single file,
requires zero configuration, and the data survives a server restart.

The database file is created automatically on first run, along with the
`tasks` table and three example tasks. It is git-ignored, so a fresh clone
starts with a clean database.


## Author

<Baris Arda Tekin> — FlyRank Backend AI Engineering Intern, Week 3


