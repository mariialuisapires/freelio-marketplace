package com.marketplace.projects.repository;

import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {

    Page<Project> findByClientId(UUID clientId, Pageable pageable);

    @Query("""
            SELECT p FROM Project p
            WHERE (:status IS NULL OR p.status = :status)
              AND (:minBudget IS NULL OR p.budget >= :minBudget)
              AND (:maxBudget IS NULL OR p.budget <= :maxBudget)
              AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                    OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY p.createdAt DESC
            """)
    Page<Project> findWithFilters(
            @Param("status") ProjectStatus status,
            @Param("minBudget") BigDecimal minBudget,
            @Param("maxBudget") BigDecimal maxBudget,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
