package com.notesapp.notesapp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

/**
 * Centralised error handling for all controllers.
 *
 * Without this, a validation failure (@NotBlank etc.) would return a
 * generic 400 with a large Spring error object that exposes internal details.
 * This handler intercepts those exceptions and returns a clean, consistent
 * JSON response that is useful to the client without leaking internals.
 *
 * Example response body:
 * {
 *   "errors": ["heading must not be blank", "content must not be blank"]
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation failures triggered by @Valid on request bodies.
     *
     * Spring collects every violated constraint into a
     * MethodArgumentNotValidException. We extract the human-readable
     * default messages from each field error and return them as a list.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidationErrors(MethodArgumentNotValidException exception) {
        List<String> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(field -> field.getField() + " " + field.getDefaultMessage())
                .toList();

        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }
}
