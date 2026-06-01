package com.marketplace.profile.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PortfolioProjectResponse(
        UUID id,
        String title,
        String description,
        String imageUrl,
        String githubUrl,
        String demoUrl,
        List<String> technologies,
        LocalDate createdAt
) {}
