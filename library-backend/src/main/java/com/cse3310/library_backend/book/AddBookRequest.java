package com.cse3310.library_backend.book;

public record AddBookRequest (
    String isbn,
    String title,
    String author,
    String description,
    String category,
    int quantity
)
{}
