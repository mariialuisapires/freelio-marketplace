package com.marketplace.contracts.dto;

import com.marketplace.contracts.entity.ContractStatus;
import com.marketplace.projects.dto.ProjectResponse;
import com.marketplace.users.dto.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ContractResponse(
        UUID id,
        ProjectResponse project,
        UserResponse freelancer,
        UUID proposalId,
        BigDecimal agreedPrice,
        LocalDate startDate,
        LocalDate endDate,
        ContractStatus status
) {}
