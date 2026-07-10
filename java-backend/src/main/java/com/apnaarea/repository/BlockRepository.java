package com.apnaarea.repository;

import com.apnaarea.domain.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlockRepository extends JpaRepository<Block, UUID> {
    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
    Optional<Block> findByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Block b " +
           "WHERE (b.blockerId = :userA AND b.blockedId = :userB) " +
           "OR (b.blockerId = :userB AND b.blockedId = :userA)")
    boolean existsBlockBetween(@Param("userA") UUID userA, @Param("userB") UUID userB);
}
