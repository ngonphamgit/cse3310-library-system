package com.cse3310.library_backend.book;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    //default lets hibernate add this column to a table that already has rows
    @Column(nullable = false, columnDefinition = "varchar(20) default 'PENDING'")
    @Enumerated(EnumType.STRING)
    private BookRequestStatus status;

    @Column
    private LocalDateTime createdAt;

    //id of the catalog book created when the request was approved
    @Column
    private Long bookId;

    protected BookRequest() {}

    public BookRequest(Long userId, String isbn, String title, String author, String category)
    {
        this.userId = userId;
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.category = category;
        this.status = BookRequestStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {return this.id;}
    public Long getUserId() {return this.userId;}
    public String getIsbn() {return this.isbn;}
    public String getTitle() {return this.title;}
    public String getAuthor() {return this.author;}
    public String getCategory() {return this.category;}
    public BookRequestStatus getStatus() {return this.status;}
    public LocalDateTime getCreatedAt() {return this.createdAt;}
    public Long getBookId() {return this.bookId;}

    public void setIsbn(String isbn) {this.isbn = isbn;}
    public void setTitle(String title) {this.title = title;}
    public void setAuthor(String author) {this.author = author;}
    public void setCategory(String category) {this.category = category;}
    public void setStatus(BookRequestStatus status) {this.status = status;}
    public void setBookId(Long bookId) {this.bookId = bookId;}
}
