package com.dmv.service.impl;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dmv.pojo.TravelService;
import com.dmv.pojo.User;
import com.dmv.repository.TravelServiceRepository;
import com.dmv.repository.UserRepository;
import com.dmv.service.TravelServiceService;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class TravelServiceServiceImpl implements TravelServiceService {
    @Autowired
    private TravelServiceRepository travelServiceRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private Cloudinary cloudinary;
    @Override
    public List<TravelService> getTravelServices(Map<String, String> params) {
        return this.travelServiceRepo.getTravelServices(params);
    }
    @Override
    public Long countTravelServices(Map<String, String> params) {
        return this.travelServiceRepo.countTravelServices(params);
    }
    @Override
    public void addOrUpdateTravelService(TravelService p) {
        if (p.getFile() != null && !p.getFile().isEmpty()) {
            try {
                Map res = this.cloudinary.uploader().upload(p.getFile().getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                p.setImage(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(TravelServiceServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        if (p.getProviderId() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                p.setProviderId(this.userRepo.getUserByUsername(auth.getName()));
            } else {
                User fallbackProvider = new User();
                fallbackProvider.setId(1);
                p.setProviderId(fallbackProvider);
            }
        }
        this.travelServiceRepo.addOrUpdateTravelService(p);
    }
    @Override
    public TravelService getTravelServiceById(int id) {
        return this.travelServiceRepo.getTravelServiceById(id);
    }
    @Override
    public void deleteTravelService(int id) {
        this.travelServiceRepo.deleteTravelService(id);
    }
}
