package org.example.topcitonthehoseo.controller;

import java.util.List;
import java.util.Map;

import org.example.topcitonthehoseo.dto.response.GetRankListResponseDto;
import org.example.topcitonthehoseo.entity.User;
import org.example.topcitonthehoseo.repository.UserRepository;
import org.example.topcitonthehoseo.service.RankService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/rank")
@RequiredArgsConstructor
public class RankController {

    private final RankService rankService;
    private final UserRepository userRepository;

    // 전체 랭킹 조회 (랭킹 페이지용)
    @PostMapping("/list/{seasonId}")
    public List<GetRankListResponseDto> getRankList(@PathVariable int seasonId) {
        return rankService.getOverallRankList(seasonId);
    }

    // 마이페이지 - 내 랭킹 정보 조회용
    @PostMapping("/my")
    public ResponseEntity<?> getMyRankInfo(@RequestBody Map<String, String> body) {
        int seasonId = Integer.parseInt(body.get("seasonId"));
        String studentId = body.get("studentId");

        User user = userRepository.findByStudentId(studentId)
                        .orElseThrow(() -> new RuntimeException("User not found"));

        List<GetRankListResponseDto> rankDetails = rankService.getUserRankDetail(seasonId, user.getUserId());

        for (GetRankListResponseDto dto : rankDetails) {
            dto.setNickname(user.getNickname());
        }
        return ResponseEntity.ok(rankService.getUserRankDetail(seasonId, user.getUserId()));
    }
}
