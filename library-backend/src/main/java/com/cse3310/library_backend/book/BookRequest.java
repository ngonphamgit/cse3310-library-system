package com.cse3310.library_backend.book;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "book_requests")
public class BookRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column
    private String isbn;

    @Column
    private String title;

    @Column
    private String author;

    @Column
    private String category;

    protected BookRequest() {}

    public BookRequest(Long userId, String isbn, String title, String author, String category)
    {
        this.userId = userId;
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.category = category;
    }

    public Long getUserId() {return this.userId;}
    public String getIsbn() {return this.isbn;}
    public String getTitle() {return this.title;}
    public String getAuthor() {return this.author;}
    public String getCategory() {return this.category;}
}
