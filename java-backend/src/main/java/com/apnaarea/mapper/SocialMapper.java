package com.apnaarea.mapper;

import com.apnaarea.domain.Follow;
import com.apnaarea.domain.Block;
import com.apnaarea.domain.Conversation;
import com.apnaarea.domain.Message;
import com.apnaarea.dto.SocialDtos.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SocialMapper {

    FollowResponse toDto(Follow follow);
    
    BlockResponse toDto(Block block);

    @Mapping(target = "otherParticipantName", ignore = true)
    @Mapping(target = "otherParticipantAvatar", ignore = true)
    ConversationResponse toDto(Conversation conversation);

    @Mapping(source = "conversation.id", target = "conversationId")
    MessageResponse toDto(Message message);
}
