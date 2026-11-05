package com.cse3310.library_backend.reservation;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.book.BookRepository;
import com.cse3310.library_backend.loan.LoanCheckoutRequest;
import com.cse3310.library_backend.loan.LoanResponse;
import com.cse3310.library_backend.loan.LoanService;
import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepo;
    private final UserRepository userRepo;
    private final BookRepository bookRepo;

    private final LoanService loanService;

    public ReservationService(ReservationRepository reservationRepo, 
            UserRepository userRepo, 
            BookRepository bookRepo,
            LoanService loanService)
    {
        this.reservationRepo = reservationRepo;
        this.userRepo = userRepo;
        this.bookRepo = bookRepo;
        this.loanService = loanService;
    }

    public ReservationResponse makeReservation(MakeReservationRequest request, Authentication auth)
    {  
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (book.getQuantity() > 0)
        {
            throw new RuntimeException("This book still has available copies");
        }

        if (reservationRepo.existsByUserIdAndBookIdAndStatus(user.getId(), book.getBookId(), ReservationStatus.ACTIVE))
        {
            throw new RuntimeException("Book already reserved");
        }

        Reservation r = new Reservation(
            user,
            book,
            LocalDateTime.now(),
            ReservationStatus.ACTIVE
        );

        reservationRepo.save(r);

        return toReservationResponse(r);
    }

    @Transactional 
    public FulfillReservationResponse fulfillReservation(FulfillReservationRequest request, Authentication auth)
    {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));

        System.out.println(user.getId() + " " + book.getBookId());
        Reservation r = reservationRepo.findByUserIdAndBookIdAndStatus(user.getId(), book.getBookId(), ReservationStatus.ACTIVE)
                        .orElseThrow(() -> new RuntimeException("No active reservation for this book"));

        LoanResponse loanResponse = loanService.checkoutBookFromReservation(user, book);
        r.setStatus(ReservationStatus.FULFILLED);

        reservationRepo.save(r);

        return toFulfillReservationResponse(loanResponse, toReservationResponse(r));
    }

    private ReservationResponse toReservationResponse(Reservation r)
    {
        return new ReservationResponse(
            r.getId(),
            r.getUser(),
            r.getBook(),
            r.getReservedAt(),
            r.getStatus()
        );
    }

    private FulfillReservationResponse toFulfillReservationResponse(LoanResponse loanResponse, ReservationResponse reservationResponse)
    {
        return new FulfillReservationResponse(
            loanResponse,
            reservationResponse
        );
    }
}
