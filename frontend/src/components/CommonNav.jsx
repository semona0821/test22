// src/components/CommonNav.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './CommonNav.css';

import logoIcon from '../assets/TopcitLogo.png';
import loginIcon from '../assets/LoginButton.png';
import logoutIcon from '../assets/LogoutButton.png';
import SignupModal from './SignupModal.jsx';

const CommonNav = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(localStorage.getItem('nickname'));
  const [isAuth, setIsAuth] = useState(Boolean(localStorage.getItem('nickname')));
  const [showModal, setShowModal] = useState(false);

  // 홈으로 이동
  const goHome = () => navigate('/');

  // 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    setNickname(null);
    navigate('/');
    window.location.reload();
  };

  // 로그인 상태 주기적 감지
  useEffect(() => {
    const interval = setInterval(() => {
      const currentNickname = localStorage.getItem('nickname');
      if (currentNickname !== nickname) {
        setNickname(currentNickname);
        setIsAuth(Boolean(currentNickname));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [nickname]);

  // 보호된 링크 접근 시 모달 표시
  const handleProtectedClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <header className="common-header">
        <nav className="common-nav">
          <div className="nav-left" onClick={goHome}>
            <img src={logoIcon} alt="Topcit Logo" className="nav-logo" />
            <div className="nav-logo-text">
              <span className="logo-bold">Topcit on the</span><br />
              <span className="logo-regular">H&nbsp;O&nbsp;S&nbsp;E&nbsp;O</span>
            </div>
          </div>

          <div className="nav-center">
            {/* TOPCIT TEST */}
            {isAuth ? (
              <NavLink
                to="/"
                state={{ openModal: true }}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                TOPCIT TEST
              </NavLink>
            ) : (
              <a href="/" onClick={handleProtectedClick}>TOPCIT TEST</a>
            )}

            {/* RANKING - 드롭다운 제거 */}
            {isAuth ? (
              <NavLink
                to="/ranking/history"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                RANKING
              </NavLink>
            ) : (
              <a href="/ranking/history" onClick={handleProtectedClick}>RANKING</a>
            )}

            {/* MY PAGE */}
            {isAuth ? (
              <NavLink
                to="/mypage"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                MY PAGE
              </NavLink>
            ) : (
              <a href="/mypage" onClick={handleProtectedClick}>MY PAGE</a>
            )}

            {/* 로그인/로그아웃 */}
            {isAuth ? (
              <button className="nav-login-btn" onClick={handleLogout}>
                <img src={logoutIcon} alt="Logout Icon" className="auth-icon" />
                <span>LOGOUT</span>
              </button>
            ) : (
              <NavLink to="/login" className="nav-login-btn">
                <img src={loginIcon} alt="Login Icon" className="auth-icon" />
                <span>LOGIN</span>
              </NavLink>
            )}

            <div className="divider" />
          </div>
        </nav>
      </header>

      {/* 비로그인 접근 시 모달 */}
      {showModal && (
        <SignupModal
          message="회원가입 후 이용해주세요!"
          onClose={() => {
            setShowModal(false);
            navigate('/');
          }}
        />
      )}
    </>
  );
};

export default CommonNav;
