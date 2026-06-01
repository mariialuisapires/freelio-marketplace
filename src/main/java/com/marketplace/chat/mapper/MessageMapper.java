package com.marketplace.chat.mapper;

import com.marketplace.chat.dto.MessageResponse;
import com.marketplace.chat.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "sender.name", target = "senderName")
    @Mapping(source = "sender.photoUrl", target = "senderPhotoUrl")
    @Mapping(source = "receiver.id", target = "receiverId")
    @Mapping(source = "receiver.name", target = "receiverName")
    @Mapping(source = "receiver.photoUrl", target = "receiverPhotoUrl")
    MessageResponse toResponse(Message message);
}
