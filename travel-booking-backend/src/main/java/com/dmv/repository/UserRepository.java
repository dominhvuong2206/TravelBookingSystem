/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.repository;

import com.dmv.pojo.User;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Do Minh Vuong
 */
public interface UserRepository {
    User getUserByUsername(String username);
    User getUserById(int id);
    List<User> getUsers(Map<String, String> params);
    Long countUsers(Map<String, String> params);
    User addUser(User u);
    User updateUser(User u);
    boolean authenticate(String username, String password);
}
