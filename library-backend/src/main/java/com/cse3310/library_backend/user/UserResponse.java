package com.cse3310.library_backend.user;

public record UserResponse(
    Long userId,
    String username,
    String email,
    Role role,
    boolean isBlocked
) {
    
}
