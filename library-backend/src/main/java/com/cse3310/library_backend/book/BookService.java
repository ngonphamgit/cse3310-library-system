package com.cse3310.library_backend.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@Service 
public class BookService 
{
    private final BookRepository bookRepo;
    private final BookRequestRepository bookRequestRepo;
    private final UserRepository userRepo;

    public BookService(BookRepository bookRepo, BookRequestRepository bookRequestRepo, UserRepository userRepo)
    {
        this.bookRepo = bookRepo;
        this.bookRequestRepo = bookRequestRepo;
        this.userRepo = userRepo;
    }

    public BookResponse getBookById(Long id)
    {
        Book book = bookRepo.findById(id).orElseThrow(() -> new RuntimeException("Book doesn't exist"));
        return toBookResponse(book);
    }

    public Page<BookResponse> getBooksByTitle(String query, Pageable pageable)
    {
        Page<Book> books = bookRepo.findAllByTitle(query, pageable);
        return books.map(book -> toBookResponse(book));
    }

    public Page<BookResponse> getBooksByAuthor(String query, Pageable pageable)
    {
        Page<Book> books = bookRepo.findAllByAuthor(query, pageable);
        return books.map(book -> toBookResponse(book));
    }

    public Page<BookResponse> getBooksByCategory(String query, Pageable pageable)
    {
        Page<Book> books = bookRepo.findAllByCategory(query, pageable);
        return books.map(book -> toBookResponse(book));
    }

    public Page<BookResponse> getBookByIsbn(String query, Pageable pageable)
    {
        Page<Book> books = bookRepo.findAllByIsbn(query, pageable);
        return books.map(book -> toBookResponse(book));
    }

    public BookResponse addBook(AddBookRequest request)
    {
        if (bookRepo.existsByIsbn(request.isbn()))
        {
            throw new RuntimeException("Book ISBN already exists");
        }

        Book book = new Book (
            request.isbn(),
            request.title(),
            request.author(),
            request.description(),
            request.category(),
            request.quantity(),
            true
        );

        bookRepo.save(book);

        return toBookResponse(book);
    }

    public BookResponse removeBook(RemoveBookRequest request)
    {
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));

        book.setIsActive(false);

        bookRepo.save(book);

        return toBookResponse(book);
    }

    public BookResponse updateBook(UpdateBookRequest request)
    {
        Book book = bookRepo.findById(request.bookId()).orElseThrow(() -> new RuntimeException("Book not found"));

        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setDescription(request.description());
        book.setCategory(request.category());
        book.setQuantity(request.quantity());
        book.setIsActive(request.isActive());

        bookRepo.save(book);

        return toBookResponse(book);
    }

    public BookRequestResponse sendBookRequest(BookRequestRequest request, Authentication auth)
    {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));

        BookRequest bookRequest = new BookRequest(
            user.getId(),
            request.isbn(),
            request.title(),
            request.author(),
            request.category()
        );

        bookRequestRepo.save(bookRequest);

        return toBookRequestResponse(bookRequest);
    }

    public List<BookRequestResponse> getAllBookRequests()
    {
        List<BookRequest> bookRequests = bookRequestRepo.findAll();
        return bookRequests.stream().map(request -> toBookRequestResponse(request)).toList();
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
            book.getQuantity(),
            book.getIsActive()
        );
    }

    private BookRequestResponse toBookRequestResponse(BookRequest bookRequest)
    {
        return new BookRequestResponse(
            bookRequest.getUserId(),
            bookRequest.getIsbn(),
            bookRequest.getTitle(),
            bookRequest.getAuthor(),
            bookRequest.getCategory()
        );
    }

    public Page<BookResponse> getAllBooks(Pageable pageable)
{
    Page<Book> books = bookRepo.findAll(pageable);
    return books.map(book -> toBookResponse(book));
}
}
