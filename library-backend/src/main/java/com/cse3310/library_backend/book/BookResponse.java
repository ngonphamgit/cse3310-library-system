package com.cse3310.library_backend.book;

public record BookResponse(
    Long bookId,
    String isbn,
    String title,
    String author,
    String description,
    String category,
    int quantity
) 
{}
