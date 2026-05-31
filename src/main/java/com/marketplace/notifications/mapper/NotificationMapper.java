package com.marketplace.notifications.mapper;

import com.marketplace.notifications.dto.NotificationResponse;
import com.marketplace.notifications.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);
}
