package com.cse3310.library_backend.reservation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long>
{
    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, ReservationStatus status);
    List<Reservation> findAllByBookIdOrderByReservedAtAsc(Long bookId);
}
