package com.marketplace.notifications.service;

import com.marketplace.notifications.dto.NotificationResponse;
import com.marketplace.notifications.entity.Notification;
import com.marketplace.notifications.mapper.NotificationMapper;
import com.marketplace.notifications.repository.NotificationRepository;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserService userService;

    public Page<NotificationResponse> findByCurrentUser(String email, Pageable pageable) {
        var user = (com.marketplace.users.entity.User) userService.loadUserByUsername(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    public long countUnread(String email) {
        var user = (com.marketplace.users.entity.User) userService.loadUserByUsername(email);
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(UUID id, String email) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação", id));
        var user = (com.marketplace.users.entity.User) userService.loadUserByUsername(email);
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Sem permissão");
        }
        notification.setRead(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void create(UUID userId, String title, String message) {
        var user = userService.findUserById(userId);
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .build();
        notificationRepository.save(notification);
    }
}
