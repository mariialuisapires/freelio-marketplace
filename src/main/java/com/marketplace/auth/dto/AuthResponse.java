package com.marketplace.auth.dto;

import com.marketplace.users.entity.Role;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String name,
        String email,
        Role role
) {}
