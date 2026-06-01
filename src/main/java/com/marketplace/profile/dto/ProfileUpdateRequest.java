package com.marketplace.profile.dto;

import com.marketplace.users.entity.Availability;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProfileUpdateRequest(
        @Size(min = 2, max = 255) String name,
        @Size(max = 2000) String bio,
        @Size(max = 255) String title,
        @Size(max = 255) String location,
        @Size(max = 500) String website,
        @Size(max = 500) String linkedin,
        Availability availability,
        List<String> skills
) {}
