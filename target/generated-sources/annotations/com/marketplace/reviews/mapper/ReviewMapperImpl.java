package com.marketplace.reviews.mapper;

import com.marketplace.contracts.entity.Contract;
import com.marketplace.reviews.dto.ReviewResponse;
import com.marketplace.reviews.entity.Review;
import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.mapper.UserMapper;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T11:37:49-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class ReviewMapperImpl implements ReviewMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public ReviewResponse toResponse(Review review) {
        if ( review == null ) {
            return null;
        }

        UUID contractId = null;
        UUID id = null;
        Integer rating = null;
        String comment = null;
        UserResponse client = null;
        UserResponse freelancer = null;
        LocalDateTime createdAt = null;

        contractId = reviewContractId( review );
        id = review.getId();
        rating = review.getRating();
        comment = review.getComment();
        client = userMapper.toResponse( review.getClient() );
        freelancer = userMapper.toResponse( review.getFreelancer() );
        createdAt = review.getCreatedAt();

        ReviewResponse reviewResponse = new ReviewResponse( id, rating, comment, client, freelancer, contractId, createdAt );

        return reviewResponse;
    }

    private UUID reviewContractId(Review review) {
        if ( review == null ) {
            return null;
        }
        Contract contract = review.getContract();
        if ( contract == null ) {
            return null;
        }
        UUID id = contract.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
