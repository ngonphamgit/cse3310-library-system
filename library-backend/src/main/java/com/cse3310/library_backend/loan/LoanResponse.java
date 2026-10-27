package com.cse3310.library_backend.loan;

import java.time.LocalDate;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.user.User;

public record LoanResponse (
    User user,
    Book book,
    LocalDate borrowDate,
    LocalDate returnDate,
    LocalDate dueDate
)
{}
