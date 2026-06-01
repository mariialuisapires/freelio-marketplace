package com.marketplace.users.repository;

import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    @Query("""
            SELECT u FROM User u
            WHERE u.role = com.marketplace.users.entity.Role.FREELANCER
              AND EXISTS (
                  SELECT fs FROM com.marketplace.categories.entity.FreelancerSpecialty fs
                  WHERE fs.freelancer = u
                    AND fs.specialty.category.id = :categoryId
              )
            """)
    Page<User> findFreelancersByCategory(@Param("categoryId") UUID categoryId, Pageable pageable);
}
