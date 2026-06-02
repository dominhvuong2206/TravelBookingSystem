package com.dmv.repository.impl;

import com.dmv.pojo.Review;
import com.dmv.repository.ReviewRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class ReviewRepositoryImpl implements ReviewRepository {
    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public List<Review> getReviews(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Review> q = b.createQuery(Review.class);
        Root<Review> root = q.from(Review.class);

        q.select(root);
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        q.orderBy(b.desc(root.get("id")));

        Query<Review> query = session.createQuery(q);
        if (params != null && params.containsKey("page")) {
            int page = Integer.parseInt(params.getOrDefault("page", "1"));
            int pageSize = Integer.parseInt(params.getOrDefault("pageSize", "5"));
            query.setFirstResult((page - 1) * pageSize);
            query.setMaxResults(pageSize);
        }

        return query.getResultList();
    }

    @Override
    public Long countReviews(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<Review> root = q.from(Review.class);

        q.select(b.count(root));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));

        return session.createQuery(q).getSingleResult();
    }

    @Override
    public Double averageRating(int serviceId) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Double> q = b.createQuery(Double.class);
        Root<Review> root = q.from(Review.class);

        q.select(b.avg(root.get("rating")));
        q.where(b.equal(root.get("serviceId").get("id"), serviceId));

        Double result = session.createQuery(q).getSingleResult();
        return result != null ? result : 0.0;
    }

    @Override
    public Review getReviewById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(Review.class, id);
    }

    @Override
    public Review addReview(Review c) {
        Session session = this.factory.getObject().getCurrentSession();
        session.persist(c);
        return c;
    }

    @Override
    public Review updateReview(Review c) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.merge(c);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder b, Root<Review> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();
        if (params == null)
            return predicates;

        String serviceId = params.get("serviceId");
        if (serviceId != null && !serviceId.isBlank())
            predicates.add(b.equal(root.get("serviceId").get("id"), Integer.valueOf(serviceId)));

        String providerId = params.get("providerId");
        if (providerId != null && !providerId.isBlank())
            predicates.add(b.equal(root.get("serviceId").get("providerId").get("id"), Integer.valueOf(providerId)));

        String customerId = params.get("customerId");
        if (customerId != null && !customerId.isBlank())
            predicates.add(b.equal(root.get("customerId").get("id"), Integer.valueOf(customerId)));

        return predicates;
    }
}
