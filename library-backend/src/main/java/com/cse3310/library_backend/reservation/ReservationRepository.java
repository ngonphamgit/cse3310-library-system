package com.cse3310.library_backend.reservation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.cse3310.library_backend.user.User;

public interface ReservationRepository extends JpaRepository<Reservation, Long>
{
    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, ReservationStatus status);
    Optional<Reservation> findByUserIdAndBookIdAndStatus(Long userId, Long bookId, ReservationStatus status);
    List<Reservation> findAllByBookIdAndStatusOrderByReservedAtAsc(Long bookId, ReservationStatus status);
    List<Reservation> findAllByUserIdOrderByReservedAtAsc(Long userId);
}
