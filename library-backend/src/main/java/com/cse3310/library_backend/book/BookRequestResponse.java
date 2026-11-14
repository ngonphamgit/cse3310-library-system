package com.cse3310.library_backend.book;

import java.time.LocalDateTime;

public record BookRequestResponse(
    Long id,
    Long userId,
    String isbn,
    String title,
    String author,
    String category,
    BookRequestStatus status,
    LocalDateTime createdAt,
    Long bookId
) {
    
}
