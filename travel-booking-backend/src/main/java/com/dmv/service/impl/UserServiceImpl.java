/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dmv.pojo.User;
import com.dmv.repository.UserRepository;
import com.dmv.service.UserService;
import java.io.IOException;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Do Minh Vuong
 */
@Service("userDetailsService")
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public User getUserByUsername(String username) {
        return this.userRepo.getUserByUsername(username);
    }

    @Override
    public User getUserById(int id) {
        return this.userRepo.getUserById(id);
    }

    @Override
    public List<User> getUsers(Map<String, String> params) {
        return this.userRepo.getUsers(params);
    }

    @Override
    public Long countUsers(Map<String, String> params) {
        return this.userRepo.countUsers(params);
    }

    @Override
    public User addUser(Map<String, String> params, MultipartFile avatar) {
        User u = new User();
        u.setFirstName(params.get("firstName"));
        u.setLastName(params.get("lastName"));
        u.setPhone(params.get("phone"));
        u.setEmail(params.get("email"));
        u.setUsername(params.get("username"));
        u.setPassword(passwordEncoder.encode(params.get("password")));
        u.setCompanyName(params.get("companyName"));
        u.setAddress(params.get("address"));
        u.setActive(true);
        u.setCreatedDate(new Date());

        String role = params.getOrDefault("userRole", "ROLE_CUSTOMER");
        if ("ROLE_PROVIDER".equals(role)) {
            u.setUserRole("ROLE_PROVIDER");
            u.setApproved(false);
        } else {
            u.setUserRole("ROLE_CUSTOMER");
            u.setApproved(true);
        }

        if (!avatar.isEmpty()) {
            try {
                Map res = this.cloudinary.uploader().upload(avatar.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                u.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(TravelServiceServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        return this.userRepo.addUser(u);
    }

    @Override
    public User updateProfile(String username, Map<String, String> params, MultipartFile avatar) {
        User u = this.userRepo.getUserByUsername(username);
        if (u == null)
            throw new IllegalArgumentException("User not found");

        updateIfPresent(params, "firstName", u::setFirstName);
        updateIfPresent(params, "lastName", u::setLastName);
        updateIfPresent(params, "email", u::setEmail);
        updateIfPresent(params, "phone", u::setPhone);

        if ("ROLE_PROVIDER".equals(u.getUserRole())) {
            updateIfPresent(params, "companyName", u::setCompanyName);
            updateIfPresent(params, "address", u::setAddress);
        }

        if (avatar != null && !avatar.isEmpty()) {
            try {
                Map res = this.cloudinary.uploader().upload(avatar.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                u.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        return this.userRepo.updateUser(u);
    }

    private void updateIfPresent(Map<String, String> params, String key, java.util.function.Consumer<String> setter) {
        if (params != null && params.containsKey(key))
            setter.accept(params.get(key) != null ? params.get(key).trim() : null);
    }

    @Override
    public User approveUser(int id) {
        User u = this.userRepo.getUserById(id);
        if (u == null)
            throw new IllegalArgumentException("User not found");

        u.setApproved(true);
        return this.userRepo.updateUser(u);
    }

    @Override
    public User toggleActive(int id) {
        User u = this.userRepo.getUserById(id);
        if (u == null)
            throw new IllegalArgumentException("User not found");

        u.setActive(!Boolean.TRUE.equals(u.getActive()));
        return this.userRepo.updateUser(u);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userRepo.getUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Không tồn tại!");
        }
        
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority(user.getUserRole()));
        
        boolean enabled = Boolean.TRUE.equals(user.getActive());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                enabled,
                true,
                true,
                true,
                authorities
        );
    }

    @Override
    public boolean authenticate(String username, String password) {
        return this.userRepo.authenticate(username, password);
    }

}
