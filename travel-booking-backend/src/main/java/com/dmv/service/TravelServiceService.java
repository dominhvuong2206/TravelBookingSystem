package com.dmv.service;
import com.dmv.pojo.TravelService;
import java.util.List;
import java.util.Map;

public interface TravelServiceService {
    List<TravelService> getTravelServices(Map<String, String> params);
    Long countTravelServices(Map<String, String> params);
    void addOrUpdateTravelService(TravelService p);
    TravelService getTravelServiceById(int id);
    void deleteTravelService(int id);
}
