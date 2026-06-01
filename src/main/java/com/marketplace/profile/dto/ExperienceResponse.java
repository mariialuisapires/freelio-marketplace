package com.marketplace.profile.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ExperienceResponse(
        UUID id,
        String company,
        String position,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}
