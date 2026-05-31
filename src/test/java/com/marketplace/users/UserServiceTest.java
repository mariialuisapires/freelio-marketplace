package com.marketplace.users;

import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.dto.UserRequest;
import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
import com.marketplace.users.mapper.UserMapper;
import com.marketplace.users.repository.UserRepository;
import com.marketplace.users.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock UserMapper userMapper;

    @InjectMocks UserService userService;

    @Test
    void findById_notFound_throwsException() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.findById(id));
    }

    @Test
    void update_notOwner_throwsException() {
        User user = User.builder().id(UUID.randomUUID()).name("Maria").email("maria@test.com")
                .role(Role.CLIENT).build();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> userService.update(user.getId(), new UserRequest("Novo Nome", null), "other@test.com"));
    }

    @Test
    void update_ownProfile_success() {
        User user = User.builder().id(UUID.randomUUID()).name("Maria").email("maria@test.com")
                .role(Role.CLIENT).build();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(any())).thenReturn(null);

        userService.update(user.getId(), new UserRequest("Novo Nome", "Bio nova"), user.getEmail());

        assertEquals("Novo Nome", user.getName());
        assertEquals("Bio nova", user.getBio());
        verify(userRepository).save(user);
    }
}
