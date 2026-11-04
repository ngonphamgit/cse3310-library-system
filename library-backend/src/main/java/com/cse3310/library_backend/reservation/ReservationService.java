package com.cse3310.library_backend.reservation;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.book.BookRepository;
import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepo;
    private final UserRepository userRepo;
    private final BookRepository bookRepo;

    public ReservationService(ReservationRepository reservationRepo, UserRepository userRepo, BookRepository bookRepo)
    {
        this.reservationRepo = reservationRepo;
        this.userRepo = userRepo;
        this.bookRepo = bookRepo;
    }

    public ReservationResponse makeReservation(ReservationRequest request, Authentication auth)
    {  
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));
        
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
}
