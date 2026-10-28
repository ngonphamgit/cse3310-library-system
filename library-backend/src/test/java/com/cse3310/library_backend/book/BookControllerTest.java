package com.cse3310.library_backend.book;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import org.springframework.test.web.servlet.MockMvc;

import com.cse3310.library_backend.security.CustomUserDetailsService;
import com.cse3310.library_backend.security.JwtService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
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
}
