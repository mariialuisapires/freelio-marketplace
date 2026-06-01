package com.marketplace.categories.repository;

import com.marketplace.categories.entity.FreelancerSpecialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FreelancerSpecialtyRepository extends JpaRepository<FreelancerSpecialty, UUID> {

    List<FreelancerSpecialty> findByFreelancerId(UUID freelancerId);

    void deleteByFreelancerId(UUID freelancerId);

    @Query("""
            SELECT DISTINCT fs FROM FreelancerSpecialty fs
            JOIN FETCH fs.freelancer f
            WHERE fs.specialty.category.id = :categoryId
              AND f.role = 'FREELANCER'
            """)
    Page<FreelancerSpecialty> findFreelancersByCategory(@Param("categoryId") UUID categoryId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT fs.freelancer.id) FROM FreelancerSpecialty fs WHERE fs.specialty.category.id = :categoryId")
    long countFreelancersByCategory(@Param("categoryId") UUID categoryId);
}
