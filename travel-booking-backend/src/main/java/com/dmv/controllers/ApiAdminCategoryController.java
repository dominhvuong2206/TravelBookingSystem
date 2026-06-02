package com.dmv.controllers;

import com.dmv.pojo.ServiceCategory;
import com.dmv.service.ServiceCategoryService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure/admin/categories")
@CrossOrigin
public class ApiAdminCategoryController {
    @Autowired
    private ServiceCategoryService serviceCategoryService;

    @GetMapping
    public ResponseEntity<List<ServiceCategory>> list(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(this.serviceCategoryService.getCategories(params));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(this.serviceCategoryService.countCategories(params));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> params) {
        try {
            ServiceCategory category = this.serviceCategoryService.addOrUpdateCategory(params);
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<?> update(@PathVariable(value = "categoryId") int categoryId, @RequestBody Map<String, String> params) {
        try {
            params.put("id", String.valueOf(categoryId));
            ServiceCategory category = this.serviceCategoryService.addOrUpdateCategory(params);
            if (category == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(category);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{categoryId}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable(value = "categoryId") int categoryId) {
        ServiceCategory category = this.serviceCategoryService.toggleActive(categoryId);
        if (category == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(category);
    }
}
