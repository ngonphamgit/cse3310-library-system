package com.cse3310.library_backend.book;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import org.springframework.test.web.servlet.MockMvc;

import com.cse3310.library_backend.security.CustomUserDetailsService;
import com.cse3310.library_backend.security.JwtService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(BookController.class)
public class BookControllerTest {
    
    @Autowired 
    private MockMvc mockMvc;

    @MockitoBean
    private BookService bookService;
    @MockitoBean 
    private JwtService jwtService;
    @MockitoBean
    private CustomUserDetailsService cuds;

    @Test
    void getBookByIdReturns200() throws Exception
    {
        BookResponse response = new BookResponse(
            1L,
            "9781583429990",
            "Ngon Test Book",
            "Ngon Pham",
            "Test Desc",
            "Test Category",
            10,
            true
        );

        when(bookService.getBookById(1L)).thenReturn(response);

        mockMvc.perform(get("/book/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.bookId").value(1L))
            .andExpect(jsonPath("$.isbn").value("9781583429990"))
            .andExpect(jsonPath("$.title").value("Ngon Test Book"))
            .andExpect(jsonPath("$.author").value("Ngon Pham"))
            .andExpect(jsonPath("$.description").value("Test Desc"))
            .andExpect(jsonPath("$.category").value("Test Category"))
            .andExpect(jsonPath("$.quantity").value(10))
            .andExpect(jsonPath("$.isActive").value(true));

        verify(bookService).getBookById(1L);
    }

    @Test
    void searchBooksReturns200() throws Exception
    {
        List<BookResponse> books = List.of(
            new BookResponse(1L, "9781583429990", "red 1", "a1", "d1", "c1", 1, true),
            new BookResponse(2L, "9781583429991", "red 2", "a1", "d2", "c1", 1, true),
            new BookResponse(3L, "9781583429992", "red 5", "a1", "d3", "c2", 1, true),
            new BookResponse(4L, "9781583429993", "red 3", "a1", "d4", "c2", 1, true),
            new BookResponse(5L, "9781583429994", "red 4", "a2", "d5", "c3", 1, true),
            new BookResponse(6L, "9781583429994", "blue 1", "a5", "d5", "c3", 1, true),
            new BookResponse(7L, "9781583429994", "blue 2", "a5", "d5", "c3", 1, true)
        );

        Pageable pageable0 = PageRequest.of(0, 3);
        Pageable pageable1 = PageRequest.of(1, 3);
        Pageable pageable2 = PageRequest.of(0, 5);

        Page<BookResponse> page0 = new PageImpl<>(
            books.subList(0, 3),
            pageable0,
            5
        );
        Page<BookResponse> page1 = new PageImpl<>(
            books.subList(3, 5),
            pageable1,
            5
        );
        Page<BookResponse> page2 = new PageImpl<>(
            books.subList(5, 7),
            pageable0,
            2
        );
        Page<BookResponse> page3 = new PageImpl<>(
            new ArrayList<>(),
            pageable2,
            0
        );

        when(bookService.getBooksByTitle("red", pageable0)).thenReturn(page0);
        when(bookService.getBooksByTitle("red", pageable1)).thenReturn(page1);
        when(bookService.getBooksByTitle("blue", pageable0)).thenReturn(page2);
        when(bookService.getBooksByTitle("blue", pageable2)).thenReturn(page3);

        //should return red 1, 2, 5
        mockMvc.perform(get("/book/search/title")
                .param("query", "red")
                .param("page", "0")
                .param("size", "3"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(3))
            .andExpect(jsonPath("$.totalElements").value(5))
            .andExpect(jsonPath("$.totalPages").value(2));

        //should return red 3, 4
        mockMvc.perform(get("/book/search/title")
                .param("query", "red")
                .param("page", "1")
                .param("size", "3"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.number").value(1))
            .andExpect(jsonPath("$.numberOfElements").value(2))
            .andExpect(jsonPath("$.totalElements").value(5))
            .andExpect(jsonPath("$.totalPages").value(2));

        //should return blue 1, 2
        mockMvc.perform(get("/book/search/title")
                .param("query", "blue")
                .param("page", "0")
                .param("size", "3"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(2))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.totalPages").value(1));
        
        //should return nothing
        mockMvc.perform(get("/book/search/title")
                .param("query", "blue")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(0))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(0))
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
    }
}
