package com.notesapp.notesapp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for Note entities.
 *
 * By extending JpaRepository, Spring automatically provides implementations
 * for common database operations: findAll, findById, save, deleteById, etc.
 * We don't need to write any SQL or boilerplate code for standard CRUD.
 *
 * The two type parameters are:
 *   - Note:    the entity this repository manages
 *   - Integer: the type of Note's primary key (@Id field)
 * 
 * NoteService calls:
 * noteRepository.save(note)
            ↓
*   Spring Data JPA generates:
*   INSERT INTO note (...) VALUES (...)
            ↓
 *  Hibernate translates it for H2's dialect
            ↓
 *  H2 executes it and stores the row in memory
            ↓
 *  Returns the saved Note with the generated id filled in
 */
public interface NoteRepository extends JpaRepository<Note, Integer> {
    List<Note> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Note> findByIdAndUserId(Integer id, Long userId);
    boolean existsByIdAndUserId(Integer id, Long userId);
}


