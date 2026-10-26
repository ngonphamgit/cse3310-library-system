package com.cse3310.library_backend.loan;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cse3310.library_backend.book.BookRepository;
import com.cse3310.library_backend.user.UserRepository;

@Service
public class LoanService 
{
    private final LoanRepository loanRepo;
    private final UserRepository userRepo;
    private final BookRepository bookRepo;

    public LoanService(LoanRepository loanRepo, UserRepository userRepo, BookRepository bookRepo)
    {
        this.loanRepo = loanRepo;
        this.userRepo = userRepo;
        this.bookRepo = bookRepo;
    }

    @Transactional
    public LoanResponse checkoutBook(LoanCheckoutRequest request, Authentication auth)
    {
        return null;
    }

    @Transactional
    public LoanResponse returnBook(LoanReturnRequest request, Authentication auth)
    {
        return null;
    }
}
