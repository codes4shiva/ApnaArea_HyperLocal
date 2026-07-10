package com.apnaarea.service;

import com.apnaarea.dto.SocialDtos.*;
import java.util.List;
import java.util.UUID;

public interface SocialService {
    FollowResponse followUser(UUID followerId, UUID followingId);
    void unfollowUser(UUID followerId, UUID followingId);
    BlockResponse blockUser(UUID blockerId, UUID blockedId);
    void unblockUser(UUID blockerId, UUID blockedId);
    ConversationResponse getOrCreateConversation(UUID initiatorId, UUID recipientId);
    List<ConversationResponse> getConversationsForUser(UUID userId);
    MessageResponse sendMessage(UUID conversationId, UUID senderId, String content);
    List<MessageResponse> getMessagesInConversation(UUID conversationId, UUID requesterId);
    UserProfileResponse getUserProfile(UUID userId, UUID viewerId);
}
