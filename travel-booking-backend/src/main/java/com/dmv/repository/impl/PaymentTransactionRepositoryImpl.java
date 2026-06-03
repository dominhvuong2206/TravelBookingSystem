package com.dmv.repository.impl;
import com.dmv.pojo.Booking;
import com.dmv.pojo.PaymentTransaction;
import com.dmv.repository.PaymentTransactionRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.HashMap;
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

@Repository
@PropertySource("classpath:configs.properties")
@Transactional
public class PaymentTransactionRepositoryImpl implements PaymentTransactionRepository {
    @Autowired
    private LocalSessionFactoryBean factory;
    @Autowired
    private Environment env;

    @Override
    public PaymentTransaction addTransaction(PaymentTransaction transaction) {
        Session session = this.factory.getObject().getCurrentSession();
        session.persist(transaction);
        return transaction;
    }

    @Override
    public PaymentTransaction getTransactionById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(PaymentTransaction.class, id);
    }

    @Override
    public PaymentTransaction getTransactionByBookingId(int bookingId) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<PaymentTransaction> q = b.createQuery(PaymentTransaction.class);
        Root<PaymentTransaction> root = q.from(PaymentTransaction.class);
        q.select(root);
        q.where(b.equal(root.get("bookingId").get("id"), bookingId));
        q.orderBy(b.desc(root.get("id")));
        return session.createQuery(q)
                .setMaxResults(1)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<PaymentTransaction> getTransactions(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<PaymentTransaction> q = b.createQuery(PaymentTransaction.class);
        Root<PaymentTransaction> root = q.from(PaymentTransaction.class);
        q.select(root);
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        q.orderBy(b.desc(root.get("id")));
        Query<PaymentTransaction> query = session.createQuery(q);
        if (params != null) {
            int pageSize = this.env.getProperty("services.page_size", Integer.class, 20);
            int page = Math.max(1, Integer.parseInt(params.getOrDefault("page", "1")));
            query.setMaxResults(pageSize);
            query.setFirstResult((page - 1) * pageSize);
        }
        return query.getResultList();
    }

    @Override
    public Long countTransactions(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<PaymentTransaction> root = q.from(PaymentTransaction.class);
        q.select(b.count(root));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        return session.createQuery(q).getSingleResult();
    }

    @Override
    public Map<String, Long> countByStatus(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<PaymentTransaction> root = q.from(PaymentTransaction.class);

        List<Predicate> predicates = new ArrayList<>();
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    root.get("bookingId").get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(root.get("status"), b.count(root));
        if (!predicates.isEmpty())
            q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(root.get("status"));

        Map<String, Long> result = new HashMap<>();
        for (Object[] row : session.createQuery(q).getResultList())
            result.put((String) row[0], ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public Map<String, Long> paidRevenueByPaymentMethod(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
        Root<PaymentTransaction> root = q.from(PaymentTransaction.class);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(b.equal(root.get("status"), "PAID"));
        if (params != null && params.get("providerId") != null)
            predicates.add(b.equal(
                    root.get("bookingId").get("serviceId").get("providerId").get("id"),
                    Integer.valueOf(params.get("providerId"))
            ));

        q.multiselect(root.get("paymentMethod"), b.coalesce(b.sum(root.get("amount")), 0L));
        q.where(predicates.toArray(Predicate[]::new));
        q.groupBy(root.get("paymentMethod"));

        Map<String, Long> result = new HashMap<>();
        for (Object[] row : session.createQuery(q).getResultList())
            result.put((String) row[0], ((Number) row[1]).longValue());
        return result;
    }

    @Override
    public PaymentTransaction updateTransaction(PaymentTransaction transaction) {
        Session session = this.factory.getObject().getCurrentSession();
        return (PaymentTransaction) session.merge(transaction);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder b, Root<PaymentTransaction> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();
        if (params != null) {
            String customerId = params.get("customerId");
            if (customerId != null && !customerId.isEmpty())
                predicates.add(b.equal(root.get("bookingId").get("customerId").get("id"), Integer.valueOf(customerId)));
            String providerId = params.get("providerId");
            if (providerId != null && !providerId.isEmpty())
                predicates.add(b.equal(root.get("bookingId").get("serviceId").get("providerId").get("id"), Integer.valueOf(providerId)));
            String status = params.get("status");
            if (status != null && !status.isEmpty())
                predicates.add(b.equal(root.get("status"), status));
            String paymentMethod = params.get("paymentMethod");
            if (paymentMethod != null && !paymentMethod.isEmpty())
                predicates.add(b.equal(root.get("paymentMethod"), paymentMethod));
        }
        return predicates;
    }
}
