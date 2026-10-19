package com.cse3310.library_backend.security;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.cse3310.library_backend.user.User;
import com.cse3310.library_backend.user.UserRepository;

public class CustomUserDetailsService implements UserDetailsService{
    private final UserRepository userRepo;

    public CustomUserDetailsService(UserRepository userRepo)
    {
        this.userRepo = userRepo;
    }

    @Override
    public CustomUserDetails loadUserByUsername(String username)
    {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        return new CustomUserDetails(user);
    }
}
