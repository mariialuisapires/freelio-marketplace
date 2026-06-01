package com.marketplace.chat.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID senderId,
        String senderName,
        String senderPhotoUrl,
        UUID receiverId,
        String receiverName,
        String receiverPhotoUrl,
        String content,
        LocalDateTime sentAt
) {}
