package com.marketplace.reviews.dto;

import com.marketplace.users.dto.UserResponse;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        Integer rating,
        String comment,
        UserResponse client,
        UserResponse freelancer,
        UUID contractId,
        LocalDateTime createdAt
) {}
