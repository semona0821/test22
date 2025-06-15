import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForm.jsx';
import footerLogo from '../../assets/TopcitClearLogo.png';
import './LoginPage.css';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = (data) => {
    localStorage.setItem("studentId", data.studentId);
    localStorage.setItem('nickname', data.nickname);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    onLoginSuccess(data);
    navigate('/');
    window.location.reload();
  };

  const handleGoogleLoginSuccess = async (response) => {
    if (!response.credential) {
      console.error("❌ credential 없음");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/member/auth/google-login`, {
        credential: response.credential,
      });

      const data = res.data;
      console.log("✅ Google 로그인 응답:", data);
      if (data.newUser) {
        localStorage.setItem("email", data.email);
        localStorage.setItem("google_email", data.email);
        navigate("/signup", { state: { email: data.email } });
      } else {
        localStorage.setItem("studentId", data.studentId);
        localStorage.setItem("nickname", data.nickname);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        onLoginSuccess(data);
        navigate("/home");
      }
    } catch (err) {
      console.error("로그인 실패:", err);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <h2 className="login-title">로그인</h2>
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onGoogleLogin={handleGoogleLoginSuccess}
        />
        <div className="login-footer">
          <img src={footerLogo} alt="Topcit Clear Logo" className="footer-logo" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;