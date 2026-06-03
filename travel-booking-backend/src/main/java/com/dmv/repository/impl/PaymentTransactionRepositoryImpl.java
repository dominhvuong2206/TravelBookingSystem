package com.dmv.repository.impl;
import com.dmv.pojo.PaymentTransaction;
import com.dmv.repository.PaymentTransactionRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
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
        Query<PaymentTransaction> query = session.createQuery(
                "FROM PaymentTransaction p WHERE p.bookingId.id = :bookingId ORDER BY p.id DESC",
                PaymentTransaction.class
        );
        query.setParameter("bookingId", bookingId);
        query.setMaxResults(1);
        return query.getResultStream().findFirst().orElse(null);
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
        StringBuilder hql = new StringBuilder("SELECT p.status, count(p.id) FROM PaymentTransaction p WHERE 1 = 1");
        if (params != null && params.get("providerId") != null)
            hql.append(" AND p.bookingId.serviceId.providerId.id = :providerId");
        hql.append(" GROUP BY p.status");
        var query = session.createQuery(hql.toString(), Object[].class);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : query.getResultList())
            result.put((String) row[0], ((Number) row[1]).longValue());
        return result;
    }
    @Override
    public Map<String, Long> paidRevenueByPaymentMethod(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        StringBuilder hql = new StringBuilder(
                "SELECT p.paymentMethod, coalesce(sum(p.amount), 0) FROM PaymentTransaction p WHERE p.status = 'PAID'"
        );
        if (params != null && params.get("providerId") != null)
            hql.append(" AND p.bookingId.serviceId.providerId.id = :providerId");
        hql.append(" GROUP BY p.paymentMethod");
        var query = session.createQuery(hql.toString(), Object[].class);
        if (params != null && params.get("providerId") != null)
            query.setParameter("providerId", Integer.valueOf(params.get("providerId")));
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : query.getResultList())
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
            if (customerId != null && !customerId.isEmpty()) {
                predicates.add(b.equal(root.get("bookingId").get("customerId").get("id"), Integer.valueOf(customerId)));
            }
            String providerId = params.get("providerId");
            if (providerId != null && !providerId.isEmpty()) {
                predicates.add(b.equal(root.get("bookingId").get("serviceId").get("providerId").get("id"), Integer.valueOf(providerId)));
            }
            String status = params.get("status");
            if (status != null && !status.isEmpty()) {
                predicates.add(b.equal(root.get("status"), status));
            }
            String paymentMethod = params.get("paymentMethod");
            if (paymentMethod != null && !paymentMethod.isEmpty()) {
                predicates.add(b.equal(root.get("paymentMethod"), paymentMethod));
            }
        }
        return predicates;
    }
}
