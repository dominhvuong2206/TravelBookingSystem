/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dht.repository.impl;

import com.dht.pojo.CartItem;
import com.dht.pojo.OrderDetail;
import com.dht.pojo.SaleOrder;
import com.dht.repository.ProductRepository;
import com.dht.repository.ReceiptRepository;
import com.dht.repository.UserRepository;
import java.util.Date;
import java.util.List;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author huu-thanhduong
 */
@Repository
@Transactional
public class ReceiptRepositoryImpl implements ReceiptRepository {

    @Autowired
    private LocalSessionFactoryBean factory;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private ProductRepository prodRepo;

    @Override
    public void addReceipt(List<CartItem> carts) {
        Session session = this.factory.getObject().getCurrentSession();
        SaleOrder r = new SaleOrder();
        r.setCreatedDate(new Date());
        r.setUserId(this.userRepo.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()));

        session.persist(r);

        for (var c : carts) {
            OrderDetail d = new OrderDetail();
            d.setQuantity(c.getQuantity());
            d.setUnitPrice(c.getPrice());
            d.setProductId(this.prodRepo.getProductById(c.getId()));
            d.setOrderId(r);

            session.persist(d);
        }
    }

}
