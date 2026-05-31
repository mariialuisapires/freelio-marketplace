package com.marketplace.users.mapper;

import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
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
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String email = null;
        Role role = null;
        String photoUrl = null;
        String bio = null;
        LocalDateTime createdAt = null;

        id = user.getId();
        name = user.getName();
        email = user.getEmail();
        role = user.getRole();
        photoUrl = user.getPhotoUrl();
        bio = user.getBio();
        createdAt = user.getCreatedAt();

        UserResponse userResponse = new UserResponse( id, name, email, role, photoUrl, bio, createdAt );

        return userResponse;
    }
}
