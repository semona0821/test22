package org.example.topcitonthehoseo.service;

import java.util.NoSuchElementException;

import org.example.topcitonthehoseo.dto.request.ReceiveErrorRequestDto;
import org.example.topcitonthehoseo.entity.Question;
import org.example.topcitonthehoseo.entity.QuestionError;
import org.example.topcitonthehoseo.entity.User;
import org.example.topcitonthehoseo.repository.ErrorRepository;
import org.example.topcitonthehoseo.repository.QuestionRepository;
import org.example.topcitonthehoseo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ErrorService {

    private final ErrorRepository errorRepository;

    private final QuestionRepository questionRepository;

    private final UserRepository userRepository;

    public Long getUserIdByStudentId(String studentId) {
        return userRepository.findByStudentId(studentId)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getUserId();
    }
    
    @Transactional
    public void receiveError(Long questionId, Long userId, ReceiveErrorRequestDto receiveErrorRequestDto) {

        log.debug("receive error service in");

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("해당 번호에 해당하는 문제가 없습니다. question id : " + questionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("없는 유저 입니다."));

        QuestionError error = QuestionError.builder()
                .user(user)
                .question(question)
                .errorTitle(receiveErrorRequestDto.getErrorTitle())
                .errorContent(receiveErrorRequestDto.getErrorContent())
                .build();

        errorRepository.save(error);
    }
}
