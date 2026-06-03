package com.dmv.configs;
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
        ).formLogin(form -> form.loginPage("/admin/login") 
                .loginProcessingUrl("/login") 
                .defaultSuccessUrl("/", true) 
                .failureUrl("/admin/login?error=true") 
                .permitAll()
        ).logout((logout) -> logout.logoutSuccessUrl("/admin/login").permitAll());
        return http.build();
    }
}
