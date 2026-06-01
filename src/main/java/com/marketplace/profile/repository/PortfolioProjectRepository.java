package com.marketplace.profile.repository;

import com.marketplace.profile.entity.PortfolioProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PortfolioProjectRepository extends JpaRepository<PortfolioProject, UUID> {
    List<PortfolioProject> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
