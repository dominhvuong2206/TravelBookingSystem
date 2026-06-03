package com.dmv.controllers;
import com.dmv.service.ServiceCategoryService;
import com.dmv.service.TravelServiceService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@ControllerAdvice
public class HomeController {
    @Autowired
    private ServiceCategoryService serviceCategoryService;
    @Autowired
    private TravelServiceService travelServiceService;
    @ModelAttribute
    public void commonResponses(Model model) {
        model.addAttribute("categories", this.serviceCategoryService.getCategories());
    }
    @RequestMapping("/")
    public String index(Model model, @RequestParam Map<String, String> params) {
        model.addAttribute("services", this.travelServiceService.getTravelServices(params));
        return "index";
    }
}
