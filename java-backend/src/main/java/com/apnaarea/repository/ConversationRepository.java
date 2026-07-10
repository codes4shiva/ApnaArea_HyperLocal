package com.apnaarea.repository;

import com.apnaarea.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    
    @Query("SELECT c FROM Conversation c WHERE (c.initiatorId = :u1 AND c.recipientId = :u2) OR (c.initiatorId = :u2 AND c.recipientId = :u1)")
    Optional<Conversation> findConversationBetween(@Param("u1") UUID u1, @Param("u2") UUID u2);

    @Query("SELECT c FROM Conversation c WHERE c.initiatorId = :userId OR c.recipientId = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findAllByParticipant(@Param("userId") UUID userId);
}
