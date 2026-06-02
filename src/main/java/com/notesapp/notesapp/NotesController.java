package com.notesapp.notesapp;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the /api/notes endpoints.
 *
 * This class is intentionally thin — its only responsibilities are:
 *   1. Map HTTP requests to service method calls.
 *   2. Return the appropriate HTTP response.
 *
 * All business logic (sorting, partial updates, existence checks) lives
 * in NoteService, keeping this class easy to read and test in isolation.
 */
@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NotesController {

    private final NoteService noteService;
    
    public NotesController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> getNotes(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return noteService.getAllNotes(userId(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse createNote(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt,
                                   @Valid @RequestBody NoteRequest request) {
        // @Valid triggers constraint checks on NoteRequest before this runs.
        // If validation fails, GlobalExceptionHandler returns a 400 instead.
        return noteService.createNote(userId(jwt), request);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(@PathVariable int id,
                                           @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt,
                                           @RequestBody NoteUpdate request) {
        return ResponseEntity.ok(noteService.updateNote(userId(jwt), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable int id,
                                           @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        noteService.deleteNote(userId(jwt), id);
        return ResponseEntity.noContent().build();
    }

    private static long userId(Jwt jwt) {
        String uid = jwt.getClaimAsString("uid");
        if (uid == null) throw new IllegalStateException("Missing uid claim");
        return Long.parseLong(uid);
    }
}
