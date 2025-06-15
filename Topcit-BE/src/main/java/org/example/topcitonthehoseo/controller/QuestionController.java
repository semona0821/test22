package org.example.topcitonthehoseo.controller;

import org.example.topcitonthehoseo.dto.request.LectureIdRequestDto;
import org.example.topcitonthehoseo.dto.request.SaveQuestion;
import org.example.topcitonthehoseo.dto.response.GetQuestion;
import org.example.topcitonthehoseo.repository.UserRepository;
import org.example.topcitonthehoseo.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final UserRepository userRepository;

    private Long getUserIdFromHeader(String studentId) {
        return userRepository.findByStudentId(studentId)
            .orElseThrow(() -> new RuntimeException("해당 학번의 유저를 찾을 수 없습니다."))
            .getUserId();
    }


    @PostMapping("/lecture/{lectureId}")
    public ResponseEntity<GetQuestion> createQuestion(
        @PathVariable Integer lectureId,
        @RequestHeader("student-id") String studentId) throws JsonProcessingException {

        log.info("Create question Controller");
        Long userId = getUserIdFromHeader(studentId);
        GetQuestion data = questionService.createQuestion(lectureId, userId);

        return ResponseEntity.ok().body(data);
    }

    @PostMapping("/{questionNumber}")
    public ResponseEntity<GetQuestion> getQuestion(
        @PathVariable Integer questionNumber,
        @RequestHeader("student-id") String studentId,
        @RequestBody SaveQuestion saveQuestion) throws JsonProcessingException {

        log.info("Get question Controller");
        Long userId = getUserIdFromHeader(studentId);
        GetQuestion data = questionService.getQuestion(questionNumber, userId, saveQuestion);

        return ResponseEntity.ok().body(data);
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitQuestion(
        @RequestHeader("student-id") String studentId,
        @RequestBody SaveQuestion saveQuestion) throws JsonProcessingException {

        log.info("Submit question Controller");
        Long userId = getUserIdFromHeader(studentId);
        questionService.submitQuestion(userId, saveQuestion);

        return ResponseEntity.ok().body("제출 완료");
    }

    @PostMapping("/result/{questionNumber}")
    public ResponseEntity<GetQuestion> getQuestionResult(
        @PathVariable Integer questionNumber,
        @RequestHeader("student-id") String studentId,
        @RequestBody LectureIdRequestDto lectureIdRequestDto) throws JsonProcessingException {

        log.info("Get question result Controller");
        Long userId = getUserIdFromHeader(studentId);
        GetQuestion data = questionService.getQuestionResult(questionNumber, userId, lectureIdRequestDto);

        return ResponseEntity.ok().body(data);
    }

}
