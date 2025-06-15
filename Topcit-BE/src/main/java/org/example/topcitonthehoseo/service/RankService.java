package org.example.topcitonthehoseo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.example.topcitonthehoseo.dto.response.GetRankListResponseDto;
import org.example.topcitonthehoseo.entity.Lecture;
import org.example.topcitonthehoseo.entity.Ranking;
import org.example.topcitonthehoseo.entity.Score;
import org.example.topcitonthehoseo.entity.Season;
import org.example.topcitonthehoseo.entity.User;
import org.example.topcitonthehoseo.entity.UserRank;
import org.example.topcitonthehoseo.repository.LectureRepository;
import org.example.topcitonthehoseo.repository.RankRepository;
import org.example.topcitonthehoseo.repository.ScoreRepository;
import org.example.topcitonthehoseo.repository.SeasonRepository;
import org.example.topcitonthehoseo.repository.UserRankRepository;
import org.example.topcitonthehoseo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankService {

    private final UserRepository userRepository;
    private final UserRankRepository userRankRepository;
    private final ScoreRepository scoreRepository;
    private final SeasonRepository seasonRepository;
    private final LectureRepository lectureRepository;
    private final RankRepository rankRepository;

    @Transactional
    public List<GetRankListResponseDto> getUserRankDetail(int seasonId, Long userId) {
        log.debug("get user rank detail service in");

        Optional<UserRank> userRankOpt = userRankRepository.findByUser_UserIdAndSeason_SeasonId(userId, seasonId);
        if (userRankOpt.isEmpty()) return Collections.emptyList();

        UserRank userRank = userRankOpt.get();
        List<Score> scoreList = scoreRepository.findByUserAndSeason(userRank.getUser(), userRank.getSeason());

        Map<Integer, Integer> scoreMap = scoreList.stream()
                .collect(Collectors.toMap(
                        s -> s.getLecture().getLectureId(),
                        Score::getScore
                ));

        int totalScore = scoreMap.values().stream().mapToInt(Integer::intValue).sum();

        GetRankListResponseDto dto = GetRankListResponseDto.builder()
                .nickname(userRank.getUser().getNickname())
                .rankImage(userRank.getRanking().getRankImage())
                .lecture1Score(scoreMap.getOrDefault(1, 0))
                .lecture2Score(scoreMap.getOrDefault(2, 0))
                .lecture3Score(scoreMap.getOrDefault(3, 0))
                .lecture4Score(scoreMap.getOrDefault(4, 0))
                .lecture5Score(scoreMap.getOrDefault(5, 0))
                .lecture6Score(scoreMap.getOrDefault(6, 0))
                .totalScore(totalScore)
                .build();

        return List.of(dto);
    }

    @Transactional
    public List<GetRankListResponseDto> getOverallRankList(int seasonId) {
        List<UserRank> userRanks = userRankRepository.findBySeason_SeasonId(seasonId);
        List<GetRankListResponseDto> rankList = new ArrayList<>();

        for (UserRank userRank : userRanks) {
            List<Score> scoreList = scoreRepository.findByUserAndSeason(userRank.getUser(), userRank.getSeason());

            Map<Integer, Integer> scoreMap = scoreList.stream()
                    .collect(Collectors.toMap(
                            s -> s.getLecture().getLectureId(),
                            Score::getScore
                    ));

            int totalScore = scoreMap.values().stream().mapToInt(Integer::intValue).sum();

            GetRankListResponseDto dto = GetRankListResponseDto.builder()
                    .nickname(userRank.getUser().getNickname())
                    .rankImage(userRank.getRanking().getRankImage())
                    .lecture1Score(scoreMap.getOrDefault(1, 0))
                    .lecture2Score(scoreMap.getOrDefault(2, 0))
                    .lecture3Score(scoreMap.getOrDefault(3, 0))
                    .lecture4Score(scoreMap.getOrDefault(4, 0))
                    .lecture5Score(scoreMap.getOrDefault(5, 0))
                    .lecture6Score(scoreMap.getOrDefault(6, 0))
                    .totalScore(totalScore)
                    .build();

            rankList.add(dto);
        }

        return rankList;
    }

    @Transactional
    public void saveRanking(Long userId, Integer lectureId, int score) {

        LocalDateTime now = LocalDateTime.now();
        Season season = seasonRepository.findCurrentSeason(now)
                .orElseThrow(() -> new IllegalStateException("현재 진행 중인 시즌이 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("해당 유저가 없습니다."));

        Lecture lecture = lectureRepository.findById(Long.valueOf(lectureId))
                .orElseThrow(() -> new NoSuchElementException("해당 영역이 없습니다."));

        log.debug("save ranking service in");
        Optional<Score> existingScore = scoreRepository.findByUserAndSeasonAndLecture(user, season, lecture);

        if (existingScore.isPresent()) {
            log.debug("existing score is " + existingScore.get().getScore());
            Score scoreEntity = existingScore.get();
            scoreEntity.setScore(score);
            scoreRepository.save(scoreEntity);
        } else {
            log.debug("new score is " + score);
            Score newScore = Score.builder()
                    .user(user)
                    .season(season)
                    .lecture(lecture)
                    .score(score)
                    .build();
            scoreRepository.save(newScore);
        }

        List<Score> scoreList = scoreRepository.findByUser_UserIdAndSeason_SeasonId(userId, season.getSeasonId());

        Map<Integer, Integer> scoreMap = scoreList.stream()
                .collect(Collectors.toMap(
                        s -> s.getLecture().getLectureId(),
                        Score::getScore,
                        (oldVal, newVal) -> newVal
                ));

        boolean hasZero = scoreMap.values().stream().anyMatch(lectureScore -> lectureScore == 0);
        log.debug("hasZero is " + hasZero);

        String rankName;

        int totalScore = scoreMap.values().stream()
                .mapToInt(Integer::intValue)
                .sum();

        if (hasZero) {
            rankName = "UNRANK";
        } else if (totalScore >= 1 && totalScore <= 30) {
            rankName = "BRONZE";
        } else if (totalScore >= 31 && totalScore <= 60) {
            rankName = "SILVER";
        } else if (totalScore >= 61 && totalScore <= 80) {
            rankName = "GOLD";
        } else if (totalScore >= 81 && totalScore <= 100) {
            rankName = "PLATINUM";
        } else if (totalScore >= 100 && totalScore <= 120) {
            rankName = "DIAMOND";
        } else {
            throw new RuntimeException("잘못된 점수 값입니다.");
        }

        log.debug("ranking " + rankName);
        Ranking ranking = rankRepository.findByRankName(rankName)
                .orElseThrow(() -> new NoSuchElementException("해당 이름을 가진 랭크가 없습니다."));

        Optional<UserRank> existingUserRank = userRankRepository.findByUser_UserIdAndSeason_SeasonId(userId, season.getSeasonId());

        UserRank userRank = existingUserRank.orElseGet(() ->
            UserRank.builder()
                .user(user)
                .season(season)
                .ranking(ranking)
                .build()
        );

        userRank.setRanking(ranking);
        userRankRepository.save(userRank);

    }
}
