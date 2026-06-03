/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

/**
 *
 * @author Do Minh Vuong
 */
@Configuration
@EnableWebSecurity
@EnableTransactionManagement
@PropertySource("classpath:configs.properties")
@ComponentScan(
        basePackages = {
            "com.dmv.controllers",
            "com.dmv.repository",
            "com.dmv.service"
        }
)
@Order(2)
public class SpringSecurityConfigs {

    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private Environment env;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
        return new HandlerMappingIntrospector();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/admin/**", "/", "/login").csrf(c -> c.disable()).authorizeHttpRequests((requests) -> requests
                .requestMatchers("/", "/admin").hasRole("ADMIN")
                .anyRequest().permitAll()
        ).formLogin(form -> form.loginPage("/admin/login") // Đường dẫn tới trang đăng nhập
                .loginProcessingUrl("/login") // Đường dẫn xử lý POST
                .defaultSuccessUrl("/", true) // Chuyển hướng khi thành công
                .failureUrl("/admin/login?error=true") // Chuyển hướng khi thất bại
                .permitAll()
        ).logout((logout) -> logout.logoutSuccessUrl("/admin/login").permitAll());
        
//        http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(c -> c.disable()).authorizeHttpRequests((requests) -> requests
//                .requestMatchers("/", "/admin").hasRole("ADMIN")
//                .requestMatchers("/api/**").permitAll()
//                .anyRequest().authenticated()
//        ).formLogin(form -> form.loginPage("/admin/login") // Đường dẫn tới trang đăng nhập
//                .loginProcessingUrl("/login") // Đường dẫn xử lý POST
//                .defaultSuccessUrl("/", true) // Chuyển hướng khi thành công
//                .failureUrl("/admin/login?error=true") // Chuyển hướng khi thất bại
//                .permitAll()
//        ).logout((logout) -> logout.logoutSuccessUrl("/admin/login").permitAll());
        return http.build();
    }

    @Bean
    public Cloudinary cloudinary() {
        Cloudinary cloudinary
                = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", config("cloudinary.cloud_name"),
                        "api_key", config("cloudinary.api_key"),
                        "api_secret", config("cloudinary.api_secret"),
                        "secure", true));
        return cloudinary;
    }

    private String config(String name) {
        String value = System.getenv(name.toUpperCase().replace('.', '_'));
        if (value == null || value.isBlank())
            value = env.getProperty(name);
        return value == null ? "" : value;
    }
    
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration config = new CorsConfiguration();
//
//        config.setAllowedOrigins(List.of("http://localhost:3000")); 
//        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
//        config.setExposedHeaders(List.of("Authorization"));
//        config.setAllowCredentials(true); 
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//
//        return source;
//    }
}
