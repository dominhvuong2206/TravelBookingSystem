package com.dmv.service.impl;
import com.dmv.pojo.ServiceCategory;
import com.dmv.repository.ServiceCategoryRepository;
import com.dmv.service.ServiceCategoryService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class ServiceCategoryServiceImpl implements ServiceCategoryService {
    @Autowired
    private ServiceCategoryRepository serviceCategoryRepo;
    @Override
    public List<ServiceCategory> getCategories() {
        return this.serviceCategoryRepo.getCategories();
    }
    @Override
    public List<ServiceCategory> getCategories(Map<String, String> params) {
        return this.serviceCategoryRepo.getCategories(params);
    }
    @Override
    public Long countCategories(Map<String, String> params) {
        return this.serviceCategoryRepo.countCategories(params);
    }
    @Override
    public ServiceCategory getCategoryById(int id) {
        return this.serviceCategoryRepo.getCategoryById(id);
    }
    @Override
    public ServiceCategory addOrUpdateCategory(Map<String, String> params) {
        ServiceCategory category;
        String id = params.get("id");
        if (id != null && !id.isBlank()) {
            category = this.getCategoryById(Integer.parseInt(id));
            if (category == null)
                return null;
        } else {
            category = new ServiceCategory();
        }
        category.setName(params.get("name"));
        category.setSlug(params.get("slug"));
        category.setDescription(params.get("description"));
        category.setActive(Boolean.valueOf(params.getOrDefault("active", "true")));
        return this.serviceCategoryRepo.addOrUpdateCategory(category);
    }
    @Override
    public ServiceCategory toggleActive(int id) {
        ServiceCategory category = this.getCategoryById(id);
        if (category == null)
            return null;
        category.setActive(!Boolean.TRUE.equals(category.getActive()));
        return this.serviceCategoryRepo.addOrUpdateCategory(category);
    }
}
