package com.marketplace.profile.repository;

import com.marketplace.profile.entity.FavoriteFreelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteFreelancerRepository extends JpaRepository<FavoriteFreelancer, UUID> {
    List<FavoriteFreelancer> findByClientId(UUID clientId);
    Optional<FavoriteFreelancer> findByClientIdAndFreelancerId(UUID clientId, UUID freelancerId);
    boolean existsByClientIdAndFreelancerId(UUID clientId, UUID freelancerId);
}
