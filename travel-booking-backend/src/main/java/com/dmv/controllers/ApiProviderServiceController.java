package com.dmv.controllers;
import com.dmv.pojo.ServiceCategory;
import com.dmv.pojo.TravelService;
import com.dmv.pojo.User;
import com.dmv.service.TravelServiceService;
import com.dmv.service.UserService;
import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/secure/provider")
@CrossOrigin
public class ApiProviderServiceController {
    @Autowired
    private TravelServiceService travelServiceService;
    @Autowired
    private UserService userService;
    @GetMapping("/services")
    public ResponseEntity<?> getProviderServices(@RequestParam Map<String, String> params, Principal principal) {
        User provider = getApprovedProvider(principal);
        if (provider == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản nhà cung cấp chưa được duyệt.");
        Map<String, String> filters = buildProviderFilters(params, provider);
        List<TravelService> services = this.travelServiceService.getTravelServices(filters);
        return ResponseEntity.ok(services);
    }
    @GetMapping("/services/count")
    public ResponseEntity<?> countProviderServices(@RequestParam Map<String, String> params, Principal principal) {
        User provider = getApprovedProvider(principal);
        if (provider == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản nhà cung cấp chưa được duyệt.");
        Map<String, String> filters = buildProviderFilters(params, provider);
        return ResponseEntity.ok(this.travelServiceService.countTravelServices(filters));
    }
    @PostMapping(path = "/services", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProviderService(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Principal principal) {
        User provider = getApprovedProvider(principal);
        if (provider == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản nhà cung cấp chưa được duyệt.");
        TravelService service = buildService(params, new TravelService());
        service.setProviderId(provider);
        service.setCreatedDate(new Date());
        service.setFile(image);
        this.travelServiceService.addOrUpdateTravelService(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(service);
    }
    @PutMapping(path = "/services/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProviderService(
            @PathVariable(value = "id") int id,
            @RequestParam Map<String, String> params,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Principal principal) {
        User provider = getApprovedProvider(principal);
        if (provider == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản nhà cung cấp chưa được duyệt.");
        TravelService service = getOwnedService(id, provider);
        if (service == null)
            return ResponseEntity.notFound().build();
        buildService(params, service);
        service.setFile(image);
        this.travelServiceService.addOrUpdateTravelService(service);
        return ResponseEntity.ok(service);
    }
    @PutMapping("/services/{id}/toggle-status")
    public ResponseEntity<?> toggleProviderServiceStatus(@PathVariable(value = "id") int id, Principal principal) {
        User provider = getApprovedProvider(principal);
        if (provider == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản nhà cung cấp chưa được duyệt.");
        TravelService service = getOwnedService(id, provider);
        if (service == null)
            return ResponseEntity.notFound().build();
        service.setStatus("ACTIVE".equals(service.getStatus()) ? "INACTIVE" : "ACTIVE");
        this.travelServiceService.addOrUpdateTravelService(service);
        return ResponseEntity.ok(service);
    }
    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteProviderService(@PathVariable(value = "id") int id, Principal principal) {
        User provider = getApprovedProvider(principal);
        if (provider == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản nhà cung cấp chưa được duyệt.");
        TravelService service = getOwnedService(id, provider);
        if (service == null)
            return ResponseEntity.notFound().build();
        this.travelServiceService.deleteTravelService(id);
        return ResponseEntity.noContent().build();
    }
    private Map<String, String> buildProviderFilters(Map<String, String> params, User provider) {
        Map<String, String> filters = new HashMap<>(params);
        filters.put("providerId", String.valueOf(provider.getId()));
        filters.put("allStatus", "true");
        return filters;
    }
    private TravelService getOwnedService(int id, User provider) {
        TravelService service = this.travelServiceService.getTravelServiceById(id);
        if (service == null || !service.getProviderId().getId().equals(provider.getId()))
            return null;
        return service;
    }
    private User getApprovedProvider(Principal principal) {
        User provider = this.userService.getUserByUsername(principal.getName());
        if (provider == null || !Boolean.TRUE.equals(provider.getActive()) || !Boolean.TRUE.equals(provider.getApproved()))
            return null;
        return provider;
    }
    private TravelService buildService(Map<String, String> params, TravelService service) {
        service.setName(params.get("name"));
        service.setDescription(params.get("description"));
        service.setLocation(params.get("location"));
        service.setDepartureLocation(params.get("departureLocation"));
        service.setStatus(params.getOrDefault("status", "ACTIVE"));
        String price = params.get("price");
        if (price != null && !price.isBlank())
            service.setPrice(Long.valueOf(price));
        String slots = params.get("availableSlots");
        if (slots != null && !slots.isBlank())
            service.setAvailableSlots(Integer.valueOf(slots));
        String categoryId = params.get("categoryId");
        if (categoryId != null && !categoryId.isBlank())
            service.setCategoryId(new ServiceCategory(Integer.valueOf(categoryId)));
        String departureDate = params.get("departureDate");
        if (departureDate != null && !departureDate.isBlank()) {
            try {
                service.setDepartureDate(new SimpleDateFormat("yyyy-MM-dd").parse(departureDate));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Ngày khởi hành không hợp lệ.");
            }
        }
        return service;
    }
}
