package com.marketplace.categories.dto;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String icon,
        String description,
        long freelancerCount,
        List<SpecialtyResponse> specialties
) {}
