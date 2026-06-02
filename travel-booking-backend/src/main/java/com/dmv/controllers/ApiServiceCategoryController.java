package com.dmv.controllers;

import com.dmv.pojo.ServiceCategory;
import com.dmv.service.ServiceCategoryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Do Minh Vuong
 */
@RestController
@RequestMapping("/api")
public class ApiServiceCategoryController {
    @Autowired
    private ServiceCategoryService serviceCategoryService;

    @GetMapping("/categories")
    @CrossOrigin
    public ResponseEntity<List<ServiceCategory>> list() {
        return new ResponseEntity<>(this.serviceCategoryService.getCategories(), HttpStatus.OK);
    }
}