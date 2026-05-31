package com.marketplace.reviews.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record ReviewRequest(
        @NotNull(message = "ID do contrato é obrigatório")
        UUID contractId,

        @NotNull(message = "Nota é obrigatória")
        @Min(value = 1, message = "Nota mínima é 1")
        @Max(value = 5, message = "Nota máxima é 5")
        Integer rating,

        @Size(max = 2000, message = "Comentário deve ter no máximo 2000 caracteres")
        String comment
) {}
