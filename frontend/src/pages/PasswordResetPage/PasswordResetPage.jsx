// src/pages/PasswordResetPage/PasswordResetPage.jsx
import React, { useState } from 'react';
import PasswordResetForm from '../../components/PasswordResetForm.jsx';
import '../PasswordResetPage/PasswordResetPage.css';
import { GoogleLogin } from '@react-oauth/google';

const PasswordResetPage = () => {
  const [email, setEmail] = useState(null);

  const onResetSuccess = () => {
    alert('비밀번호가 성공적으로 변경되었습니다.');
    window.location.href = '/login';
  };

  const handleGoogleLogin = (credentialResponse) => {
    const token = credentialResponse?.credential;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.email) setEmail(decoded.email);
    } catch (err) {
      alert('구글 로그인 토큰 처리 중 오류');
      console.error(err);
    }
  };

  return (
    <div className="password-reset-page-wrapper">
      <div className="password-reset-card">
        <h2 className="password-reset-title">비밀번호 재설정</h2>

        {!email ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '20px',
          }}>
            <p>비밀번호를 재설정하려면 구글 로그인을 먼저 해주세요.</p>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert('Google 로그인 실패')}
              useOneTap={false}
              theme="outline"
            />
          </div>
        ) : (
          <PasswordResetForm email={email} onResetSuccess={onResetSuccess} />
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
