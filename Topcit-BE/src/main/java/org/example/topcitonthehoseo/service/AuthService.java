package org.example.topcitonthehoseo.service;

import java.util.UUID;

import org.example.topcitonthehoseo.dto.request.GoogleLoginRequestDto;
import org.example.topcitonthehoseo.dto.request.LoginRequestDto;
import org.example.topcitonthehoseo.dto.request.RegisterRequestDto;
import org.example.topcitonthehoseo.dto.request.ResetPasswordRequestDto;
import org.example.topcitonthehoseo.dto.response.LoginResponseDto;
import org.example.topcitonthehoseo.dto.response.TokenResponseDto;
import org.example.topcitonthehoseo.entity.User;
import org.example.topcitonthehoseo.repository.UserRepository;
import org.example.topcitonthehoseo.util.GoogleTokenUtil;
import org.example.topcitonthehoseo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j

public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private GoogleTokenUtil googleTokenUtil;

    @Value("${google.client-id}")
    private String googleClientId;

    @PostConstruct
    public void init() {
        System.out.println("googleClientId = " + googleClientId);
    }

    // 1) 일반 로그인
    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByStudentId(dto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 학번입니다."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return buildTokenResponse(user, false);
    }

    // 2) 구글 로그인
    @Transactional
    public LoginResponseDto googleLogin(GoogleLoginRequestDto dto) {
        String email = googleTokenUtil.getEmailFromGoogleToken(dto.getCredential());
        if (email == null) {
            log.error("🔴 구글 토큰 검증 실패 또는 이메일 추출 실패");
            throw new IllegalArgumentException("구글 토큰이 유효하지 않습니다.");
        }

        // 이메일 필터링 (학생 + 교수용)
        if (!(email.endsWith("@vision.hoseo.edu") || email.endsWith("@hoseo.edu"))) {
            throw new IllegalArgumentException("학교 이메일(@vision.hoseo.edu)만 로그인할 수 있습니다.");
        }

        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = User.builder()
                    .email(email)
                    .registered(false)
                    .nickname("USER_" + System.currentTimeMillis())
                    .studentId(email.split("@")[0]) // 또는 email 앞부분 추출
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role("USER")
                    .isWithdraw(false)
                    .totalScore(0)
                    .build();
                return userRepository.save(newUser);
            });


        boolean isNewUser = !user.getRegistered();

        return buildTokenResponse(user, isNewUser);
    }



    // 3) 추가 정보 등록
    @Transactional
    public LoginResponseDto register(RegisterRequestDto dto) {
        // 먼저 이메일로 유저 조회 (null일 경우 신규 생성)
        User user = userRepository.findByEmail(dto.getEmail()).orElse(null);

        if (user == null) {
            // 구글 로그인 이후 유저 정보가 저장되지 않은 예외 상황까지 커버
            user = User.builder()
                    .email(dto.getEmail())
                    .role("USER")
                    .isWithdraw(false)
                    .registered(false)
                    .totalScore(0)
                    .build();
        }

        // 이미 가입된 유저라면 차단
        if (user.getStudentId() != null) {
            throw new IllegalStateException("이미 가입된 계정입니다.");
        }

        // 중복 검사
        if (userRepository.findByStudentId(dto.getStudentId()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 학번입니다.");
        }

        if (userRepository.existsByNickname(dto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 유저 정보 설정
        user.setStudentId(dto.getStudentId());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setNickname(dto.getNickname());
        user.setRegistered(true);

        // 저장
        userRepository.save(user);

        return buildTokenResponse(user, false);
    }

    // 4) 토큰 재발급 (리프레시 토큰 기반)
    public TokenResponseDto reissueToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("리프레시 토큰이 유효하지 않습니다.");
        }

        String studentId = jwtUtil.getStudentIdFromToken(refreshToken);
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String newAccessToken = jwtUtil.createAccessToken(studentId, user.getRole());
        String newRefreshToken = jwtUtil.createRefreshToken(studentId);

        return new TokenResponseDto(newAccessToken, newRefreshToken);
    }

    // 로그인 응답 빌드 (LoginResponseDto용)
    private LoginResponseDto buildTokenResponse(User user, boolean isNewUser) {
        String accessToken = jwtUtil.createAccessToken(user.getStudentId(), user.getRole());
        String refreshToken = jwtUtil.createRefreshToken(user.getStudentId());

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nickname(user.getNickname())
                .role(user.getRole())
                .isNewUser(isNewUser)
                .studentId(user.getStudentId())
                .email(user.getEmail())
                .build();
    }

    // 패스워드 찾기
    public void resetPassword(ResetPasswordRequestDto request) {
        String email = request.getEmail();  // 예: 20201234@hoseo.ac.kr

        if (email == null || !email.contains("@")) {
            throw new RuntimeException("잘못된 이메일 형식입니다.");
        }

        // 이메일 앞부분 = 학번
        String studentId = email.split("@")[0];

        User user = userRepository.findByStudentIdIgnoreCase(studentId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }


    public boolean isNicknameDuplicate(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    @Transactional
    public void changeNickname(String studentId, String newNickname) {
        User user = userRepository.findByStudentId(studentId)
            .orElseThrow(() -> new RuntimeException("해당 학번의 사용자를 찾을 수 없습니다."));
        user.setNickname(newNickname);
        userRepository.save(user);
    }
}