package com.apnaarea.service;

import com.apnaarea.domain.Block;
import com.apnaarea.domain.Conversation;
import com.apnaarea.domain.Follow;
import com.apnaarea.domain.Message;
import com.apnaarea.dto.SocialDtos.*;
import com.apnaarea.mapper.SocialMapper;
import com.apnaarea.repository.BlockRepository;
import com.apnaarea.repository.ConversationRepository;
import com.apnaarea.repository.FollowRepository;
import com.apnaarea.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SocialServiceImpl implements SocialService {

    private final FollowRepository followRepository;
    private final BlockRepository blockRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SocialMapper socialMapper;

    @Override
    public FollowResponse followUser(UUID followerId, UUID followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("A user cannot follow themselves.");
        }

        // Verify no active block exists in either direction
        if (blockRepository.existsBlockBetween(followerId, followingId)) {
            throw new IllegalStateException("Following action is restricted due to block constraints.");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new IllegalStateException("You are already following this user.");
        }

        Follow follow = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();

        Follow saved = followRepository.save(follow);
        return socialMapper.toDto(saved);
    }

    @Override
    public void unfollowUser(UUID followerId, UUID followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Override
    public BlockResponse blockUser(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new IllegalArgumentException("A user cannot block themselves.");
        }

        if (blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new IllegalStateException("User is already blocked.");
        }

        // Auto-unfollow in BOTH directions (A blocks B -> unfollow B, and B unfollows A)
        followRepository.deleteByFollowerIdAndFollowingId(blockerId, blockedId);
        followRepository.deleteByFollowerIdAndFollowingId(blockedId, blockerId);

        Block block = Block.builder()
                .blockerId(blockerId)
                .blockedId(blockedId)
                .build();

        Block saved = blockRepository.save(block);
        return socialMapper.toDto(saved);
    }

    @Override
    public void unblockUser(UUID blockerId, UUID blockedId) {
        blockRepository.findByBlockerIdAndBlockedId(blockerId, blockedId)
                .ifPresent(blockRepository::delete);
    }

    @Override
    public ConversationResponse getOrCreateConversation(UUID initiatorId, UUID recipientId) {
        if (initiatorId.equals(recipientId)) {
            throw new IllegalArgumentException("Cannot start conversation with yourself.");
        }

        // Check blocking rules
        if (blockRepository.existsBlockBetween(initiatorId, recipientId)) {
            throw new IllegalStateException("Cannot start a conversation. Block is active.");
        }

        Conversation conversation = conversationRepository.findConversationBetween(initiatorId, recipientId)
                .orElseGet(() -> {
                    Conversation newConvo = Conversation.builder()
                            .initiatorId(initiatorId)
                            .recipientId(recipientId)
                            .build();
                    return conversationRepository.save(newConvo);
                });

        return socialMapper.toDto(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversationsForUser(UUID userId) {
        return conversationRepository.findAllByParticipant(userId).stream()
                .map(convo -> {
                    ConversationResponse dto = socialMapper.toDto(convo);
                    // Add mock metadata or retrieve user details to populate name/avatar in a real integration
                    UUID otherId = convo.getInitiatorId().equals(userId) ? convo.getRecipientId() : convo.getInitiatorId();
                    dto.setOtherParticipantName("User " + otherId.toString().substring(0, 8));
                    dto.setOtherParticipantAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public MessageResponse sendMessage(UUID conversationId, UUID senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));

        // Enforce conversation freeze if any blocking exists
        if (blockRepository.existsBlockBetween(conversation.getInitiatorId(), conversation.getRecipientId())) {
            throw new IllegalStateException("Conversation is frozen because one of the participants is blocked.");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(content)
                .isRead(false)
                .build();

        Message saved = messageRepository.save(message);
        return socialMapper.toDto(saved);
    }

    @Override
    public List<MessageResponse> getMessagesInConversation(UUID conversationId, UUID requesterId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found."));

        // Check if requester is a participant
        if (!conversation.getInitiatorId().equals(requesterId) && !conversation.getRecipientId().equals(requesterId)) {
            throw new SecurityException("You are not authorized to view this conversation.");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Mark unread messages received by requester as read
        messages.stream()
                .filter(m -> !m.getSenderId().equals(requesterId) && !m.isRead())
                .forEach(m -> m.setRead(true));

        return messages.stream()
                .map(socialMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId, UUID viewerId) {
        // Business Rule: B cannot view A's profile if there is a block active
        boolean isBlocked = blockRepository.existsBlockBetween(userId, viewerId);
        if (isBlocked && !userId.equals(viewerId)) {
            throw new SecurityException("Access to this profile has been restricted.");
        }

        long followerCount = followRepository.countByFollowingId(userId);
        long followingCount = followRepository.countByFollowerId(userId);
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(viewerId, userId);

        return UserProfileResponse.builder()
                .userId(userId)
                .name("Resident " + userId.toString().substring(0, 8))
                .email("verified.resident@apnaarea.org")
                .bio("Active Resident Member")
                .followerCount(followerCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .isBlocked(blockRepository.existsByBlockerIdAndBlockedId(viewerId, userId))
                .build();
    }
}
