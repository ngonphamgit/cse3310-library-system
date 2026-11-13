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
import com.cse3310.library_backend.reservation.Reservation;
import com.cse3310.library_backend.reservation.ReservationRepository;
import com.cse3310.library_backend.reservation.ReservationService;
import com.cse3310.library_backend.reservation.ReservationStatus;
import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@Service
public class LoanService 
{
    private final LoanRepository loanRepo;
    private final UserRepository userRepo;
    private final BookRepository bookRepo;
    private final ReservationRepository reservationRepo;

    public LoanService(LoanRepository loanRepo, UserRepository userRepo, BookRepository bookRepo, ReservationRepository reservationRepo)
    {
        this.loanRepo = loanRepo;
        this.userRepo = userRepo;
        this.bookRepo = bookRepo;
        this.reservationRepo = reservationRepo;
    }

    @Transactional
    public LoanResponse checkoutBookFromReservation(User user, Book book)
    {
        //cannot have multiple loans of the same book at a time
        if (loanRepo.existsByUserIdAndBookIdAndReturnDateIsNull(user.getId(), book.getId()))
        {
             throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already checked out this book.");
        }

        LocalDate now = LocalDate.now();
        LocalDate dueDate = now.plusDays(14);

        Loan loan = new Loan(user, book, now, null, dueDate);
        loanRepo.save(loan);

        return toLoanResponse(loan);
    }

    @Transactional
    public LoanResponse checkoutBook(LoanCheckoutRequest request, Authentication auth)
    {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));

        if (user.getIsBlocked())
        {
            throw new RuntimeException("You are currently blocked from checking out books");
        }

        //cannot have multiple loans of the same book at a time
        if (loanRepo.existsByUserIdAndBookIdAndReturnDateIsNull(user.getId(), book.getId()))
        {
             throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already checked out this book.");
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

        //notify next user in reservation queue that a copy has become available
        List<Reservation> reservations = reservationRepo.findAllByBookIdAndStatusOrderByReservedAtAsc(book.getBookId(), ReservationStatus.ACTIVE);
        if (book.getQuantity() == 0 && !reservations.isEmpty())
        {
            Reservation firstReservation = reservations.get(0);
            firstReservation.setStatus(ReservationStatus.READY);
            reservationRepo.save(firstReservation);
        }
        else
        {
            book.setQuantity(book.getQuantity() + 1);
        }
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






    //get all loans for the logged in user, including returned books
     @Transactional(readOnly = true)
    public List<LoanResponse> getCurrentandPastLoans(Authentication auth)
    {
        //get the logged in user
         User user = userRepo.findByUsername(auth.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));

         //get all of users checkout history, including returned books
         List<Loan> loans = loanRepo.findAllByUser(user);


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





    @Transactional(readOnly = true)
public List<Book> getRecommendations(Authentication auth)
{
    //get the logged in user
    User user = userRepo.findByUsername(auth.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));

    //get all of users checkout history, including returned books
    List<Loan> loans = loanRepo.findAllByUser(user);


    //Get book ids for books previously checked out (for duplicate filtering)
    List<Long> checkedOutBookIds = loans.stream()
        .map(loan -> loan.getBook().getId())
        .distinct()
        .toList();


    //collect the author names of the books they have checked out
    List<String> authors = loans.stream()
        .map(loan -> loan.getBook().getAuthor())
        .filter(author -> author != null && !author.isBlank())
        .distinct()
        .toList();

    //if there is no checkout history return nothing
    if (authors.isEmpty())
    {
        return List.of();
    }

    //find books in database by the author and filter out ones already checked out
        return bookRepo.findAllByAuthorIn(authors).stream()
        .filter(book -> !checkedOutBookIds.contains(book.getId()))
        .toList();
}
}

