// src/pages/SignupPage/SignupPage.jsx
import React from 'react';
import SignupForm from '../../components/SignupForm.jsx';
import footerLogo from '../../assets/TopcitClearLogo.png';
import './SignupPage.css';
import { useLocation } from 'react-router-dom';

const SignupPage = () => {
  // localStorage에서 이메일 불러오기
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("google_email");
  console.log("넘어온 이메일:", email);
  return (
    <div className="signup-page-wrapper">
      <div className="signup-card">
        <h2 className="signup-title">회원가입</h2>
        <SignupForm email={email} /> {/* 이메일 전달 */}
        <div className="signup-footer">
          <img
            src={footerLogo}
            alt="Topcit Clear Logo"
            className="footer-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;