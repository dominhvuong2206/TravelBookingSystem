/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dht.service;

import com.dht.pojo.Comment;
import java.util.List;

/**
 *
 * @author huu-thanhduong
 */
public interface CommentService {
    List<Comment> getComments(int productId);
    Comment addComment(int productId, String content);
}
