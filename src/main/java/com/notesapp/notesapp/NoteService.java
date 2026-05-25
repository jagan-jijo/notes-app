package com.notesapp.notesapp;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

/**
 * Service layer for note operations.
 *
 * The service sits between the controller and the repository.
 * - The controller's job is HTTP: parse requests, return responses.
 * - The service's job is business logic: rules, transformations, decisions.
 * - The repository's job is data access: read/write the database.
 *
 * Keeping these responsibilities separate makes the code easier to test,
 * easier to read, and easier to change independently.
 */
@Service
public class NoteService {

    private final NoteRepository noteRepository;

    // Spring injects the repository automatically via constructor injection
    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    /**
     * Returns all notes sorted by creation date, newest first.
     */
    public List<Note> getAllNotes() {
        return noteRepository.findAll().stream()
                .sorted(Comparator.comparing(Note::getCreatedAt).reversed())
                .toList();
    }

    /**
     * Creates and persists a new note from the incoming request.
     *
     * The id and createdAt are generated inside the Note constructor and
     * by the database respectively — the caller only supplies heading/content.
     */
    public Note createNote(NoteRequest request) {
        Note note = new Note(request.getHeading(), request.getContent());
        return noteRepository.save(note);
    }

    /**
     * Partially updates an existing note (PATCH semantics).
     *
     * Only fields that are non-null in the request are updated.
     * This lets clients send just the field they want to change
     * without overwriting the other field with null.
     *
     * Throws 404 if no note exists with the given id.
     */
    public Note updateNote(int id, NoteUpdate request) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Note with id " + id + " not found"));

        if (request.getHeading() != null) note.setHeading(request.getHeading());
        if (request.getContent() != null) note.setContent(request.getContent());

        return noteRepository.save(note);
    }

    /**
     * Deletes a note by id.
     *
     * Throws 404 if no note exists with the given id so the client
     * gets a meaningful error rather than a silent no-op.
     */
    public void deleteNote(int id) {
        if (!noteRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Note with id " + id + " not found");
        }
        noteRepository.deleteById(id);
    }
}
