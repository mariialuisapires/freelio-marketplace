package com.marketplace.users.mapper;

import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.entity.Availability;
import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T21:20:24-0300",
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
        String title = null;
        String location = null;
        Availability availability = null;
        Boolean verified = null;
        String skills = null;
        String website = null;
        String linkedin = null;
        LocalDateTime createdAt = null;

        id = user.getId();
        name = user.getName();
        email = user.getEmail();
        role = user.getRole();
        photoUrl = user.getPhotoUrl();
        bio = user.getBio();
        title = user.getTitle();
        location = user.getLocation();
        availability = user.getAvailability();
        verified = user.getVerified();
        skills = user.getSkills();
        website = user.getWebsite();
        linkedin = user.getLinkedin();
        createdAt = user.getCreatedAt();

        UserResponse userResponse = new UserResponse( id, name, email, role, photoUrl, bio, title, location, availability, verified, skills, website, linkedin, createdAt );

        return userResponse;
    }
}
