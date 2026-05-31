package com.marketplace.chat.service;

import com.marketplace.chat.dto.MessageRequest;
import com.marketplace.chat.dto.MessageResponse;
import com.marketplace.chat.entity.Message;
import com.marketplace.chat.mapper.MessageMapper;
import com.marketplace.chat.repository.MessageRepository;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.users.entity.User;
import com.marketplace.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final UserService userService;
    private final NotificationService notificationService;

    public Page<MessageResponse> getConversation(UUID otherUserId, String currentUserEmail, Pageable pageable) {
        User currentUser = (User) userService.loadUserByUsername(currentUserEmail);
        return messageRepository.findConversation(currentUser.getId(), otherUserId, pageable)
                .map(messageMapper::toResponse);
    }

    public Page<MessageResponse> getInbox(String email, Pageable pageable) {
        User user = (User) userService.loadUserByUsername(email);
        return messageRepository.findByReceiverIdOrderBySentAtDesc(user.getId(), pageable)
                .map(messageMapper::toResponse);
    }

    @Transactional
    public MessageResponse send(MessageRequest request, String senderEmail) {
        User sender = (User) userService.loadUserByUsername(senderEmail);
        User receiver = userService.findUserById(request.receiverId());

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.content())
                .build();

        MessageResponse response = messageMapper.toResponse(messageRepository.save(message));

        notificationService.create(
                receiver.getId(),
                "Nova mensagem",
                "%s enviou uma mensagem para você".formatted(sender.getName())
        );

        return response;
    }
}
