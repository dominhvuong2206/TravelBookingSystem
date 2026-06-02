/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.repository.impl;

import com.dmv.pojo.User;
import com.dmv.repository.UserRepository;
import jakarta.persistence.NoResultException;
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
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Do Minh Vuong
 */
@Repository
@Transactional
@PropertySource("classpath:configs.properties")
public class UserRepositoryImpl implements UserRepository {

    @Autowired
    private LocalSessionFactoryBean factory;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private Environment env;

    @Override
    public User getUserByUsername(String username) {
        Session session = this.factory.getObject().getCurrentSession();
        Query q = session.createNamedQuery("User.findByUsername", User.class);
        q.setParameter("username", username);

        try {
            return (User) q.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }

    }

    @Override
    public User getUserById(int id) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.get(User.class, id);
    }

    @Override
    public List<User> getUsers(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<User> q = b.createQuery(User.class);
        Root<User> root = q.from(User.class);

        q.select(root);
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));
        q.orderBy(b.desc(root.get("id")));

        Query<User> query = session.createQuery(q);
        if (params != null && params.containsKey("page")) {
            int page = Integer.parseInt(params.getOrDefault("page", "1"));
            int pageSize = this.env.getProperty("user.page_size", Integer.class, 20);
            query.setFirstResult((page - 1) * pageSize);
            query.setMaxResults(pageSize);
        }

        return query.getResultList();
    }

    @Override
    public Long countUsers(Map<String, String> params) {
        Session session = this.factory.getObject().getCurrentSession();
        CriteriaBuilder b = session.getCriteriaBuilder();
        CriteriaQuery<Long> q = b.createQuery(Long.class);
        Root<User> root = q.from(User.class);

        q.select(b.count(root));
        q.where(buildPredicates(b, root, params).toArray(Predicate[]::new));

        return session.createQuery(q).getSingleResult();
    }

    private List<Predicate> buildPredicates(CriteriaBuilder b, Root<User> root, Map<String, String> params) {
        List<Predicate> predicates = new ArrayList<>();
        if (params == null)
            return predicates;

        String role = params.get("role");
        if (role != null && !role.isBlank())
            predicates.add(b.equal(root.get("userRole"), role));

        String approved = params.get("approved");
        if (approved != null && !approved.isBlank())
            predicates.add(b.equal(root.get("approved"), Boolean.parseBoolean(approved)));

        String active = params.get("active");
        if (active != null && !active.isBlank())
            predicates.add(b.equal(root.get("active"), Boolean.parseBoolean(active)));

        String kw = params.get("kw");
        if (kw != null && !kw.isBlank()) {
            String pattern = "%" + kw.trim().toLowerCase() + "%";
            predicates.add(b.or(
                    b.like(b.lower(root.get("firstName")), pattern),
                    b.like(b.lower(root.get("lastName")), pattern),
                    b.like(b.lower(root.get("username")), pattern),
                    b.like(b.lower(root.get("email")), pattern)
            ));
        }

        return predicates;
    }

    @Override
    public User addUser(User u) {
        Session session = this.factory.getObject().getCurrentSession();
        session.persist(u);
        
        return u;
    }

    @Override
    public User updateUser(User u) {
        Session session = this.factory.getObject().getCurrentSession();
        return session.merge(u);
    }

    @Override
    public boolean authenticate(String username, String password) {
        User u = this.getUserByUsername(username);
        if (u == null)
            return false;

        return this.passwordEncoder.matches(password, u.getPassword());
    }
}
