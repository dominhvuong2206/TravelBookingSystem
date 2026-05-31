///*
// * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
// * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
// */
//package com.dht.repository.impl;
//
//import com.dht.hibernatedemov1.HibernateUtils;
//import com.dht.pojo.OrderDetail;
//import com.dht.pojo.Product;
//import com.dht.pojo.SaleOrder;
//import jakarta.persistence.criteria.CriteriaBuilder;
//import jakarta.persistence.criteria.CriteriaQuery;
//import jakarta.persistence.criteria.Join;
//import jakarta.persistence.criteria.JoinType;
//import jakarta.persistence.criteria.Root;
//import java.util.List;
//import org.hibernate.Session;
//import org.hibernate.query.Query;
//
///**
// *
// * @author huu-thanhduong
// */
//public class StatsRepositoryImpl {
//    public List<Object[]> statsRevenueByProduct() {
//        try (Session session = HibernateUtils.getFACTORY().openSession()) {
//            CriteriaBuilder b = session.getCriteriaBuilder();
//            CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
//            
//            Root root = q.from(OrderDetail.class);
//            Join<OrderDetail, Product> join = root.join("productId", JoinType.INNER);
//            
//            q.multiselect(join.get("id"), join.get("name"), 
//                    b.sum(b.prod(root.get("unitPrice"), root.get("quantity"))));
//            q.groupBy(join.get("id"));
//            
//            
//            Query query = session.createQuery(q);
//            return query.getResultList();
//        }
//    }
//    
//    public List<Object[]> statsRevenueByTime(String time, int year) {
//        try (Session session = HibernateUtils.getFACTORY().openSession()) {
//            CriteriaBuilder b = session.getCriteriaBuilder();
//            CriteriaQuery<Object[]> q = b.createQuery(Object[].class);
//            
//            Root root = q.from(OrderDetail.class);
//            Join<OrderDetail, SaleOrder> join = root.join("orderId", JoinType.INNER);
//            
//            q.multiselect(b.function(time, Integer.class, join.get("createdDate")), 
//                    b.sum(b.prod(root.get("unitPrice"), root.get("quantity"))));
//            
//            q.where(b.equal(b.function("YEAR", Integer.class, join.get("createdDate")), year));
//            
//            q.groupBy(b.function(time, Integer.class, join.get("createdDate")));
//            
//            
//            Query query = session.createQuery(q);
//            return query.getResultList();
//        }
//    }
//}
