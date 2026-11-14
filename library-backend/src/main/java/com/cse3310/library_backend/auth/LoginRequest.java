package com.cse3310.library_backend.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest (
    @NotBlank String username,
    @NotBlank String password
)
{}
