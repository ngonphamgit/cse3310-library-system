package com.cse3310.library_backend.auth;

public record RegisterRequest (
    String username,
    String email,
    String password
) {}
