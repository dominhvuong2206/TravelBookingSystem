package com.dmv.repository.impl;

import com.dmv.pojo.Booking;
import com.dmv.pojo.CartItem;
import com.dmv.pojo.TravelService;
import com.dmv.repository.TravelServiceRepository;
import com.dmv.repository.BookingRepository;
import com.dmv.repository.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Do Minh Vuong
 */
@Repository
@Transactional
public class BookingRepositoryImpl implements BookingRepository {
    @Autowired
    private LocalSessionFactoryBean factory;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private TravelServiceRepository travelServiceRepo;

    @Override
    public void addBooking(List<CartItem> carts) {
        Session session = this.factory.getObject().getCurrentSession();
        var customer = this.userRepo.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());

        for (var c : carts) {
            TravelService service = this.travelServiceRepo.getTravelServiceById(c.getId());
            Booking booking = new Booking();
            booking.setServiceNameSnapshot(service.getName());
            booking.setUnitPrice(service.getPrice());
            booking.setQuantity(c.getQuantity());
            booking.setTotalPrice(service.getPrice() * c.getQuantity());
            booking.setStatus("PENDING");
            booking.setPaymentMethod("CASH");
            booking.setPaymentStatus("UNPAID");
            booking.setCreatedDate(new Date());
            booking.setServiceId(service);
            booking.setCustomerId(customer);

            Integer availableSlots = service.getAvailableSlots();
            if (availableSlots != null) {
                service.setAvailableSlots(Math.max(availableSlots - c.getQuantity(), 0));
                session.merge(service);
            }

            session.persist(booking);
        }
    }

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
    public Long sumRevenue(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();

        if (params != null && "PAID".equals(params.get("paymentStatus"))) {
            StringBuilder sql = new StringBuilder(
                    "SELECT COALESCE(SUM(p.amount), 0) FROM payment_transaction p " +
                    "JOIN booking b ON p.booking_id = b.id " +
                    "WHERE p.status = 'PAID'"
            );

            if (params.get("providerId") != null)
                sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

            var query = session.createNativeQuery(sql.toString());
            if (params.get("providerId") != null)
                query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

            Object value = query.getSingleResult();
            return value == null ? 0L : ((Number) value).longValue();
        }

        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<Booking> root = q.from(Booking.class);
        q.select(b.coalesce(b.sum(root.get("totalPrice")), 0L));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        return session.createQuery(q).getSingleResult();
    }

    @Override
    public Map<Integer, Long> revenueByMonth(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder(
                "SELECT MONTH(p.created_date), COALESCE(SUM(p.amount), 0) " +
                "FROM payment_transaction p " +
                "JOIN booking b ON p.booking_id = b.id " +
                "WHERE YEAR(p.created_date) = :year AND p.status = 'PAID'"
        );

        if (params != null && params.get("providerId") != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append(" GROUP BY MONTH(p.created_date)");

        var query = session.createNativeQuery(sql.toString(), Object[].class);
        query.setParameter("year", year);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 12; i++)
            result.put(i, 0L);

        for (Object[] row : query.getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        return result;
    }

    @Override
    public Map<Integer, Long> revenueByQuarter(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder(
                "SELECT QUARTER(p.created_date), COALESCE(SUM(p.amount), 0) " +
                "FROM payment_transaction p " +
                "JOIN booking b ON p.booking_id = b.id " +
                "WHERE YEAR(p.created_date) = :year AND p.status = 'PAID'"
        );

        if (params != null && params.get("providerId") != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append(" GROUP BY QUARTER(p.created_date)");

        var query = session.createNativeQuery(sql.toString(), Object[].class);
        query.setParameter("year", year);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 4; i++)
            result.put(i, 0L);

        for (Object[] row : query.getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        return result;
    }

    @Override
    public Map<Integer, Long> revenueByYear(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder(
                "SELECT YEAR(p.created_date), COALESCE(SUM(p.amount), 0) " +
                "FROM payment_transaction p " +
                "JOIN booking b ON p.booking_id = b.id " +
                "WHERE p.status = 'PAID'"
        );

        if (params != null && params.get("providerId") != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append(" GROUP BY YEAR(p.created_date) ORDER BY YEAR(p.created_date) DESC");

        var query = session.createNativeQuery(sql.toString(), Object[].class);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : query.getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        return result;
    }

    @Override
    public Map<Integer, Long> bookingFrequencyByMonth(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder(
                "SELECT MONTH(b.created_date), COUNT(b.id) " +
                "FROM booking b " +
                "WHERE YEAR(b.created_date) = :year AND b.status <> 'CANCELLED'"
        );

        if (params != null && params.get("providerId") != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append(" GROUP BY MONTH(b.created_date)");

        var query = session.createNativeQuery(sql.toString(), Object[].class);
        query.setParameter("year", year);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 12; i++)
            result.put(i, 0L);

        for (Object[] row : query.getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        return result;
    }

    @Override
    public Map<Integer, Long> bookingFrequencyByQuarter(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder(
                "SELECT QUARTER(b.created_date), COUNT(b.id) " +
                "FROM booking b " +
                "WHERE YEAR(b.created_date) = :year AND b.status <> 'CANCELLED'"
        );

        if (params != null && params.get("providerId") != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append(" GROUP BY QUARTER(b.created_date)");

        var query = session.createNativeQuery(sql.toString(), Object[].class);
        query.setParameter("year", year);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 4; i++)
            result.put(i, 0L);

        for (Object[] row : query.getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        return result;
    }

    @Override
    public Map<Integer, Long> bookingFrequencyByYear(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder(
                "SELECT YEAR(b.created_date), COUNT(b.id) " +
                "FROM booking b " +
                "WHERE b.status <> 'CANCELLED'"
        );

        if (params != null && params.get("providerId") != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append(" GROUP BY YEAR(b.created_date) ORDER BY YEAR(b.created_date) DESC");

        var query = session.createNativeQuery(sql.toString(), Object[].class);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));

        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : query.getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());

        return result;
    }

    @Override
    public List<Map<String, Object>> statsByService(Integer providerId) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder sql = new StringBuilder("""
            SELECT b.service_id,
                   b.service_name_snapshot,
                   SUM(CASE WHEN b.status <> 'CANCELLED' THEN 1 ELSE 0 END) AS booking_count,
                   COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END), 0) AS paid_revenue
            FROM booking b
            LEFT JOIN payment_transaction p ON p.booking_id = b.id
            WHERE 1 = 1
            """);

        if (providerId != null)
            sql.append(" AND b.service_id IN (SELECT ts.id FROM travel_service ts WHERE ts.provider_id = :providerId)");

        sql.append("""
            GROUP BY b.service_id, b.service_name_snapshot
            ORDER BY paid_revenue DESC
            """);

        List<Map<String, Object>> result = new ArrayList<>();
        var query = session.createNativeQuery(sql.toString(), Object[].class);
        if (providerId != null)
            query.setParameter("providerId", providerId);

        for (Object[] row : query.getResultList()) {
            Map<String, Object> item = new HashMap<>();
            item.put("serviceId", row[0]);
            item.put("serviceName", row[1]);
            item.put("bookingCount", ((Number) row[2]).longValue());
            item.put("paidRevenue", ((Number) row[3]).longValue());
            result.add(item);
        }

        return result;
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
