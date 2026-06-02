package com.dmv.controllers;

import com.dmv.pojo.Review;
import com.dmv.service.ReviewService;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ApiReviewController {
    @Autowired
    private ReviewService reviewService;

    @GetMapping({"/services/{serviceId}/comments", "/services/{serviceId}/reviews"})
    public ResponseEntity<List<Review>> list(@PathVariable(value = "serviceId") int id, @RequestParam Map<String, String> params) {
        Map<String, String> filters = new HashMap<>(params);
        filters.put("serviceId", String.valueOf(id));
        return ResponseEntity.ok(this.reviewService.getReviews(filters));
    }

    @GetMapping({"/services/{serviceId}/comments/count", "/services/{serviceId}/reviews/count"})
    public ResponseEntity<Long> count(@PathVariable(value = "serviceId") int id) {
        Map<String, String> filters = new HashMap<>();
        filters.put("serviceId", String.valueOf(id));
        return ResponseEntity.ok(this.reviewService.countReviews(filters));
    }

    @GetMapping("/services/{serviceId}/rating-summary")
    public ResponseEntity<Map<String, Object>> ratingSummary(@PathVariable(value = "serviceId") int id) {
        Map<String, String> filters = new HashMap<>();
        filters.put("serviceId", String.valueOf(id));

        Map<String, Object> result = new HashMap<>();
        result.put("averageRating", this.reviewService.averageRating(id));
        result.put("totalReviews", this.reviewService.countReviews(filters));
        return ResponseEntity.ok(result);
    }

    @PostMapping({"/secure/services/{serviceId}/comments", "/secure/services/{serviceId}/reviews"})
    public ResponseEntity<?> addReview(@RequestBody Map<String, String> params, @PathVariable(value = "serviceId") int id, Principal principal) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(this.reviewService.addReview(id, params, principal.getName()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/secure/provider/reviews")
    public ResponseEntity<List<Review>> providerReviews(@RequestParam Map<String, String> params, Principal principal) {
        return ResponseEntity.ok(this.reviewService.getProviderReviews(principal.getName(), params));
    }

    @PutMapping("/secure/provider/reviews/{reviewId}/reply")
    public ResponseEntity<?> reply(@PathVariable(value = "reviewId") int reviewId, @RequestBody Map<String, String> params, Principal principal) {
        try {
            Review review = this.reviewService.replyReview(reviewId, params.get("replyText"), principal.getName());
            if (review == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(review);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
