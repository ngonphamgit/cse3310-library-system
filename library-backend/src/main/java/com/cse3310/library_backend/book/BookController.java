package com.cse3310.library_backend.book;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/book") 
public class BookController 
{
    private final BookService bookService;

    public BookController(BookService bookService)
    {
        this.bookService = bookService;
    }
    
    @GetMapping
    public Page<BookResponse> getAllBooks(Pageable pageable)
    {
        return bookService.getAllBooks(pageable);
    }

    @GetMapping("/{id}")
    public BookResponse getBookById(@PathVariable Long id)
    {
        return bookService.getBookById(id);
    }

    @GetMapping("/search/title")
    public Page<BookResponse> getBooksByTitle(@RequestParam String query, Pageable pageable)
    {
        return bookService.getBooksByTitle(query, pageable);
    }

    @GetMapping("/search/author")
    public Page<BookResponse> getBooksByAuthor(@RequestParam String query, Pageable pageable)
    {
        return bookService.getBooksByAuthor(query, pageable);
    }

    @GetMapping("/search/category")
    public Page<BookResponse> getBooksByCategory(@RequestParam String query, Pageable pageable)
    {
        return bookService.getBooksByCategory(query, pageable);
    }

    //return a page instead of a single response so the logic
    //stays consistent with the rest of the endpoints
    @GetMapping("/search/isbn")
    public Page<BookResponse> getBookByIsbn(@RequestParam String query, Pageable pageable)
    {
        return bookService.getBookByIsbn(query, pageable);
    }
}
