package com.cse3310.library_backend.loan;

import java.time.LocalDate;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "loans")
public class Loan 
{
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long loanId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private LocalDate borrowDate;

    @Column
    private LocalDate returnDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    protected Loan() {}

    public Loan(User user, Book book, LocalDate borrowDate, LocalDate returnDate, LocalDate dueDate)
    {
        this.user = user;
        this.book = book;
        this.borrowDate = borrowDate;
        this.returnDate = returnDate;
        this.dueDate = dueDate;
    }

    public User getUser() {return this.user;}
    public Book getBook() {return this.book;}
    public LocalDate getBorrowDate() {return this.borrowDate;}
    public LocalDate getReturnDate() {return this.returnDate;}
    public LocalDate getDueDate() {return this.dueDate;}

    public void setReturnDate(LocalDate returnDate) {this.returnDate = returnDate;}
}
