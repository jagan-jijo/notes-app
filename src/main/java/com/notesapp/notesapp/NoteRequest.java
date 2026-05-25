package com.notesapp.notesapp;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * NoteRequest is a data transfer object (DTO) 
 * its job is to carry the data from an incoming HTTP request into Java code.
 *
 * @NotBlank ensures the field is present, non-null, and not just whitespace.
 * If either constraint fails, Spring returns a 400 Bad Request automatically
 * (handled by GlobalExceptionHandler) before the controller method is called.
 * this only checks heading and content and doesnt accept id or createat, hence we cant use note.java directly here.
 */
@Getter
@Setter
public class NoteRequest {

    @NotBlank(message = "must not be blank")
    private String heading;

    @NotBlank(message = "must not be blank")
    private String content;
}
