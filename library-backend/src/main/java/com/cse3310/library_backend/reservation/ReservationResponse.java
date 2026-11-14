package com.cse3310.library_backend.reservation;

import java.time.LocalDateTime;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.user.User;

public record ReservationResponse (
    Long reservationId,
    User user,
    Book book,
    LocalDateTime reservedAt,
    ReservationStatus status
)
{}
