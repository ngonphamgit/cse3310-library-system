package com.cse3310.library_backend.auth;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest (
    @NotBlank String username,
    @NotBlank String email,
    @NotBlank String password
) {}
