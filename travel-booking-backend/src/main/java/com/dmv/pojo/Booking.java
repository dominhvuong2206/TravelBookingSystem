package com.dmv.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.io.Serializable;
import java.util.Collection;
import java.util.Date;

/**
 *
 * @author Do Minh Vuong
 */
@Entity
@Table(name = "booking")
public class Booking implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Basic(optional = false)
    @Column(name = "service_name_snapshot")
    private String serviceNameSnapshot;

    @Column(name = "unit_price")
    private Long unitPrice;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "total_price")
    private Long totalPrice;

    @Column(name = "status")
    private String status;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "note")
    private String note;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @JoinColumn(name = "service_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private TravelService serviceId;

    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private User customerId;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "bookingId")
    @JsonIgnore
    private Collection<PaymentTransaction> paymentTransactionCollection;

    public Booking() {
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getServiceNameSnapshot() { return serviceNameSnapshot; }
    public void setServiceNameSnapshot(String serviceNameSnapshot) { this.serviceNameSnapshot = serviceNameSnapshot; }
    public Long getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Long unitPrice) { this.unitPrice = unitPrice; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Long getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Long totalPrice) { this.totalPrice = totalPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public TravelService getServiceId() { return serviceId; }
    public void setServiceId(TravelService serviceId) { this.serviceId = serviceId; }
    public User getCustomerId() { return customerId; }
    public void setCustomerId(User customerId) { this.customerId = customerId; }
    public Collection<PaymentTransaction> getPaymentTransactionCollection() { return paymentTransactionCollection; }
    public void setPaymentTransactionCollection(Collection<PaymentTransaction> paymentTransactionCollection) { this.paymentTransactionCollection = paymentTransactionCollection; }
}