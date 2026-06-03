package com.dmv.controllers;
import com.dmv.pojo.User;
import com.dmv.service.UserService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/secure/admin")
@CrossOrigin
public class ApiAdminUserController {
    @Autowired
    private UserService userService;
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(this.userService.getUsers(params));
    }
    @GetMapping("/users/count")
    public ResponseEntity<Long> countUsers(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(this.userService.countUsers(params));
    }
    @GetMapping("/users/pending-providers")
    public ResponseEntity<List<User>> getPendingProviders(@RequestParam Map<String, String> params) {
        Map<String, String> filters = new HashMap<>(params);
        filters.put("role", "ROLE_PROVIDER");
        filters.put("approved", "false");
        return ResponseEntity.ok(this.userService.getUsers(filters));
    }
    @GetMapping("/users/pending-providers/count")
    public ResponseEntity<Long> countPendingProviders(@RequestParam Map<String, String> params) {
        Map<String, String> filters = new HashMap<>(params);
        filters.put("role", "ROLE_PROVIDER");
        filters.put("approved", "false");
        return ResponseEntity.ok(this.userService.countUsers(filters));
    }
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<User> approveUser(@PathVariable(value = "id") int id) {
        return ResponseEntity.ok(this.userService.approveUser(id));
    }
    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<User> toggleActive(@PathVariable(value = "id") int id) {
        return ResponseEntity.ok(this.userService.toggleActive(id));
    }
}
