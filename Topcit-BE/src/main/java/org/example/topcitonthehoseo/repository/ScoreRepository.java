package org.example.topcitonthehoseo.repository;

import java.util.List;
import java.util.Optional;

import org.example.topcitonthehoseo.entity.Lecture;
import org.example.topcitonthehoseo.entity.Score;
import org.example.topcitonthehoseo.entity.Season;
import org.example.topcitonthehoseo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    // 전체 유저 랭킹용
    @Query("SELECT s FROM Score s " +
        "JOIN FETCH s.lecture l " +
        "JOIN FETCH s.user u " +
        "WHERE s.season.seasonId = :seasonId")
    List<Score> findAllWithLectureAndUserBySeasonId(@Param("seasonId") int seasonId);


    // 한 유저 점수용
    List<Score> findByUser_UserIdAndSeason_SeasonId(Long userId, int seasonId);
    
    List<Score> findByUserAndSeason(User user, Season season);

    // 점수 저장 시 중복 검사
    Optional<Score> findByUserAndSeasonAndLecture(User user, Season season, Lecture lecture);
}
