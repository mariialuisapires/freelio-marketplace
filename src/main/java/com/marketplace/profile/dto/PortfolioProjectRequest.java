package com.marketplace.profile.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record PortfolioProjectRequest(
        @NotBlank String title,
        String description,
        String imageUrl,
        String githubUrl,
        String demoUrl,
        List<String> technologies
) {}
