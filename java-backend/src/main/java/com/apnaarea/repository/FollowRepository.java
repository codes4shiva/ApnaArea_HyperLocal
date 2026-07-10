package com.apnaarea.repository;

import com.apnaarea.domain.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, UUID> {
    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    Optional<Follow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
    long countByFollowingId(UUID followingId);
    long countByFollowerId(UUID followerId);
    List<Follow> findByFollowerId(UUID followerId);
    List<Follow> findByFollowingId(UUID followingId);
    void deleteByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
}
