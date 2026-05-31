package com.marketplace.proposals.dto;

import com.marketplace.proposals.entity.ProposalStatus;
import com.marketplace.users.dto.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProposalResponse(
        UUID id,
        String message,
        BigDecimal price,
        Integer deliveryDays,
        ProposalStatus status,
        UUID projectId,
        String projectTitle,
        UserResponse freelancer,
        LocalDateTime createdAt
) {}
