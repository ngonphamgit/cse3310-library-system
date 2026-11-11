package com.cse3310.library_backend.user;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service 
public class UserService {
    private final UserRepository userRepo;

    public UserService(UserRepository userRepo)
    {
        this.userRepo = userRepo;
    }

    public UserResponse blockUser(Long userId, Authentication auth)
    {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsBlocked(true);
        userRepo.save(user);

        return toUserResponse(user);
    }

    public UserResponse toUserResponse(User user)
    {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getIsBlocked()
        );
    }
}
