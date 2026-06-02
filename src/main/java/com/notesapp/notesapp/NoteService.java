package com.notesapp.notesapp;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    private final UserRepository userRepository;

    // Spring injects the repository automatically via constructor injection
    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    /**
     * Returns all notes sorted by creation date, newest first.
     */
    public List<NoteResponse> getAllNotes(long userId) {
        return noteRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NoteResponse::from)
                .toList();
    }

    /**
     * Creates and persists a new note from the incoming request.
     *
     * The id and createdAt are generated inside the Note constructor and
     * by the database respectively — the caller only supplies heading/content.
     */
    public NoteResponse createNote(long userId, NoteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Note note = new Note(request.getHeading(), request.getContent(), user);
        return NoteResponse.from(noteRepository.save(note));
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
        public NoteResponse updateNote(long userId, int id, NoteUpdate request) {
        Note note = noteRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Note with id " + id + " not found"));

        if (request.getHeading() != null) note.setHeading(request.getHeading());
        if (request.getContent() != null) note.setContent(request.getContent());

        return NoteResponse.from(noteRepository.save(note));
    }

    /**
     * Deletes a note by id.
     *
     * Throws 404 if no note exists with the given id so the client
     * gets a meaningful error rather than a silent no-op.
     */
    public void deleteNote(long userId, int id) {
        if (!noteRepository.existsByIdAndUserId(id, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Note with id " + id + " not found");
        }
        noteRepository.deleteById(id);
    }
}
