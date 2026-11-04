package com.cse3310.library_backend.reservation;

import java.time.LocalDateTime;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reservationId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @Column(nullable = false)
    private LocalDateTime reservedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    protected Reservation() {}

    public Reservation(User user, Book book, LocalDateTime reservedAt, ReservationStatus status)
    {
        this.user = user;
        this.book = book;
        this.reservedAt = reservedAt;
        this.status = status;
    }

    public Long getId() {return this.reservationId;}
    public User getUser() {return this.user;}
    public Book getBook() {return this.book;}
    public LocalDateTime getReservedAt() {return this.reservedAt;}
    public ReservationStatus getStatus() {return this.status;}
}
