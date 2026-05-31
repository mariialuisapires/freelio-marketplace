package com.marketplace.users.dto;

import jakarta.validation.constraints.Size;

public record UserRequest(
        @Size(min = 2, max = 255, message = "Nome deve ter entre 2 e 255 caracteres")
        String name,

        @Size(max = 2000, message = "Bio deve ter no máximo 2000 caracteres")
        String bio
) {}
