package com.notesapp.notesapp;

import java.time.Instant;

public record NoteResponse(
        Integer id,
        String heading,
        String content,
        Instant createdAt
) {
    static NoteResponse from(Note note) {
        return new NoteResponse(note.getId(), note.getHeading(), note.getContent(), note.getCreatedAt());
    }
}
