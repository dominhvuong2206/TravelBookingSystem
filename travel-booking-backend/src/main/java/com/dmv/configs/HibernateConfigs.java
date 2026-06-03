/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.configs;

import java.util.Properties;
import javax.sql.DataSource;
import static org.hibernate.cfg.JdbcSettings.DIALECT;
import static org.hibernate.cfg.JdbcSettings.SHOW_SQL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.hibernate5.HibernateTransactionManager;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;

/**
 *
 * @author Do Minh Vuong
 */
@Configuration
@PropertySource("classpath:databases.properties")
public class HibernateConfigs {

    @Autowired
    private Environment env;

    @Bean
    public LocalSessionFactoryBean getSessionFactory() {
        LocalSessionFactoryBean sessionFactory = new LocalSessionFactoryBean();
        sessionFactory.setPackagesToScan(new String[]{"com.dmv.pojo"});
        sessionFactory.setDataSource(dataSource());
        sessionFactory.setHibernateProperties(hibernateProperties());
        return sessionFactory;
    }

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(config("hibernate.connection.driverClass"));
        dataSource.setUrl(databaseUrl());
        dataSource.setUsername(databaseUsername());
        dataSource.setPassword(databasePassword());
        return dataSource;
    }

    private Properties hibernateProperties() {
        Properties props = new Properties();
        props.put(DIALECT, config("hibernate.dialect"));
        props.put(SHOW_SQL, config("hibernate.showSql"));
        return props;
    }

    private String databaseUrl() {
        String url = config("hibernate.connection.url");
        if (url != null && !url.isBlank() && !url.contains("localhost"))
            return url;

        String host = env("MYSQLHOST");
        String port = env("MYSQLPORT");
        String database = env("MYSQLDATABASE");
        if (host != null && !host.isBlank() && database != null && !database.isBlank()) {
            if (port == null || port.isBlank())
                port = "3306";
            return String.format("jdbc:mysql://%s:%s/%s?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC",
                    host, port, database);
        }

        return url;
    }

    private String databaseUsername() {
        String username = env("MYSQLUSER");
        if (username == null || username.isBlank())
            username = config("hibernate.connection.username");
        return username;
    }

    private String databasePassword() {
        String password = env("MYSQLPASSWORD");
        if (password == null)
            password = config("hibernate.connection.password");
        return password;
    }

    private String config(String name) {
        String value = env(name.toUpperCase().replace('.', '_'));
        if (value == null || value.isBlank())
            value = env.getProperty(name);
        return value;
    }

    private String env(String name) {
        return System.getenv(name);
    }

    @Bean
    public HibernateTransactionManager transactionManager() {
        HibernateTransactionManager transactionManager = new HibernateTransactionManager();
        transactionManager.setSessionFactory(getSessionFactory().getObject());
        return transactionManager;
    }
}
