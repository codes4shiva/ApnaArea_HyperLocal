package com.apnaarea.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class SocialDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FollowRequest {
        private UUID followerId;
        private UUID followingId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FollowResponse {
        private UUID id;
        private UUID followerId;
        private UUID followingId;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlockRequest {
        private UUID blockerId;
        private UUID blockedId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlockResponse {
        private UUID id;
        private UUID blockerId;
        private UUID blockedId;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversationResponse {
        private UUID id;
        private UUID initiatorId;
        private UUID recipientId;
        private LocalDateTime createdAt;
        private String otherParticipantName;
        private String otherParticipantAvatar;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageRequest {
        private UUID senderId;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageResponse {
        private UUID id;
        private UUID conversationId;
        private UUID senderId;
        private String content;
        private boolean isRead;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserProfileResponse {
        private UUID userId;
        private String name;
        private String email;
        private String avatarUrl;
        private String bio;
        private long followerCount;
        private long followingCount;
        private boolean isFollowing;
        private boolean isBlocked;
    }
}
