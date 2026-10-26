package com.cse3310.library_backend.loan;

import java.time.LocalDate;

import com.cse3310.library_backend.user.User;

public record LoanResponse (
    User user,
    Loan loan,
    LocalDate borrowDate,
    LocalDate returnDate,
    LocalDate dueDate
)
{}
