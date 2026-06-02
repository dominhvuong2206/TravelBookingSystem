package com.dmv.controllers;

import com.dmv.pojo.TravelService;
import com.dmv.service.TravelServiceService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Do Minh Vuong
 */
@RestController
@RequestMapping("/api")
@CrossOrigin
public class ApiTravelServiceController {
    @Autowired
    private TravelServiceService travelServiceService;

    @GetMapping("/services")
    public ResponseEntity<List<TravelService>> list(@RequestParam Map<String, String> params) {
        return new ResponseEntity<>(this.travelServiceService.getTravelServices(params), HttpStatus.OK);
    }

    @GetMapping("/services/count")
    public ResponseEntity<Long> count(@RequestParam Map<String, String> params) {
        return new ResponseEntity<>(this.travelServiceService.countTravelServices(params), HttpStatus.OK);
    }

    @GetMapping("/services/{serviceId}")
    public ResponseEntity<TravelService> details(@PathVariable(value = "serviceId") int id) {
        return new ResponseEntity<>(this.travelServiceService.getTravelServiceById(id), HttpStatus.OK);
    }

    @DeleteMapping("/services/{serviceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable(value = "serviceId") int id) {
        this.travelServiceService.deleteTravelService(id);
    }
}
