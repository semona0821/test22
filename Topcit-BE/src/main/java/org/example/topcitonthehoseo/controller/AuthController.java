package org.example.topcitonthehoseo.controller;

import java.util.Map;
import java.util.Optional;

import org.example.topcitonthehoseo.dto.request.GoogleLoginRequestDto;
import org.example.topcitonthehoseo.dto.request.LoginRequestDto;
import org.example.topcitonthehoseo.dto.request.NicknameChangeDto;
import org.example.topcitonthehoseo.dto.request.RefreshTokenRequestDto;
import org.example.topcitonthehoseo.dto.request.RegisterRequestDto;
import org.example.topcitonthehoseo.dto.request.ResetPasswordRequestDto;
import org.example.topcitonthehoseo.dto.response.LoginResponseDto;
import org.example.topcitonthehoseo.dto.response.TokenResponseDto;
import org.example.topcitonthehoseo.entity.User;
import org.example.topcitonthehoseo.repository.UserRepository;
import org.example.topcitonthehoseo.service.AuthService;
import org.example.topcitonthehoseo.util.GoogleTokenUtil;
import org.example.topcitonthehoseo.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/member/auth")
@RequiredArgsConstructor
public class AuthController {
    private final GoogleTokenUtil googleTokenUtil;
    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final UserRepository userRepository;

    // 일반 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto requestDto) {
        return ResponseEntity.ok(authService.login(requestDto));
    }


    // 구글 로그인
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequestDto dto) {
        String email = googleTokenUtil.getEmailFromGoogleToken(dto.getCredential());
        
        if (!email.endsWith("@vision.hoseo.edu")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("학교 이메일만 허용됩니다.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String accessToken = jwtUtil.createAccessToken(user.getStudentId(), user.getRole());
            String refreshToken = jwtUtil.createRefreshToken(user.getStudentId());

            return ResponseEntity.ok(Map.of(
                "newUser", false,
                "email", user.getEmail(),
                "studentId", user.getStudentId(),
                "nickname", user.getNickname(),
                "accessToken", accessToken,
                "refreshToken", refreshToken
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "newUser", true,
                "email", email
            ));
        }
    }



    // 회원가입 (구글 최초 로그인 후 추가 정보 등록)
    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> register(@RequestBody RegisterRequestDto requestDto) {
        return ResponseEntity.ok(authService.register(requestDto));
    }

    // 토큰 재발급
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponseDto> refreshToken(@RequestBody RefreshTokenRequestDto request) {
        TokenResponseDto newTokens = authService.reissueToken(request.getRefreshToken());
        return ResponseEntity.ok(newTokens);
    }

    // 비밀번호 찾기
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("비밀번호 변경 완료");
    }

    // 닉네임 중복 검사
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
        boolean isDuplicate = authService.isNicknameDuplicate(nickname);
        return ResponseEntity.ok(isDuplicate);
    }

    // 닉네임 변경
    @PostMapping("/change-nickname")
    public ResponseEntity<?> changeNickname(@RequestBody NicknameChangeDto request) {
        authService.changeNickname(request.getStudentId(), request.getNewNickname());
        return ResponseEntity.ok("닉네임이 성공적으로 변경되었습니다.");
    }

}