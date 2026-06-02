package com.dmv.repository.impl;

import com.dmv.pojo.Booking;
import com.dmv.pojo.Review;
import com.dmv.pojo.TravelService;
import com.dmv.repository.TravelServiceRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Do Minh Vuong
 */
@Repository
@PropertySource("classpath:configs.properties")
@Transactional
public class TravelServiceRepositoryImpl implements TravelServiceRepository {
    @Autowired
    private Environment env;
    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public List<TravelService> getTravelServices(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<TravelService> q = b.createQuery(TravelService.class);
        Root<TravelService> root = q.from(TravelService.class);
        q.select(root);

        List<Predicate> predicates = buildPredicates(b, root, params);

        q.where(predicates.toArray(Predicate[]::new));
        applyOrder(b, q, root, params);

        Query<TravelService> query = session.createQuery(q);
        if (params != null) {
            int pageSize = this.env.getProperty("services.page_size", Integer.class, 20);
            int page = Math.max(1, Integer.parseInt(params.getOrDefault("page", "1")));
            int start = (page - 1) * pageSize;
            query.setMaxResults(pageSize);
            query.setFirstResult(start);
        }

        return query.getResultList();
    }

    @Override
    public Long countTravelServices(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<TravelService> root = q.from(TravelService.class);
        q.select(b.count(root));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        return session.createQuery(q).getSingleResult();
    }

    private List<Predicate> buildPredicates(CriteriaBuilder b, Root<TravelService> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();

        boolean allStatus = params != null && "true".equals(params.get("allStatus"));
        if (!allStatus) {
            predicates.add(b.or(b.isNull(root.get("status")), b.equal(root.get("status"), "ACTIVE")));
        }

        if (params != null) {
            String kw = params.get("kw");
            if (kw != null && !kw.isEmpty()) {
                predicates.add(b.like(b.lower(root.get("name")), String.format("%%%s%%", kw.toLowerCase())));
            }

            String fromPrice = params.get("fromPrice");
            if (fromPrice != null && !fromPrice.isEmpty()) {
                predicates.add(b.greaterThanOrEqualTo(root.get("price"), Long.valueOf(fromPrice)));
            }

            String toPrice = params.get("toPrice");
            if (toPrice != null && !toPrice.isEmpty()) {
                predicates.add(b.lessThanOrEqualTo(root.get("price"), Long.valueOf(toPrice)));
            }

            String cateId = params.get("cateId");
            if (cateId != null && !cateId.isEmpty()) {
                predicates.add(b.equal(root.get("categoryId").get("id"), Integer.valueOf(cateId)));
            }

            String location = params.get("location");
            if (location != null && !location.isEmpty()) {
                predicates.add(b.like(b.lower(root.get("location")), String.format("%%%s%%", location.toLowerCase())));
            }

            String departureDate = params.get("departureDate");
            if (departureDate != null && !departureDate.isEmpty()) {
                LocalDate date = LocalDate.parse(departureDate);
                Date startDate = Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
                Date endDate = Date.from(date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
                predicates.add(b.greaterThanOrEqualTo(root.get("departureDate"), startDate));
                predicates.add(b.lessThan(root.get("departureDate"), endDate));
            }

            String providerId = params.get("providerId");
            if (providerId != null && !providerId.isEmpty()) {
                predicates.add(b.equal(root.get("providerId").get("id"), Integer.valueOf(providerId)));
            }

            String status = params.get("status");
            if (status != null && !status.isEmpty()) {
                predicates.add(b.equal(root.get("status"), status));
            }
        }

        return predicates;
    }

    private void applyOrder(CriteriaBuilder b, CriteriaQuery<TravelService> q, Root<TravelService> root, Map<String, String> params) {
        String sort = params != null ? params.get("sort") : null;

        if ("priceAsc".equals(sort)) {
            q.orderBy(b.asc(root.get("price")), b.desc(root.get("id")));
        } else if ("priceDesc".equals(sort)) {
            q.orderBy(b.desc(root.get("price")), b.desc(root.get("id")));
        } else if ("departureDateAsc".equals(sort)) {
            q.orderBy(b.asc(root.get("departureDate")), b.desc(root.get("id")));
        } else if ("ratingDesc".equals(sort)) {
            Subquery<Double> avgRating = q.subquery(Double.class);
            Root<Review> reviewRoot = avgRating.from(Review.class);
            avgRating.select(b.avg(reviewRoot.get("rating")));
            avgRating.where(b.equal(reviewRoot.get("serviceId"), root));

            Expression<Double> rating = b.coalesce(avgRating, 0D);
            q.orderBy(b.desc(rating), b.desc(root.get("id")));
        } else if ("popularDesc".equals(sort)) {
            Subquery<Long> bookingCount = q.subquery(Long.class);
            Root<Booking> bookingRoot = bookingCount.from(Booking.class);
            bookingCount.select(b.count(bookingRoot));
            bookingCount.where(b.equal(bookingRoot.get("serviceId"), root));

            Expression<Long> popularity = b.coalesce(bookingCount, 0L);
            q.orderBy(b.desc(popularity), b.desc(root.get("id")));
        } else {
            q.orderBy(b.desc(root.get("id")));
        }
    }

    @Override
    public TravelService getTravelServiceById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(TravelService.class, id);
    }

    @Override
    public void addOrUpdateTravelService(TravelService p) {
        Session session = this.factory.getObject().getCurrentSession();
        if (p.getCreatedDate() == null) {
            p.setCreatedDate(new Date());
        }
        if (p.getStatus() == null) {
            p.setStatus("ACTIVE");
        }
        if (p.getId() != null) {
            session.merge(p);
        } else {
            session.persist(p);
        }
    }

    @Override
    public void deleteTravelService(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        TravelService p = this.getTravelServiceById(id);
        if (p != null) {
            session.remove(p);
        }
    }
}
