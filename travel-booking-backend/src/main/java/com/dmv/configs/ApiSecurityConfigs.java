package com.dmv.configs;
import com.dmv.filters.JwtFilter;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@Order(1)
@PropertySource("classpath:configs.properties")
public class ApiSecurityConfigs {
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private Environment env;
    @Bean
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .securityMatcher("/api/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/secure/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/secure/provider/**").hasRole("PROVIDER")
                    .requestMatchers("/api/secure/pay").hasRole("CUSTOMER")
                    .requestMatchers("/api/secure/payments/**").hasRole("CUSTOMER")
                    .requestMatchers("/api/secure/bookings/**").hasRole("CUSTOMER")
                    .requestMatchers( "/api/payments/stripe/create",
                            "/api/payments/stripe/confirm",
                            "/api/payments/paypal/create",
                            "/api/payments/paypal/capture",
                            "/api/payments/momo/create",
                            "/api/payments/zalopay/create"                
                    ).hasRole("CUSTOMER")
                    .requestMatchers("/api/secure/**").authenticated()
                    .anyRequest().permitAll()
            ).addFilterBefore(new JwtFilter(this.userDetailsService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsOrigins()); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true); 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    private List<String> corsOrigins() {
        String origins = config("cors.allowed.origins");
        if (origins == null || origins.isBlank())
            origins = config("frontend.url");
        if (origins == null || origins.isBlank())
            origins = "http://localhost:3000";
        return Stream.of(origins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
    }
    private String config(String name) {
        String value = System.getenv(name.toUpperCase().replace('.', '_'));
        if (value == null || value.isBlank())
            value = env.getProperty(name);
        return value;
    }
}
