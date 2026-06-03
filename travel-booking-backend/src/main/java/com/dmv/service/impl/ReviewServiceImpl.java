package com.dmv.service.impl;
import com.dmv.pojo.Review;
import com.dmv.pojo.TravelService;
import com.dmv.pojo.User;
import com.dmv.repository.BookingRepository;
import com.dmv.repository.ReviewRepository;
import com.dmv.repository.TravelServiceRepository;
import com.dmv.repository.UserRepository;
import com.dmv.service.ReviewService;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {
    @Autowired
    private ReviewRepository reviewRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private TravelServiceRepository travelServiceRepo;
    @Autowired
    private BookingRepository bookingRepo;
    @Override
    public List<Review> getReviews(Map<String, String> params) {
        return this.reviewRepo.getReviews(params);
    }
    @Override
    public Long countReviews(Map<String, String> params) {
        return this.reviewRepo.countReviews(params);
    }
    @Override
    public Double averageRating(int serviceId) {
        return this.reviewRepo.averageRating(serviceId);
    }
    @Override
    public Review addReview(int serviceId, Map<String, String> params, String username) {
        User customer = this.userRepo.getUserByUsername(username);
        TravelService service = this.travelServiceRepo.getTravelServiceById(serviceId);
        if (service == null)
            throw new IllegalArgumentException("Dá»‹ch vá»¥ khÃ´ng tá»“n táº¡i.");
        Map<String, String> bookingFilter = new HashMap<>();
        bookingFilter.put("customerId", String.valueOf(customer.getId()));
        bookingFilter.put("serviceId", String.valueOf(serviceId));
        Long bookings = this.bookingRepo.countBookings(bookingFilter);
        if (bookings == 0)
            throw new IllegalArgumentException("Báº¡n cáº§n Ä‘áº·t dá»‹ch vá»¥ trÆ°á»›c khi Ä‘Ã¡nh giÃ¡.");
        int rating = Integer.parseInt(params.getOrDefault("rating", "5"));
        if (rating < 1 || rating > 5)
            throw new IllegalArgumentException("Sá»‘ sao Ä‘Ã¡nh giÃ¡ pháº£i tá»« 1 Ä‘áº¿n 5.");
        Review review = new Review();
        review.setRating(rating);
        review.setComment(params.get("comment"));
        review.setCreatedDate(new Date());
        review.setCustomerId(customer);
        review.setServiceId(service);
        return this.reviewRepo.addReview(review);
    }
    @Override
    public List<Review> getProviderReviews(String username, Map<String, String> params) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>(params);
        filters.put("providerId", String.valueOf(provider.getId()));
        return this.reviewRepo.getReviews(filters);
    }
    @Override
    public Review replyReview(int reviewId, String replyText, String username) {
        User provider = this.userRepo.getUserByUsername(username);
        Review review = this.reviewRepo.getReviewById(reviewId);
        if (review == null)
            return null;
        if (!review.getServiceId().getProviderId().getId().equals(provider.getId()))
            throw new IllegalArgumentException("Báº¡n khÃ´ng cÃ³ quyá»n pháº£n há»“i Ä‘Ã¡nh giÃ¡ nÃ y.");
        review.setReplyText(replyText);
        review.setReplyDate(new Date());
        return this.reviewRepo.updateReview(review);
    }
}
