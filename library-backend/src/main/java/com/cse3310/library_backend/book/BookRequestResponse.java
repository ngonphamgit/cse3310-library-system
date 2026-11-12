package com.cse3310.library_backend.book;

public record BookRequestResponse(
    Long userId,
    String isbn,
    String title,
    String author,
    String category
) {
    
}
