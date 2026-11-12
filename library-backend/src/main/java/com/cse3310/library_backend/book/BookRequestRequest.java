package com.cse3310.library_backend.book;

public record BookRequestRequest(
    String isbn,
    String title,
    String author,
    String category
) {
    
}
