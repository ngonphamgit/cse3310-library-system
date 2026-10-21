package com.cse3310.library_backend.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cse3310.library_backend.security.JwtService;
import com.cse3310.library_backend.user.Role;
import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

@Service 
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepo, PasswordEncoder passwordEncoder, JwtService jwtService)
    {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request)
    {
        if (userRepo.existsByUsername(request.username()))
        {
            throw new RuntimeException("Username already exists");
        }

        if (userRepo.existsByEmail(request.email()))
        {
            throw new RuntimeException("Email already exists");
        }

        //will have to check if email is actually a student email later

        User user = new User(
            request.username(),
            request.email(),
            passwordEncoder.encode(request.password()),
            Role.ROLE_STUDENT
        );

        userRepo.save(user);

        String token = jwtService.generateToken(request.username());
        return new AuthResponse(token, user.getRole().name());
    }

    public AuthResponse login(LoginRequest request)
    {
        User user = userRepo.findByUsername(request.username()).orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword()))
        {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(request.username());
        return new AuthResponse(token, user.getRole().name());
    }
}
