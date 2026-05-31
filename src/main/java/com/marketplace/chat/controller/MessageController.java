package com.marketplace.chat.controller;

import com.marketplace.chat.dto.MessageRequest;
import com.marketplace.chat.dto.MessageResponse;
import com.marketplace.chat.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Tag(name = "Chat / Mensagens")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    @Operation(summary = "Listar mensagens recebidas")
    public ResponseEntity<Page<MessageResponse>> getInbox(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 30) Pageable pageable
    ) {
        return ResponseEntity.ok(messageService.getInbox(currentUser.getUsername(), pageable));
    }

    @GetMapping("/conversation/{userId}")
    @Operation(summary = "Buscar conversa com um usuário")
    public ResponseEntity<Page<MessageResponse>> getConversation(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 50) Pageable pageable
    ) {
        return ResponseEntity.ok(messageService.getConversation(userId, currentUser.getUsername(), pageable));
    }

    @PostMapping
    @Operation(summary = "Enviar mensagem via REST")
    public ResponseEntity<MessageResponse> send(
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.send(request, currentUser.getUsername()));
    }
}
