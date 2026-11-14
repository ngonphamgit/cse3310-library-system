package com.cse3310.library_backend.book;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import com.cse3310.library_backend.loan.Loan;
import com.cse3310.library_backend.loan.LoanCheckoutRequest;
import com.cse3310.library_backend.loan.LoanRepository;
import com.cse3310.library_backend.loan.LoanReturnRequest;
import com.cse3310.library_backend.loan.LoanService;
import com.cse3310.library_backend.reservation.ReservationRepository;
import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@ExtendWith(MockitoExtension.class)
public class LoanServiceTest {
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
    private LoanService loanService;

    @Test 
    void checkoutAndReturnBook()
    {
        User user = mock(User.class);
        Book book = new Book("9", "title", "author", "desc", "cat", 0, true);
        ReflectionTestUtils.setField(book, "bookId", 10L);
        book.setQuantity(2);

        when(auth.getName()).thenReturn("student");
        when(user.getId()).thenReturn(1L);

        when(userRepo.findByUsername("student"))
            .thenReturn(Optional.of(user));

        when(bookRepo.findById(10L))
            .thenReturn(Optional.of(book));

        loanService.checkoutBook(
            new LoanCheckoutRequest(10L), auth
        );

        assertEquals(1, book.getQuantity());

        ArgumentCaptor<Loan> captor =
            ArgumentCaptor.forClass(Loan.class);

        verify(loanRepo).save(captor.capture());

        Loan loan = captor.getValue();
        assertNull(loan.getReturnDate());

        when(loanRepo
            .findByUserIdAndBookIdAndReturnDateIsNull(1L, 10L))
            .thenReturn(Optional.of(loan));

        loanService.returnBook(
            new LoanReturnRequest(10L), auth
        );

        assertEquals(2, book.getQuantity());

        assertEquals(LocalDate.now(), loan.getReturnDate());

        verify(bookRepo, times(2)).save(book);
        verify(loanRepo, times(2)).save(loan);
    }
}
