package com.dmv.repository.impl;
import com.dmv.pojo.ServiceCategory;
import com.dmv.repository.ServiceCategoryRepository;
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
public class ServiceCategoryRepositoryImpl implements ServiceCategoryRepository {
    @Autowired
    private LocalSessionFactoryBean factory;
    @Override
    public List<ServiceCategory> getCategories() {
        return this.getCategories(Map.of("active", "true"));
    }
    @Override
    public List<ServiceCategory> getCategories(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<ServiceCategory> q = b.createQuery(ServiceCategory.class);
        Root<ServiceCategory> root = q.from(ServiceCategory.class);
        q.select(root);
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        q.orderBy(b.asc(root.get("id")));
        Query<ServiceCategory> query = session.createQuery(q);
        if (params != null && params.get("page") != null) {
            int page = Math.max(1, Integer.parseInt(params.getOrDefault("page", "1")));
            int pageSize = 20;
            query.setFirstResult((page - 1) * pageSize);
            query.setMaxResults(pageSize);
        }
        return query.getResultList();
    }
    @Override
    public Long countCategories(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<ServiceCategory> root = q.from(ServiceCategory.class);
        q.select(b.count(root));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        return session.createQuery(q).getSingleResult();
    }
    @Override
    public ServiceCategory getCategoryById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(ServiceCategory.class, id);
    }
    @Override
    public ServiceCategory addOrUpdateCategory(ServiceCategory category) {
        Session session = this.factory.getObject().getCurrentSession();
        if (category.getId() == null) {
            session.persist(category);
            return category;
        }
        return (ServiceCategory) session.merge(category);
    }
    private List<Predicate> buildPredicates(CriteriaBuilder b, Root<ServiceCategory> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();
        if (params != null) {
            String active = params.get("active");
            if (active != null && !active.isBlank()) {
                predicates.add(b.equal(root.get("active"), Boolean.valueOf(active)));
            }
            String kw = params.get("kw");
            if (kw != null && !kw.isBlank()) {
                String pattern = String.format("%%%s%%", kw.toLowerCase());
                predicates.add(b.or(
                        b.like(b.lower(root.get("name")), pattern),
                        b.like(b.lower(root.get("slug")), pattern)
                ));
            }
        }
        return predicates;
    }
}
