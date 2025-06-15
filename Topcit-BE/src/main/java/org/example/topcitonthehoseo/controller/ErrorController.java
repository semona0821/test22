package org.example.topcitonthehoseo.controller;

import org.example.topcitonthehoseo.dto.request.ReceiveErrorRequestDto;
import org.example.topcitonthehoseo.service.ErrorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Slf4j
@RestController
@RequestMapping("/error")
@RequiredArgsConstructor
public class ErrorController {

    private final ErrorService errorService;

    @PostMapping("/{questionId}")
    public ResponseEntity<String> receiveError(@PathVariable Long questionId,
                                            @RequestBody ReceiveErrorRequestDto receiveErrorRequestDto,
                                            @RequestHeader("student-id") String studentId) {
        log.info("Receive error Controller");

        // studentId 기반으로 userId 조회
        Long userId = errorService.getUserIdByStudentId(studentId);

        errorService.receiveError(questionId, userId, receiveErrorRequestDto);
        return ResponseEntity.ok().body("오류 신고가 완료되었습니다.");
    }


}
