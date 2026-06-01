package com.marketplace.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ExperienceRequest(
        @NotBlank String company,
        @NotBlank String position,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        String description
) {}
