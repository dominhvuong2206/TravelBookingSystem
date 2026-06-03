package com.dmv.repository;
import com.dmv.pojo.ServiceCategory;
import java.util.List;
import java.util.Map;

public interface ServiceCategoryRepository {
    List<ServiceCategory> getCategories();
    List<ServiceCategory> getCategories(Map<String, String> params);
    Long countCategories(Map<String, String> params);
    ServiceCategory getCategoryById(int id);
    ServiceCategory addOrUpdateCategory(ServiceCategory category);
}
