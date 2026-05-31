package com.marketplace.notifications.controller;

import com.marketplace.notifications.dto.NotificationResponse;
import com.marketplace.notifications.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notificações")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Listar minhas notificações")
    public ResponseEntity<Page<NotificationResponse>> findAll(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.findByCurrentUser(currentUser.getUsername(), pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Contar notificações não lidas")
    public ResponseEntity<Map<String, Long>> countUnread(@AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(currentUser.getUsername())));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Marcar notificação como lida")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, currentUser.getUsername()));
    }
}
