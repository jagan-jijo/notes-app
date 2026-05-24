/**
 * Notes API — Spring Boot Backend
 * Simple in-memory API using a HashMap for storage.
 * Data lives in memory while the server runs.
 * Later this can be swapped out for H2 / JPA with minimal changes.
 */

package com.notesapp.notesapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;


// ── Entry point ──────────────────────────────────────────────────────────────

@SpringBootApplication
public class NotesappApplication {
    /** Starts the Spring Boot application. */
    public static void main(String[] args) {
        SpringApplication.run(NotesappApplication.class, args);
    }
}


// ── Models ───────────────────────────────────────────────────────────────────

/** Incoming payload when creating a note */
class NoteRequest {
    public String heading;
    public String content;
}

/** Incoming payload when updating a note (both fields optional) */
class NoteUpdate {
    public String heading;  // null means "do not change"
    public String content;  // null means "do not change"
}

/** The full note record stored in memory and returned in responses */
class Note {
    public int     id;
    public String  heading;
    public String  content;
    public Instant createdDate;

    public Note(int id, String heading, String content) {
        this.id          = id;
        this.heading     = heading;
        this.content     = content;
        this.createdDate = Instant.now();
    }
}


// ── Controller ───────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") // Enables calls from a frontend running on another origin/port.
class NotesController {

    // Simple in-memory store (temporary until we switch to JPA entities/repository).
    private final Map<Integer, Note> notesDb   = new LinkedHashMap<>();
    private final AtomicInteger idCounter = new AtomicInteger(1);

    /** GET /api/notes: Returns all notes, newest first. */
    @GetMapping
    public List<Note> getNotes() {
        return notesDb.values().stream()
                .sorted(Comparator.comparing((Note n) -> n.createdDate).reversed())
                .collect(Collectors.toList());
    }

    /** POST /api/notes: Creates a note and returns the saved object. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Note createNote(@RequestBody NoteRequest payload) {
        int id = idCounter.getAndIncrement();
        Note note = new Note(id, payload.heading, payload.content);
        notesDb.put(id, note);
        return note;
    }

    /** PATCH /api/notes/{id}: Updates only fields provided in the request body. */
    @PatchMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable int id, @RequestBody NoteUpdate payload) {
        Note note = notesDb.get(id);
        if (note == null) {
            return ResponseEntity.notFound().build(); // 404
        }

        if (payload.heading != null) note.heading = payload.heading;
        if (payload.content != null) note.content = payload.content;

        return ResponseEntity.ok(note); // 200
    }

    /** DELETE /api/notes/{id}: Deletes a note by id and returns 204 on success. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable int id) {
        if (!notesDb.containsKey(id)) {
            return ResponseEntity.notFound().build(); // 404
        }
        notesDb.remove(id);
        return ResponseEntity.noContent().build(); // 204
    }
}
