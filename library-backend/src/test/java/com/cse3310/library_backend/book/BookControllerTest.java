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
    
    private List<BookResponse> books = List.of(
        new BookResponse(1L, "9781583429990", "red 1", "a", "d1", "c1", 1, true),
        new BookResponse(2L, "9781583429991", "red 2", "a", "d2", "c1", 1, true),
        new BookResponse(3L, "9781583429992", "red 5", "a", "d3", "c2", 1, true),
        new BookResponse(4L, "9781583429993", "red 3", "a", "d4", "c2", 1, true),
        new BookResponse(5L, "9781583429994", "red 4", "b", "d5", "c3", 1, true),
        new BookResponse(6L, "9781583429995", "blue 1", "c", "d5", "c3", 1, true),
        new BookResponse(7L, "9781583429996", "blue 2", "c", "d5", "c3", 1, true)
    );
    
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
    void searchBooksByTitleReturns200() throws Exception
    {
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
            //.andDo(print())
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
            //.andDo(print())
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
            //.andDo(print())
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
            //.andDo(print())
            .andExpect(jsonPath("$.content.length()").value(0))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(0))
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    void searchBooksByAuthorReturns200() throws Exception
    {
        Pageable pageable03 = PageRequest.of(0, 3);
        Pageable pageable06 = PageRequest.of(0, 6);

        Page<BookResponse> page1 = new PageImpl<>(
            books.subList(0, 3),
            pageable03,
            4
        );
        Page<BookResponse> page2 = new PageImpl<>(
            books.subList(1, 4),
            pageable06,
            3
        );
        Page<BookResponse> page3 = new PageImpl<>(
            books.subList(4, 5),
            pageable06,
            1
        );
        Page<BookResponse> page4 = new PageImpl<>(
            books.subList(5, 7),
            pageable06,
            1
        );
        Page<BookResponse> page5 = new PageImpl<>(
            new ArrayList<>(),
            pageable06,
            0
        );

        when(bookService.getBooksByAuthor("a", pageable03)).thenReturn(page1);
        when(bookService.getBooksByAuthor("a", pageable06)).thenReturn(page2);
        when(bookService.getBooksByAuthor("b", pageable06)).thenReturn(page3);
        when(bookService.getBooksByAuthor("c", pageable06)).thenReturn(page4);
        when(bookService.getBooksByAuthor("d", pageable06)).thenReturn(page5);

        //should return books with ids 1,2,3
        mockMvc.perform(get("/book/search/author")
                .param("query", "a")
                .param("page", "0")
                .param("size", "3"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(3))
            .andExpect(jsonPath("$.totalElements").value(4))
            .andExpect(jsonPath("$.totalPages").value(2));

        //should return books with ids 2,3,4
        mockMvc.perform(get("/book/search/author")
                .param("query", "a")
                .param("page", "0")
                .param("size", "6"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(3))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(3))
            .andExpect(jsonPath("$.totalElements").value(3))
            .andExpect(jsonPath("$.totalPages").value(1));

        //should return books with id 5
        mockMvc.perform(get("/book/search/author")
                .param("query", "b")
                .param("page", "0")
                .param("size", "6"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(1))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.totalPages").value(1));
        
        //should return books with ids 6, 7
        mockMvc.perform(get("/book/search/author")
                .param("query", "c")
                .param("page", "0")
                .param("size", "6"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(2))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.totalPages").value(1));
        
        //should return nothing
        mockMvc.perform(get("/book/search/author")
                .param("query", "d")
                .param("page", "0")
                .param("size", "6"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(0))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(0))
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    void searchBooksByCategoryReturns200() throws Exception
    {
        Pageable pageable05 = PageRequest.of(0, 5);

        Page<BookResponse> page1 = new PageImpl<>(
            books.subList(0, 2),
            pageable05,
            2
        );
        Page<BookResponse> page2 = new PageImpl<>(
            books.subList(2, 4),
            pageable05,
            2
        );
        Page<BookResponse> page3 = new PageImpl<>(
            books.subList(4, 5),
            pageable05,
            1
        );
        Page<BookResponse> page4 = new PageImpl<>(
            new ArrayList<>(),
            pageable05,
            0
        );

        when(bookService.getBooksByCategory("c1", pageable05)).thenReturn(page1);
        when(bookService.getBooksByCategory("c2", pageable05)).thenReturn(page2);
        when(bookService.getBooksByCategory("c3", pageable05)).thenReturn(page3);
        when(bookService.getBooksByCategory("c4", pageable05)).thenReturn(page4);

        mockMvc.perform(get("/book/search/category")
                .param("query", "c1")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(2))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.totalPages").value(1));
        
        mockMvc.perform(get("/book/search/category")
                .param("query", "c2")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(2))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.totalPages").value(1));

        mockMvc.perform(get("/book/search/category")
                .param("query", "c3")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(1))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.totalPages").value(1));
        
        mockMvc.perform(get("/book/search/category")
                .param("query", "c4")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(0))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(0))
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    void searchBooksByIsbnReturns200() throws Exception
    {
        Pageable pageable01 = PageRequest.of(0, 5);

        Page<BookResponse> page1 = new PageImpl<>(
            books.subList(0, 1),
            pageable01,
            1
        );
        Page<BookResponse> page2 = new PageImpl<>(
            books.subList(1, 2),
            pageable01,
            1
        );
        Page<BookResponse> page3 = new PageImpl<>(
            new ArrayList<>(),
            pageable01,
            0
        );

        when(bookService.getBookByIsbn("9781583429990", pageable01)).thenReturn(page1);
        when(bookService.getBookByIsbn("9781583429991", pageable01)).thenReturn(page2);
        when(bookService.getBookByIsbn("9781583429999", pageable01)).thenReturn(page3);

        mockMvc.perform(get("/book/search/isbn")
                .param("query", "9781583429990")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(1))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.totalPages").value(1));
        
        mockMvc.perform(get("/book/search/isbn")
                .param("query", "9781583429991")
                .param("page", "0")
                .param("size", "5"))
            .andDo(print())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.numberOfElements").value(1))
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.totalPages").value(1));

        mockMvc.perform(get("/book/search/isbn")
                .param("query", "9781583429999")
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
