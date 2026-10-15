package com.cse3310.library_backend.book;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service 
public class BookService 
{
    private final BookRepository bookRepo;

    public BookService(BookRepository bookRepo)
    {
        this.bookRepo = bookRepo;
    }

    public BookResponse getBookById(Long id)
    {
        Book book = bookRepo.findById(id).orElseThrow(() -> new RuntimeException("Book doesn't exist"));
        return toBookResponse(book);
    }

    private BookResponse toBookResponse(Book book)
    {
        return new BookResponse(
            book.getId(),
            book.getIsbn(),
            book.getTitle(),
            book.getAuthor(),
            book.getDescription(),
            book.getCategory(),
            book.getQuantity()
        );
    }
}
