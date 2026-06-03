package com.dmv.controllers;
import com.dmv.pojo.TravelService;
import com.dmv.service.TravelServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class TravelServiceController {
    @Autowired
    private TravelServiceService travelServiceService;
    @GetMapping("/services")
    public String createView(Model model) {
        model.addAttribute("service", new TravelService());
        return "services";
    }
    @PostMapping("/services")
    public String create(@ModelAttribute(value = "service") TravelService p) {
        this.travelServiceService.addOrUpdateTravelService(p);
        return "redirect:/";
    }
    @GetMapping("/services/{serviceId}")
    public String updateView(Model model, @PathVariable(value = "serviceId") int id) {
        model.addAttribute("service", this.travelServiceService.getTravelServiceById(id));
        return "services";
    }
}
