package com.marketplace.chat.controller;

import com.marketplace.chat.dto.MessageRequest;
import com.marketplace.chat.dto.MessageResponse;
import com.marketplace.chat.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void processMessage(@Payload MessageRequest request, Principal principal) {
        MessageResponse saved = messageService.send(request, principal.getName());
        messagingTemplate.convertAndSendToUser(
                saved.receiverId().toString(),
                "/queue/messages",
                saved
        );
        log.debug("Mensagem enviada de {} para {}", saved.senderId(), saved.receiverId());
    }
}
