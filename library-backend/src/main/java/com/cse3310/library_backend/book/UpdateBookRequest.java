package com.cse3310.library_backend.book;

public record UpdateBookRequest(
    Long bookId,
    String title,
    String author,
    String description,
    String category,
    int quantity,
    boolean isActive
)
{}
