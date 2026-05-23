"""
Notes API — FastAPI Backend
Simple in-memory API using a plain Python dict for storage.
data lives in memory while the server runs.
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# In-memory store
notes_db: dict = {}
id_counter = 1 # Simple counter for generating unique IDs


# pydantic models

class NoteBase(BaseModel):
    heading: str
    content: str

class NoteResponse(NoteBase):
    id: int
    created_date: datetime

class NoteUpdate(BaseModel):
    heading: Optional[str] = None
    content: Optional[str] = None


# fastapi app base
def create_app() -> FastAPI:
    """Create and configure the FastAPI application with all routes registered."""

    app = FastAPI(
        title="Notes API",
        description="Simple in-memory notes backend.",
        version="1.0.0",
    )
    # Routes
    @app.get("/api/notes", response_model=List[NoteResponse])
    def get_notes() -> list:
        """Return all notes, newest first."""
        return sorted(notes_db.values(), key=lambda n: n["created_date"], reverse=True)


    @app.post("/api/notes", response_model=NoteResponse, status_code=201)
    def create_note(payload: NoteBase) -> dict:
        """Create a new note and return the saved record."""
        global id_counter

        note = {
            "id": id_counter,
            "heading": payload.heading,
            "content": payload.content,
            "created_date": datetime.now(tz=timezone.utc),
        }

        notes_db[id_counter] = note
        id_counter += 1

        return note

    @app.patch("/api/notes/{note_id}", response_model=NoteResponse)
    def update_note(note_id: int, payload: NoteUpdate) -> dict:
        """Partially update a note — only the fields provided are changed."""
        if note_id not in notes_db:
            raise HTTPException(status_code=404, detail="Note not found.")

        note = notes_db[note_id]

        if payload.heading is not None:
            note["heading"] = payload.heading
        if payload.content is not None:
            note["content"] = payload.content

        return note

    @app.delete("/api/notes/{note_id}", status_code=204)
    def delete_note(note_id: int) -> None:
        """Delete a note by ID. Returns 204 No Content on success."""
        if note_id not in notes_db:
            raise HTTPException(status_code=404, detail="Note not found.")

        del notes_db[note_id]

    return app
app = create_app()

