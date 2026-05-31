package com.marketplace.notifications.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String title,
        String message,
        Boolean read,
        LocalDateTime createdAt
) {}
