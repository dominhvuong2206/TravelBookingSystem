package com.dmv.service;
import com.dmv.pojo.Review;
import java.util.List;
import java.util.Map;

public interface ReviewService {
    List<Review> getReviews(Map<String, String> params);
    Long countReviews(Map<String, String> params);
    Double averageRating(int serviceId);
    Review addReview(int serviceId, Map<String, String> params, String username);
    List<Review> getProviderReviews(String username, Map<String, String> params);
    Review replyReview(int reviewId, String replyText, String username);
}
