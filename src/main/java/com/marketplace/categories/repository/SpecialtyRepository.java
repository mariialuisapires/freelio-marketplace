package com.marketplace.categories.repository;

import com.marketplace.categories.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {
    List<Specialty> findByCategoryId(UUID categoryId);
}
