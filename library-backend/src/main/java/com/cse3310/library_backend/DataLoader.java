package com.cse3310.library_backend;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.cse3310.library_backend.book.Book;
import com.cse3310.library_backend.book.BookRepository;

import net.datafaker.Faker;

@Component
public class DataLoader implements CommandLineRunner
{
    private final BookRepository bookRepo;

    public DataLoader(BookRepository bookRepo)
    {
        this.bookRepo = bookRepo;
    }

    @Override 
    public void run(String... args)
    {
        if (bookRepo.count() > 0) return;

        Faker faker = new Faker();
        List<Book> books = new ArrayList<>();

        for (int i = 0; i < 200; i++)
        {
            Book book = new Book(
                faker.code().isbn13(),
                faker.book().title(),
                faker.book().author(),
                faker.lorem().paragraph(),
                faker.book().genre(),
                faker.number().numberBetween(0, 10)
            );

            books.add(book);
        }

        bookRepo.saveAll(books);
    }
}
