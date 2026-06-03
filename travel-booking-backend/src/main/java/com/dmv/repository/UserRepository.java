package com.dmv.repository;
import com.dmv.pojo.User;
import java.util.List;
import java.util.Map;
public interface UserRepository {
    User getUserByUsername(String username);
    User getUserById(int id);
    List<User> getUsers(Map<String, String> params);
    Long countUsers(Map<String, String> params);
    User addUser(User u);
    User updateUser(User u);
    boolean authenticate(String username, String password);
}
