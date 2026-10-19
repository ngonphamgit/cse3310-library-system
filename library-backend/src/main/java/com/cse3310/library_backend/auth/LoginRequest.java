package com.cse3310.library_backend.auth;

public record LoginRequest (
    String username,
    String password
)
{}
