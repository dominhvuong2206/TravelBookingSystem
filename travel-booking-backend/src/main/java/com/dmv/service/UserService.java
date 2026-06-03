package com.dmv.service;
import com.dmv.pojo.User;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;

public interface UserService extends UserDetailsService {
    User getUserByUsername(String username) ;
    User getUserById(int id);
    List<User> getUsers(Map<String, String> params);
    Long countUsers(Map<String, String> params);
    User addUser(Map<String, String> params, MultipartFile avatar);
    User updateProfile(String username, Map<String, String> params, MultipartFile avatar);
    User approveUser(int id);
    User toggleActive(int id);
    boolean authenticate(String username, String password);
}
