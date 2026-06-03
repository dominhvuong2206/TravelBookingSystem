package com.dmv.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

@Configuration
@PropertySource("classpath:configs.properties")
public class CloudinaryConfigs {

    @Autowired
    private Environment env;

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
}
