package com.marketplace.chat.repository;

import com.marketplace.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("""
            SELECT m FROM Message m
            WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2)
               OR (m.sender.id = :userId2 AND m.receiver.id = :userId1)
            ORDER BY m.sentAt ASC
            """)
    Page<Message> findConversation(
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2,
            Pageable pageable
    );

    Page<Message> findByReceiverIdOrderBySentAtDesc(UUID receiverId, Pageable pageable);
}
