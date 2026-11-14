package com.cse3310.library_backend.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import com.cse3310.library_backend.loan.Loan;
import com.cse3310.library_backend.loan.LoanRepository;
import com.cse3310.library_backend.reservation.MakeReservationRequest;
import com.cse3310.library_backend.reservation.Reservation;
import com.cse3310.library_backend.reservation.ReservationRepository;
import com.cse3310.library_backend.reservation.ReservationService;
import com.cse3310.library_backend.reservation.ReservationStatus;
import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {
    @Mock
    private LoanRepository loanRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private BookRepository bookRepo;

    @Mock 
    private ReservationRepository reservationRepo;

    @Mock
    private Authentication auth;

    @InjectMocks 
    private ReservationService reservationService;

    @Test 
    void makeReservation()
    {
        User user = mock(User.class);
        Book book = new Book("9", "title", "author", "desc", "cat", 0, true);
        ReflectionTestUtils.setField(book, "bookId", 10L);
        book.setQuantity(0);

        when(auth.getName()).thenReturn("student");
        when(user.getId()).thenReturn(1L);

        when(userRepo.findByUsername("student"))
            .thenReturn(Optional.of(user));

        when(bookRepo.findById(10L))
            .thenReturn(Optional.of(book));

        reservationService.makeReservation(
            new MakeReservationRequest(10L),
            auth
        );
        
        assertEquals(0, book.getQuantity());

        ArgumentCaptor<Reservation> captor =
            ArgumentCaptor.forClass(Reservation.class);

        verify(reservationRepo).save(captor.capture());

        Reservation reservation = captor.getValue();
        assertEquals(ReservationStatus.ACTIVE, reservation.getStatus());
    }
}
