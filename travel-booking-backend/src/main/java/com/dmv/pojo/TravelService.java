package com.dmv.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Do Minh Vuong
 */
@Entity
@Table(name = "travel_service")
@NamedQueries({
    @NamedQuery(name = "TravelService.findAll", query = "SELECT t FROM TravelService t"),
    @NamedQuery(name = "TravelService.findById", query = "SELECT t FROM TravelService t WHERE t.id = :id")
})
@JsonIgnoreProperties(value = {"bookingCollection", "reviewCollection"})
public class TravelService implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;

    @Basic(optional = false)
    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price")
    private Long price;

    @Column(name = "image")
    private String image;

    @Column(name = "location")
    private String location;

    @Column(name = "departure_location")
    private String departureLocation;

    @Column(name = "departure_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date departureDate;

    @Column(name = "available_slots")
    private Integer availableSlots;

    @Column(name = "status")
    private String status;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @JoinColumn(name = "category_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private ServiceCategory categoryId;

    @JoinColumn(name = "provider_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private User providerId;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "serviceId")
    @JsonIgnore
    private Collection<Booking> bookingCollection;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "serviceId")
    @JsonIgnore
    private Collection<Review> reviewCollection;

    @Transient
    private MultipartFile file;

    public TravelService() {
    }

    public TravelService(Integer id) {
        this.id = id;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDepartureLocation() { return departureLocation; }
    public void setDepartureLocation(String departureLocation) { this.departureLocation = departureLocation; }
    public Date getDepartureDate() { return departureDate; }
    public void setDepartureDate(Date departureDate) { this.departureDate = departureDate; }
    public Integer getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(Integer availableSlots) { this.availableSlots = availableSlots; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public ServiceCategory getCategoryId() { return categoryId; }
    public void setCategoryId(ServiceCategory categoryId) { this.categoryId = categoryId; }
    public User getProviderId() { return providerId; }
    public void setProviderId(User providerId) { this.providerId = providerId; }
    public Collection<Booking> getBookingCollection() { return bookingCollection; }
    public void setBookingCollection(Collection<Booking> bookingCollection) { this.bookingCollection = bookingCollection; }
    public Collection<Review> getReviewCollection() { return reviewCollection; }
    public void setReviewCollection(Collection<Review> reviewCollection) { this.reviewCollection = reviewCollection; }
    public MultipartFile getFile() { return file; }
    public void setFile(MultipartFile file) { this.file = file; }
}