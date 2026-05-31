package com.marketplace.notifications.mapper;

import com.marketplace.notifications.dto.NotificationResponse;
import com.marketplace.notifications.entity.Notification;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T11:37:49-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        UUID id = null;
        String title = null;
        String message = null;
        Boolean read = null;
        LocalDateTime createdAt = null;

        id = notification.getId();
        title = notification.getTitle();
        message = notification.getMessage();
        read = notification.getRead();
        createdAt = notification.getCreatedAt();

        NotificationResponse notificationResponse = new NotificationResponse( id, title, message, read, createdAt );

        return notificationResponse;
    }
}
