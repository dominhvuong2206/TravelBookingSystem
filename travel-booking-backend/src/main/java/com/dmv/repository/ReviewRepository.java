package com.dmv.repository;
import com.dmv.pojo.Review;
import java.util.List;
import java.util.Map;
public interface ReviewRepository {
    List<Review> getReviews(Map<String, String> params);
    Long countReviews(Map<String, String> params);
    Double averageRating(int serviceId);
    Review getReviewById(int id);
    Review addReview(Review c);
    Review updateReview(Review c);
}
