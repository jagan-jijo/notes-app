package com.notesapp.notesapp;

public record AuthResponse(
        String token,
        String email
) {}
