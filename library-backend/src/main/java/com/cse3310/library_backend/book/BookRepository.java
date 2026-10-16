package com.cse3310.library_backend.book;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookRepository extends JpaRepository<Book, Long>
{
    Optional<Book> findById(Long id);

    @Query(value =
            "SELECT * " +
            "FROM books " +
            "WHERE to_tsvector('simple', title) @@ plainto_tsquery('simple', :query) " +
            "ORDER BY ts_rank(to_tsvector('simple', title), plainto_tsquery('simple', :query)) DESC",
            countQuery =
            "SELECT count(*) " +
            "FROM books " +
            "WHERE to_tsvector('simple', title) @@ plainto_tsquery('simple', :query)",
            nativeQuery = true
    )
    Page<Book> findAllByTitle(String query, Pageable pageable);

    @Query(value =
            "SELECT * " +
            "FROM books " +
            "WHERE to_tsvector('simple', author) @@ plainto_tsquery('simple', :query) " +
            "ORDER BY ts_rank(to_tsvector('simple', author), plainto_tsquery('simple', :query)) DESC",
            countQuery =
            "SELECT count(*) " +
            "FROM books " +
            "WHERE to_tsvector('simple', author) @@ plainto_tsquery('simple', :query)",
            nativeQuery = true
    )
    Page<Book> findAllByAuthor(String query, Pageable pageable);

    @Query(value =
            "SELECT * " +
            "FROM books " +
            "WHERE to_tsvector('simple', category) @@ plainto_tsquery('simple', :query) " +
            "ORDER BY ts_rank(to_tsvector('simple', category), plainto_tsquery('simple', :query)) DESC",
            countQuery =
            "SELECT count(*) " +
            "FROM books " +
            "WHERE to_tsvector('simple', category) @@ plainto_tsquery('simple', :query)",
            nativeQuery = true
    )
    Page<Book> findAllByCategory(String query, Pageable pageable);
}
