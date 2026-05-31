package com.marketplace.reviews.mapper;

import com.marketplace.reviews.dto.ReviewResponse;
import com.marketplace.reviews.entity.Review;
import com.marketplace.users.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ReviewMapper {

    @Mapping(source = "contract.id", target = "contractId")
    ReviewResponse toResponse(Review review);
}
