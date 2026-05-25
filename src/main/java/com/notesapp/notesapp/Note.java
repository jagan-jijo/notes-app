package com.notesapp.notesapp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Blueprint of a single note stored in the database.
 *
 * This class is a JPA entity, meaning Spring will automatically map it
 * to a database table called "note" (derived from the class name).
 */
@Entity
@Getter
@Setter
public class Note {

    /**
     * Unique identifier for each note.
     *
     * @Id marks this field as the primary key.
     * @GeneratedValue(IDENTITY) tells the database to auto-increment the id
     * so we never have to assign it manually.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;      // → column: id (auto-increment)
    private String heading;  // → column: heading
    private String content;  // → column: conten
    private Instant createdAt;  // The timestamp when the note was created.

    /**
     * No-arg constructor required by JPA.
     * JPA needs to be able to create an empty object when it loads a row
     * from the database via reflection — it fills the fields afterwards.
     */
    protected Note() {}

    /**
     * Creates a new note with the given heading and content.
     * The id is left null here — the database assigns it on save.
     */
    public Note(String heading, String content) {
        this.heading   = heading;
        this.content   = content;
        this.createdAt = Instant.now();
    }
}
