package com.cse3310.library_backend.book;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/book") 
public class BookController 
{
    private final BookService bookService;

    public BookController(BookService bookService)
    {
        this.bookService = bookService;
    }

    @GetMapping("/{id}")
    public BookResponse getBookById(@PathVariable Long id)
    {
        return bookService.getBookById(id);
    }

    @GetMapping("/search")
    public Page<BookResponse> getBooksByTitle(@RequestParam String query, Pageable pageable)
    {
        return bookService.getBooksByTitle(query, pageable);
    }
}
