package com.cse3310.library_backend.loan;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;

import com.cse3310.library_backend.book.Book;
@RestController 
@RequestMapping("/loan")
public class LoanController {
    
    private final LoanService loanService;

    public LoanController(LoanService loanService)
    {
        this.loanService = loanService;
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @PostMapping("/checkout")
    public LoanResponse checkoutBook(@RequestBody LoanCheckoutRequest request, Authentication auth)
    {
        return loanService.checkoutBook(request, auth);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @PostMapping("/return")
    public LoanResponse returnBook(@RequestBody LoanReturnRequest request, Authentication auth)
    {
        return loanService.returnBook(request, auth);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @GetMapping("/my-loans")
    public List<LoanResponse> getMyLoans(Authentication auth)
    {
       return loanService.getMyLoans(auth);
    }

        @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @GetMapping("/all-my-loans")
    public List<LoanResponse> getCurrentandPastLoans(Authentication auth)
    {
       return loanService.getCurrentandPastLoans(auth);
    }


    @GetMapping("/all-active")
@PreAuthorize("hasRole('ADMIN')")
public List<LoanResponse> getAllActiveLoans()
{
    return loanService.getAllActiveLoans();
}


//endpoint for book recommendations
@GetMapping("/recommendations")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public List<Book> getRecommendations(Authentication auth) 
{
    return loanService.getRecommendations(auth);
}
}
