/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dht.controllers;

import com.dht.pojo.Comment;
import com.dht.service.CommentService;
import com.dht.service.UserService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author huu-thanhduong
 */
@RestController
@RequestMapping("/api")
@CrossOrigin
public class ApiCommentController {
    @Autowired
    private CommentService commentService;
    @Autowired
    private UserService userService;
    
    @GetMapping("/products/{productId}/comments")
    public ResponseEntity<List<Comment>> list(@PathVariable(value = "productId") int id) {
        return new ResponseEntity<>(this.commentService.getComments(id), HttpStatus.OK);
    }
    
    @PostMapping("/secure/products/{productId}/comments")
    public ResponseEntity<Comment> addComment(@RequestBody Map<String, String> p, @PathVariable(value = "productId") int id, Principal principal) {
        
        
        return new ResponseEntity<>(this.commentService.addComment(id, p.get("content")), HttpStatus.CREATED);
    }
}
