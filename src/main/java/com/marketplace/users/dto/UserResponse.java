package com.marketplace.users.dto;

import com.marketplace.users.entity.Availability;
import com.marketplace.users.entity.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        Role role,
        String photoUrl,
        String bio,
        String title,
        String location,
        Availability availability,
        Boolean verified,
        String skills,
        String website,
        String linkedin,
        LocalDateTime createdAt
) {}
