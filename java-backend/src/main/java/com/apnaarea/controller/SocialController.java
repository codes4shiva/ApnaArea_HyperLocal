package com.apnaarea.controller;

import com.apnaarea.dto.SocialDtos.*;
import com.apnaarea.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    // Follow a user
    @PostMapping("/follow")
    public ResponseEntity<FollowResponse> follow(@RequestBody FollowRequest request) {
        FollowResponse response = socialService.followUser(request.getFollowerId(), request.getFollowingId());
        return ResponseEntity.ok(response);
    }

    // Unfollow a user
    @DeleteMapping("/unfollow")
    public ResponseEntity<Void> unfollow(
            @RequestParam("followerId") UUID followerId,
            @RequestParam("followingId") UUID followingId) {
        socialService.unfollowUser(followerId, followingId);
        return ResponseEntity.noContent().build();
    }

    // Block a user
    @PostMapping("/block")
    public ResponseEntity<BlockResponse> block(@RequestBody BlockRequest request) {
        BlockResponse response = socialService.blockUser(request.getBlockerId(), request.getBlockedId());
        return ResponseEntity.ok(response);
    }

    // Unblock a user
    @DeleteMapping("/unblock")
    public ResponseEntity<Void> unblock(
            @RequestParam("blockerId") UUID blockerId,
            @RequestParam("blockedId") UUID blockedId) {
        socialService.unblockUser(blockerId, blockedId);
        return ResponseEntity.noContent().build();
    }

    // Start or get a Conversation
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> startConversation(
            @RequestParam("initiatorId") UUID initiatorId,
            @RequestParam("recipientId") UUID recipientId) {
        ConversationResponse response = socialService.getOrCreateConversation(initiatorId, recipientId);
        return ResponseEntity.ok(response);
    }

    // Get list of active conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(@RequestParam("userId") UUID userId) {
        List<ConversationResponse> response = socialService.getConversationsForUser(userId);
        return ResponseEntity.ok(response);
    }

    // Send a message in a conversation
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable("id") UUID conversationId,
            @RequestBody MessageRequest request) {
        MessageResponse response = socialService.sendMessage(conversationId, request.getSenderId(), request.getContent());
        return ResponseEntity.ok(response);
    }

    // Retrieve messages in a conversation
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable("id") UUID conversationId,
            @RequestParam("requesterId") UUID requesterId) {
        List<MessageResponse> response = socialService.getMessagesInConversation(conversationId, requesterId);
        return ResponseEntity.ok(response);
    }

    // Retrieve profile with followers/following details
    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> getProfile(
            @PathVariable("userId") UUID userId,
            @RequestParam("viewerId") UUID viewerId) {
        UserProfileResponse response = socialService.getUserProfile(userId, viewerId);
        return ResponseEntity.ok(response);
    }
}
