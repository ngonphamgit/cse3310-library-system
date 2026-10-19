package com.cse3310.library_backend.auth;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService)
    {
        this.authService = authService;
    }

    public void register(@RequestBody RegisterRequest request)
    {
        authService.register(request);
    }

    public AuthResponse login(@RequestBody LoginRequest request)
    {
        return authService.login(request);
    }
}
