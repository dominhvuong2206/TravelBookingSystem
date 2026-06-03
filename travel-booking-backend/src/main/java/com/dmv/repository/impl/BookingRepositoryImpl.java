package com.dmv.repository.impl;
import com.dmv.pojo.Booking;
import com.dmv.repository.BookingRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class BookingRepositoryImpl implements BookingRepository {
    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public Booking addBooking(Booking booking) {
        Session session = this.factory.getObject().getCurrentSession();
        session.persist(booking);
        return booking;
    }

    @Override
    public Booking getBookingById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(Booking.class, id);
    }

    @Override
    public List<Booking> getBookings(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Booking> q = b.createQuery(Booking.class);
        Root<Booking> root = q.from(Booking.class);
        q.select(root);
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        q.orderBy(b.desc(root.get("id")));
        var query = session.createQuery(q);
        if (params != null && params.containsKey("page")) {
            int page = Integer.parseInt(params.getOrDefault("page", "1"));
            int pageSize = 20;
            query.setFirstResult((page - 1) * pageSize);
            query.setMaxResults(pageSize);
        }
        return query.getResultList();
    }

    @Override
    public Long countBookings(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<Booking> root = q.from(Booking.class);
        q.select(b.count(root));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        return session.createQuery(q).getSingleResult();
    }

    @Override
    public Booking updateBooking(Booking booking) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.merge(booking);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder b, Root<Booking> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();
        if (params == null)
            return predicates;
        String customerId = params.get("customerId");
        if (customerId != null && !customerId.isBlank())
            predicates.add(b.equal(root.get("customerId").get("id"), Integer.valueOf(customerId)));
        String serviceId = params.get("serviceId");
        if (serviceId != null && !serviceId.isBlank())
            predicates.add(b.equal(root.get("serviceId").get("id"), Integer.valueOf(serviceId)));
        String providerId = params.get("providerId");
        if (providerId != null && !providerId.isBlank())
            predicates.add(b.equal(root.get("serviceId").get("providerId").get("id"), Integer.valueOf(providerId)));
        String status = params.get("status");
        if (status != null && !status.isBlank())
            predicates.add(b.equal(root.get("status"), status));
        String notStatus = params.get("notStatus");
        if (notStatus != null && !notStatus.isBlank())
            predicates.add(b.notEqual(root.get("status"), notStatus));
        String paymentStatus = params.get("paymentStatus");
        if (paymentStatus != null && !paymentStatus.isBlank())
            predicates.add(b.equal(root.get("paymentStatus"), paymentStatus));
        return predicates;
    }
}
