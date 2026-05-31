package com.marketplace.projects.dto;

import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.users.dto.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String title,
        String description,
        BigDecimal budget,
        LocalDate deadline,
        ProjectStatus status,
        LocalDateTime createdAt,
        UserResponse client
) {}
