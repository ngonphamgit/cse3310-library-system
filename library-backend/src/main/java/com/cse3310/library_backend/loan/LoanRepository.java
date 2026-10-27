package com.cse3310.library_backend.loan;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<Loan, Long>
{
    boolean existsByUserIdAndBookIdAndReturnDateIsNull(Long userId, Long bookId);
    Optional<Loan> findByUserIdAndBookIdAndReturnDateIsNull(Long userId, Long bookId);
}
