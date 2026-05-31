package com.marketplace.chat.mapper;

import com.marketplace.chat.dto.MessageResponse;
import com.marketplace.chat.entity.Message;
import com.marketplace.users.entity.User;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T13:30:08-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class MessageMapperImpl implements MessageMapper {

    @Override
    public MessageResponse toResponse(Message message) {
        if ( message == null ) {
            return null;
        }

        UUID senderId = null;
        String senderName = null;
        UUID receiverId = null;
        String receiverName = null;
        UUID id = null;
        String content = null;
        LocalDateTime sentAt = null;

        senderId = messageSenderId( message );
        senderName = messageSenderName( message );
        receiverId = messageReceiverId( message );
        receiverName = messageReceiverName( message );
        id = message.getId();
        content = message.getContent();
        sentAt = message.getSentAt();

        MessageResponse messageResponse = new MessageResponse( id, senderId, senderName, receiverId, receiverName, content, sentAt );

        return messageResponse;
    }

    private UUID messageSenderId(Message message) {
        if ( message == null ) {
            return null;
        }
        User sender = message.getSender();
        if ( sender == null ) {
            return null;
        }
        UUID id = sender.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String messageSenderName(Message message) {
        if ( message == null ) {
            return null;
        }
        User sender = message.getSender();
        if ( sender == null ) {
            return null;
        }
        String name = sender.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private UUID messageReceiverId(Message message) {
        if ( message == null ) {
            return null;
        }
        User receiver = message.getReceiver();
        if ( receiver == null ) {
            return null;
        }
        UUID id = receiver.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String messageReceiverName(Message message) {
        if ( message == null ) {
            return null;
        }
        User receiver = message.getReceiver();
        if ( receiver == null ) {
            return null;
        }
        String name = receiver.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
