package com.dmv.service;
import com.dmv.pojo.ServiceCategory;
import java.util.List;
import java.util.Map;

public interface ServiceCategoryService {
    List<ServiceCategory> getCategories();
    List<ServiceCategory> getCategories(Map<String, String> params);
    Long countCategories(Map<String, String> params);
    ServiceCategory getCategoryById(int id);
    ServiceCategory addOrUpdateCategory(Map<String, String> params);
    ServiceCategory toggleActive(int id);
}
