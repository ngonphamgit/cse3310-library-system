package com.cse3310.library_backend.book;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table (name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    @Column(nullable = false, unique = true)
    private String isbn;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private int quantity;

    @Column
    private boolean isActive;

    protected Book() {}

    public Book(String isbn, String title, String author, String description, String category, int quantity, boolean isActive)
    {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.description = description;
        this.category = category;
        this.quantity = quantity;
        this.isActive = true;
    }

    public Long getId() {return this.bookId;}
    public String getIsbn() {return this.isbn;}
    public String getTitle() {return this.title;}
    public String getAuthor() {return this.author;}
    public String getDescription() {return this.description;}
    public String getCategory() {return this.category;}
    public int getQuantity() {return this.quantity;}
    public boolean getIsActive() {return this.isActive;}

    public void setIsActive(boolean isActive) {this.isActive = isActive;}
}
