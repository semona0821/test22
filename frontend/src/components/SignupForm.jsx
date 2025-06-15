// src/components/SignupForm.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/SignupPage/SignupPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignupForm = ({ email }) => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showCheckIcon, setShowCheckIcon] = useState(false);
  const [dupChecked, setDupChecked] = useState(false);
  const [dupSuccess, setDupSuccess] = useState('');
  const [dupError, setDupError] = useState('');

  const isMatch = passwordConfirm && password === passwordConfirm;

  // 이메일에서 학번 자동 추출 (ex. 20201059@vision.hoseo.edu)
  useEffect(() => {
    if (email && email.endsWith('@vision.hoseo.edu')) {
      const id = email.split('@')[0];
      setStudentId(id);
    }
  }, [email]);

  const handleDupCheck = async () => {
    if (!nickname) {

      setDupError("닉네임을 입력해주세요.");
      setDupSuccess('');
      setDupChecked(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/member/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const isDuplicate = await response.json();

      if (isDuplicate) {
        setDupError("이미 사용 중인 닉네임입니다.");
        setDupSuccess('');
        setDupChecked(false);
      } else {
        setDupError("");
        setDupSuccess("사용 가능한 닉네임입니다.");
        setDupChecked(true);
      }
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setDupError("서버 오류로 중복 확인에 실패했습니다.");
      setDupSuccess('');
      setDupChecked(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dupChecked) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/member/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          studentId,
          nickname,
          password,
        }),
      });

      if (!res.ok) throw new Error('회원가입 실패');

      const data = await res.json();

      alert('회원가입이 완료되었습니다!');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('❌ 회원가입 오류:', err);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };


  return (
    <form onSubmit={handleSubmit} className="form-signup">
      <div className="input-group">
        <input
          type="text"
          placeholder="닉네임 입력"
          value={nickname}
          onChange={e => {
            setNickname(e.target.value);
            setDupChecked(false);
            setDupError('');
          }}
          required
          className="input-nickname"
        />
        <button
          type="button"
          className="btn-dupcheck"
          onClick={handleDupCheck}
        >
          중복 확인
        </button>
        {dupError && (
          <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '4px' }}>
            {dupError}
          </div>
        )}
        {dupSuccess && (
          <div style={{ color: 'green', fontSize: '0.85rem', marginTop: '4px' }}>
            {dupSuccess}
          </div>
        )}
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="학번 입력"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
          readOnly={!!email}
          required
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={e => {
            setPasswordConfirm(e.target.value);
            setShowCheckIcon(true);
          }}
          required
        />
        {showCheckIcon && (
          <span className={`check-icon ${isMatch ? 'match' : 'nomatch'}`}>
            {isMatch ? '✓' : '✕'}
          </span>
        )}
      </div>

      <button type="submit" className="btn-signup">가입하기</button>
    </form>
  );
};

export default SignupForm;