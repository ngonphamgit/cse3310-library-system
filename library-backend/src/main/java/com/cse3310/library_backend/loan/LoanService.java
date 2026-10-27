package com.cse3310.library_backend.loan;

import java.time.LocalDate;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.book.BookRepository;
import com.cse3310.library_backend.security.CustomUserDetails;
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

        //one user can only borrow one unique book at a time
        if (loanRepo.existsByUserIdAndBookId(user.getId(), book.getId()))
        {
            throw new RuntimeException("Book is already loaned for this user");
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

        user.addLoan(loan);
        userRepo.save(user);

        book.setQuantity(book.getQuantity() - 1);
        bookRepo.save(book);

        return toLoanResponse(loan);
    }

    @Transactional
    public LoanResponse returnBook(LoanReturnRequest request, Authentication auth)
    {
        return null;
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
}
