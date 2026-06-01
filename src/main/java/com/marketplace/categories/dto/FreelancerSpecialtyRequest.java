package com.marketplace.categories.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record FreelancerSpecialtyRequest(
        @NotNull UUID primarySpecialtyId,
        List<UUID> specialtyIds
) {}
