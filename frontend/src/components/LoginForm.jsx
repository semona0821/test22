import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupModal from './SignupModal.jsx';
import '../pages/LoginPage/LoginPage.css';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ onLoginSuccess, onGoogleLogin }) => {
  
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BACKEND_URL}/member/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          password,
        }),
      });

      if (!response.ok) throw new Error('로그인 실패');

      const data = await response.json();
      console.log("📦 로그인 응답:", data);
      onLoginSuccess(data);  // 토큰 저장 등
      navigate('/', { replace: true });
    } catch (err) {
      console.error('❌ 로그인 오류:', err);
      setShowSignupModal(true);
    }
  };


  return (
    <>
      <form onSubmit={handleSubmit} className="form-login">
        <input
          type="text"
          placeholder="학번 입력"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div className="link-row">
          <Link to="/find-password" className="link-find-password">
            비밀번호 재설정
          </Link>
        </div>

        <button type="submit" className="btn-auth">
          로그인
        </button>

        {/* ✅ Google Login with Custom Wrapper */}
        <div className="btn-auth btn-google">
          <GoogleLogin
            onSuccess={onGoogleLogin}
            onError={() => console.log("Google 로그인 실패")}
            useOneTap={false}
            ux_mode="popup"
            shape="rectangular"
            theme="outline"
            text="signin_with"
            width="280"
          />
        </div>
      </form>

      {showSignupModal && (
        <SignupModal onClose={() => setShowSignupModal(false)} />
      )}
    </>
  );
};

export default LoginForm;