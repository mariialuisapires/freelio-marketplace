package com.marketplace.auth;

import com.marketplace.auth.dto.LoginRequest;
import com.marketplace.auth.dto.RegisterRequest;
import com.marketplace.auth.service.AuthService;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.shared.security.JwtService;
import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
import com.marketplace.users.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    @Test
    void register_success() {
        var request = new RegisterRequest("Maria", "maria@test.com", "senha123", Role.CLIENT);
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u = User.builder().id(UUID.randomUUID()).name(u.getName()).email(u.getEmail())
                    .password(u.getPassword()).role(u.getRole()).build();
            return u;
        });
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        var response = authService.register(request);

        assertNotNull(response);
        assertEquals("access-token", response.accessToken());
        assertEquals(Role.CLIENT, response.role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsException() {
        var request = new RegisterRequest("Maria", "maria@test.com", "senha123", Role.CLIENT);
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        var request = new LoginRequest("maria@test.com", "senha123");
        User user = User.builder().id(UUID.randomUUID()).name("Maria")
                .email(request.email()).password("encoded").role(Role.CLIENT).build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        var response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.accessToken());
    }

    @Test
    void login_invalidCredentials_throwsException() {
        var request = new LoginRequest("maria@test.com", "wrongpass");
        doThrow(BadCredentialsException.class).when(authenticationManager).authenticate(any());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
