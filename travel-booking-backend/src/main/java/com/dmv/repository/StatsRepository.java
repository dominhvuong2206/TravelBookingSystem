package com.dmv.repository;
import java.util.List;
import java.util.Map;

public interface StatsRepository {
    Long sumRevenue(Map<String, String> params);
    Map<Integer, Long> revenueByMonth(int year, Map<String, String> params);
    Map<Integer, Long> revenueByQuarter(int year, Map<String, String> params);
    Map<Integer, Long> revenueByYear(Map<String, String> params);
    Map<Integer, Long> bookingFrequencyByMonth(int year, Map<String, String> params);
    Map<Integer, Long> bookingFrequencyByQuarter(int year, Map<String, String> params);
    Map<Integer, Long> bookingFrequencyByYear(Map<String, String> params);
    List<Map<String, Object>> statsByService(Integer providerId);
}
