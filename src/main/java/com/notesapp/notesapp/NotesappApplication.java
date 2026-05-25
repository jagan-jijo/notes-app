package com.notesapp.notesapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// Main java applciation entry point called wiht mwnw spring boot: run 
// Starts the embedded Tomcat web server (on port 8000)
// Connects to H2 and creates the note table from Note.java
// Wires all your beans together (NoteService gets NoteRepository injected, NotesController gets NoteService injected, etc.)
// Registers your REST endpoints so they're ready to receive requests
@SpringBootApplication
public class NotesappApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotesappApplication.class, args);
    }
}