// src/components/PasswordResetForm.jsx

import React, { useState } from 'react';
import '../pages/PasswordResetPage/PasswordResetPage.css';

const PasswordResetForm = ({ email, onResetSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCheckIcon, setShowCheckIcon] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const isMatch = confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (!isMatch) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/member/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!res.ok) throw new Error('비밀번호 변경 실패');

      onResetSuccess();
    } catch (err) {
      console.error('❌ 비밀번호 변경 오류:', err);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-password-reset">
      <input
        type="password"
        placeholder="새 비밀번호 입력"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <div style={{ position: "relative" }}>
        <input
          type="password"
          placeholder="비밀번호 재입력"
          value={confirmPassword}
          onChange={e => {
            setConfirmPassword(e.target.value);
            setShowCheckIcon(true);
          }}
          required
          style={{ paddingRight: "40px" }}
        />
        {showCheckIcon && (
          <span
            className={`check-icon ${isMatch ? 'match' : 'nomatch'}`}
            style={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem',
            }}
          >
            {isMatch ? '✓' : '✕'}
          </span>
        )}
      </div>

      <button type="submit" className="btn-reset">
        확인
      </button>
    </form>
  );
};

export default PasswordResetForm;
