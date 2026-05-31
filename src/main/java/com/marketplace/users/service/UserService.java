package com.marketplace.users.service;

import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.dto.UserRequest;
import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.entity.User;
import com.marketplace.users.mapper.UserMapper;
import com.marketplace.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Value("${application.upload.dir}")
    private String uploadDir;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }

    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    public UserResponse findById(UUID id) {
        return userMapper.toResponse(findUserById(id));
    }

    @Transactional
    public UserResponse update(UUID id, UserRequest request, String currentUserEmail) {
        User user = findUserById(id);
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Você só pode editar seu próprio perfil");
        }
        if (request.name() != null) user.setName(request.name());
        if (request.bio() != null) user.setBio(request.bio());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse uploadPhoto(UUID id, MultipartFile file, String currentUserEmail) {
        User user = findUserById(id);
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Você só pode alterar sua própria foto");
        }
        if (file.isEmpty()) {
            throw new BusinessRuleException("Arquivo vazio");
        }
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            String filename = id + "_" + System.currentTimeMillis() + getExtension(file.getOriginalFilename());
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());
            user.setPhotoUrl("/uploads/" + filename);
            return userMapper.toResponse(userRepository.save(user));
        } catch (IOException e) {
            throw new BusinessRuleException("Erro ao salvar arquivo");
        }
    }

    @Transactional
    public void delete(UUID id, String currentUserEmail) {
        User user = findUserById(id);
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Você só pode excluir sua própria conta");
        }
        userRepository.delete(user);
    }

    public User findUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
