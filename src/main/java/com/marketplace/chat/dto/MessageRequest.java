package com.marketplace.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MessageRequest(
        @NotNull(message = "ID do destinatário é obrigatório")
        UUID receiverId,

        @NotBlank(message = "Conteúdo é obrigatório")
        String content
) {}
