package com.cse3310.library_backend.book;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping ("/admin/addBook")
    public BookResponse addBook(@RequestBody AddBookRequest request)
    {
        return bookService.addBook(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/removeBook")
    public BookResponse removeBook(@RequestBody RemoveBookRequest request)
    {
        return bookService.removeBook(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/updateBook")
    public BookResponse updateBook(@RequestBody UpdateBookRequest request)
    {
        return bookService.updateBook(request);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @PostMapping("/request")
    public BookRequestResponse sendBookRequest(@RequestBody BookRequestRequest request, Authentication auth)
    {
        return bookService.sendBookRequest(request, auth);
    }

    //optional ?status=PENDING|APPROVED|REJECTED, returns all requests when omitted
    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping ("/getRequests")
    public List<BookRequestResponse> getAllBookRequests(@RequestParam(required = false) BookRequestStatus status)
    {
        return bookService.getAllBookRequests(status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/requests/{id}")
    public BookRequestResponse updateBookRequest(@PathVariable Long id, @RequestBody BookRequestRequest request)
    {
        return bookService.updateBookRequest(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/requests/{id}/approve")
    public BookRequestResponse approveBookRequest(@PathVariable Long id, @RequestBody AddBookRequest request)
    {
        return bookService.approveBookRequest(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/requests/{id}/reject")
    public BookRequestResponse rejectBookRequest(@PathVariable Long id)
    {
        return bookService.rejectBookRequest(id);
    }
}
