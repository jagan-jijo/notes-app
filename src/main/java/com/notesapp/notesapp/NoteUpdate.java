package com.notesapp.notesapp;

import lombok.Getter;
import lombok.Setter;

/**
 * The JSON body we expect when a client updates an existing note.
 *
 * Both fields are optional — if a field is not sent in the request,
 * Jackson leaves it as null, and the controller knows to skip updating
 * that field. This allows partial updates (PATCH semantics).
 */
@Getter
@Setter
public class NoteUpdate {

    // null means the client did not send this field — leave it unchanged
    private String heading;

    // null means the client did not send this field — leave it unchanged
    private String content;
}
