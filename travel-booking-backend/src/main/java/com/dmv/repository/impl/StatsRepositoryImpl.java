package com.dmv.repository.impl;
import com.dmv.pojo.Booking;
import com.dmv.pojo.PaymentTransaction;
import com.dmv.repository.StatsRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class StatsRepositoryImpl implements StatsRepository {
    @Autowired
    private LocalSessionFactoryBean factory;

    @Override
    public Long sumRevenue(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();

        if (params != null && "PAID".equals(params.get("paymentStatus"))) {
            CriteriaQuery<Long> q = b.createQuery(Long.class);
            Root<PaymentTransaction> ptRoot = q.from(PaymentTransaction.class);
            Join<PaymentTransaction, Booking> bookingJoin = ptRoot.join("bookingId", JoinType.INNER);

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(b.equal(ptRoot.get("status"), "PAID"));
            if (params.get("providerId") != null)
                predicates.add(b.equal(
                        bookingJoin.get("serviceId").get("providerId").get("id"),
                        Integer.valueOf(params.get("providerId"))
                ));
            q.select(b.coalesce(b.sum(ptRoot.get("amount")), 0L));
            q.where(predicates.toArray(Predicate[]::new));
            Long result = session.createQuery(q).getSingleResult();
            return result == null ? 0L : result;
        }

        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<Booking> root = q.from(Booking.class);
        List<Predicate> predicates = buildBookingPredicates(b, root, params);
        q.select(b.coalesce(b.sum(root.get("totalPrice")), 0L));
        q.where(predicates.toArray(Predicate[]::new));
        return session.createQuery(q).getSingleResult();
    }

    @Override
    public Map<Integer, Long> revenueByMonth(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<PaymentTransaction> ptRoot = q.from(PaymentTransaction.class);
        Join<PaymentTransaction, Booking> bookingJoin = ptRoot.join("bookingId", JoinType.INNER);

        Expression<Integer> monthExpr = b.function("MONTH", Integer.class, ptRoot.get("createdDate"));
        Expression<Integer> yearExpr  = b.function("YEAR",  Integer.class, ptRoot.get("createdDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.equal(yearExpr, year));
        predicates.add(b.equal(ptRoot.get("status"), "PAID"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    bookingJoin.get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(monthExpr, b.sum(ptRoot.get("amount")));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(monthExpr);

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 12; i++) result.put(i, 0L);
        for (Object[] row : session.createQuery(q).getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public Map<Integer, Long> revenueByQuarter(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<PaymentTransaction> ptRoot = q.from(PaymentTransaction.class);
        Join<PaymentTransaction, Booking> bookingJoin = ptRoot.join("bookingId", JoinType.INNER);

        Expression<Integer> quarterExpr = b.function("QUARTER", Integer.class, ptRoot.get("createdDate"));
        Expression<Integer> yearExpr    = b.function("YEAR",    Integer.class, ptRoot.get("createdDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.equal(yearExpr, year));
        predicates.add(b.equal(ptRoot.get("status"), "PAID"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    bookingJoin.get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(quarterExpr, b.sum(ptRoot.get("amount")));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(quarterExpr);

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 4; i++) result.put(i, 0L);
        for (Object[] row : session.createQuery(q).getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public Map<Integer, Long> revenueByYear(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<PaymentTransaction> ptRoot = q.from(PaymentTransaction.class);
        Join<PaymentTransaction, Booking> bookingJoin = ptRoot.join("bookingId", JoinType.INNER);

        Expression<Integer> yearExpr = b.function("YEAR", Integer.class, ptRoot.get("createdDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.equal(ptRoot.get("status"), "PAID"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    bookingJoin.get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(yearExpr, b.sum(ptRoot.get("amount")));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(yearExpr);
        q.orderBy(b.desc(yearExpr));

        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : session.createQuery(q).getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public Map<Integer, Long> bookingFrequencyByMonth(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<Booking> root = q.from(Booking.class);

        Expression<Integer> monthExpr = b.function("MONTH", Integer.class, root.get("createdDate"));
        Expression<Integer> yearExpr  = b.function("YEAR",  Integer.class, root.get("createdDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.equal(yearExpr, year));
        predicates.add(b.notEqual(root.get("status"), "CANCELLED"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    root.get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(monthExpr, b.count(root));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(monthExpr);

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 12; i++) result.put(i, 0L);
        for (Object[] row : session.createQuery(q).getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public Map<Integer, Long> bookingFrequencyByQuarter(int year, Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<Booking> root = q.from(Booking.class);

        Expression<Integer> quarterExpr = b.function("QUARTER", Integer.class, root.get("createdDate"));
        Expression<Integer> yearExpr    = b.function("YEAR",    Integer.class, root.get("createdDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.equal(yearExpr, year));
        predicates.add(b.notEqual(root.get("status"), "CANCELLED"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    root.get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(quarterExpr, b.count(root));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(quarterExpr);

        Map<Integer, Long> result = new HashMap<>();
        for (int i = 1; i <= 4; i++) result.put(i, 0L);
        for (Object[] row : session.createQuery(q).getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public Map<Integer, Long> bookingFrequencyByYear(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<Booking> root = q.from(Booking.class);

        Expression<Integer> yearExpr = b.function("YEAR", Integer.class, root.get("createdDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.notEqual(root.get("status"), "CANCELLED"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    root.get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(yearExpr, b.count(root));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(yearExpr);
        q.orderBy(b.desc(yearExpr));

        Map<Integer, Long> result = new HashMap<>();
        for (Object[] row : session.createQuery(q).getResultList())
            result.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public List<Map<String, Object>> statsByService(Integer providerId) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<Booking> root = q.from(Booking.class);
        Join<Booking, PaymentTransaction> ptJoin = root.join("paymentTransactionCollection", JoinType.LEFT);

        Expression<Long> bookingCountExpr = b.sum(
                b.<Long>selectCase()
                        .when(b.notEqual(root.get("status"), "CANCELLED"), 1L)
                        .otherwise(0L)
        );

        Expression<Long> paidRevenueExpr = b.coalesce(
                b.sum(
                        b.<Long>selectCase()
                                .when(b.equal(ptJoin.get("status"), "PAID"), ptJoin.<Long>get("amount"))
                                .otherwise(0L)
                ),
                0L
        );

        List<Predicate> predicates = new ArrayList<>();
        if (providerId != null)
            predicates.add(b.equal(root.get("serviceId").get("providerId").get("id"), providerId));

        q.multiselect(
                root.get("serviceId").get("id"),
                root.get("serviceNameSnapshot"),
                bookingCountExpr,
                paidRevenueExpr
        );
        if (!predicates.isEmpty())
            q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(root.get("serviceId").get("id"), root.get("serviceNameSnapshot"));
        q.orderBy(b.desc(paidRevenueExpr));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : session.createQuery(q).getResultList()) {
            Map<String, Object> item = new HashMap<>();
            item.put("serviceId", row[0]);
            item.put("serviceName", row[1]);
            item.put("bookingCount", ((Number) row[2]).longValue());
            item.put("paidRevenue", ((Number) row[3]).longValue());
            result.add(item);
        }
        return result;
    }

    // Helper: build booking predicates for sumRevenue fallback (non-PAID case)
    private List<Predicate> buildBookingPredicates(CriteriaBuilder b, Root<Booking> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();
        if (params == null) return predicates;
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
