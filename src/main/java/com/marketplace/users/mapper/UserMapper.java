package com.marketplace.users.mapper;

import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
