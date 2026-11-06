package com.cse3310.library_backend.loan;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.book.BookRepository;
import com.cse3310.library_backend.user.User;
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
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));

        //cannot have multiple loans of the same book at a time
        if (loanRepo.existsByUserIdAndBookIdAndReturnDateIsNull(user.getId(), book.getId()))
        {
             throw new ResponseStatusException(HttpStatus.CONFLICT,
        "You have already checked out this book."
    );
        }

        //later add functionality to allow user to
        //reserve unavailable books
        if (book.getQuantity() <= 0)
        {
            throw new RuntimeException("No books available");
        }

        LocalDate now = LocalDate.now();
        LocalDate dueDate = now.plusDays(14);

        Loan loan = new Loan(user, book, now, null, dueDate);
        loanRepo.save(loan);

        book.setQuantity(book.getQuantity() - 1);
        bookRepo.save(book);

        return toLoanResponse(loan);
    }

    @Transactional
    public LoanResponse returnBook(LoanReturnRequest request, Authentication auth)
    {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));

        /*
        if this fails either:
            1. the user never borrowed this book in the first place
            2. the user borrowed this book but returned it already 
                (can't return a book thats already been returned)
        */
        Loan loan = loanRepo.findByUserIdAndBookIdAndReturnDateIsNull(user.getId(), book.getId())
                    .orElseThrow(() -> new RuntimeException("Loan not found or user already returned this book"));

        loan.setReturnDate(LocalDate.now());
        loanRepo.save(loan);

        book.setQuantity(book.getQuantity() + 1);
        bookRepo.save(book);

        return toLoanResponse(loan);
    }

    private LoanResponse toLoanResponse(Loan loan)
    {
        return new LoanResponse(
            loan.getUser(),
            loan.getBook(),
            loan.getBorrowDate(),
            loan.getReturnDate(),
            loan.getDueDate()
        );
    }



    @Transactional(readOnly = true)
public List<LoanResponse> getMyLoans(Authentication auth)
{
    User user = userRepo.findByUsername(auth.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));

    List<Loan> loans = loanRepo.findAllByUserIdAndReturnDateIsNull(user.getId());

    return loans.stream()
        .map(this::toLoanResponse)
        .toList();
}















@Transactional(readOnly = true)
public List<LoanResponse> getAllActiveLoans() 
{
    return loanRepo.findAllByReturnDateIsNull()
        .stream()
        .map(this::toLoanResponse)
        .toList();
}
}

