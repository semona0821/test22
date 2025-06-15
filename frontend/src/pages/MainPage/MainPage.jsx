// src/pages/MainPage/MainPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import SelectionModal from '../../components/SelectionModal.jsx';
import SignupModal    from '../../components/SignupModal.jsx';

import HeroImg     from '../../assets/MainPage.png';

import './MainPage.css';

const MainPage = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // "START" 버튼 클릭 시 처리:
  //   - 실제 localStorage에 nickname이 없다면 → 회원가입 안내 모달
  //   - localStorage에 nickname이 있으면  → 영역 선택 모달
  // ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    // localStorage에서도 확인
    const storedNick = Boolean(localStorage.getItem('nickname'));

    if (!isLoggedIn || !storedNick) {
      // isLoggedIn이 false거나, localStorage에 남아있는 닉네임이 없다면
      setShowSignupModal(true);
    } else {
      // 둘 다 true라면 (정상 로그인 상태) → 영역 선택 모달
      setShowSelectionModal(true);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 모달에서 영역 선택 후 "시작" 버튼 누르면 실제 테스트 페이지로 이동
  // ─────────────────────────────────────────────────────────────
  const handleSelect = (areaKey) => {
    setShowSelectionModal(false);
    // 선택한 영역을 URL 파라미터로 전달
    navigate(`/topcit-test?area=${areaKey}`);
  };

  // ─────────────────────────────────────────────────────────────
  // CommonNav에서 "TOPCIT TEST"를 눌러 넘어온 경우:
  // location.state.openModal이 true라면 모달을 즉시 띄우기
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state && location.state.openModal) {
      const storedNick = Boolean(localStorage.getItem('nickname'));

      if (!isLoggedIn || !storedNick) {
        setShowSignupModal(true);
      } else {
        setShowSelectionModal(true);
      }

      // 한 번 처리한 뒤에는 state.openModal을 빈 객체로 바꿔서
      // 새로고침해도 모달이 다시 뜨지 않도록.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, isLoggedIn, navigate, location.pathname]);

  return (
    <div className="main-page">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* HERO SECTION (헤더 바로 아래)                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="hero-section">
        <div className="hero-container">
          {/* ─────────────────────────────────────────────────────── */}
          {/* LEFT: Tagline 카드 + 타이틀 + 부제목                    */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="hero-left">
            <div className="tagline-card">
              <span className="tagline-icon">⭐</span>
              <div className="tagline-text">
                <div className="tagline-title">Topcit</div>
                <div className="tagline-subtitle">
                  Test Of Practical Competency in IT
                </div>
              </div>
            </div>

            <h1 className="hero-title">
              Are you<br />
              <span className="hero-title-line2">
                a Competent Developer ?
              </span>
            </h1>

            <p className="hero-subtitle">
              Improve your Practical Competency with Topcit on the HOSEO
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* RIGHT: 과녁 이미지 + START 버튼                        */}
          {/* ─────────────────────────────────────────────────────── */}
          <div className="hero-right">
            <img src={HeroImg} alt="Target" className="hero-img" />
            <button className="hero-button" onClick={handleStart}>
              START
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 회원가입 안내 모달 (로그인 안 된 경우)                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showSignupModal && (
        <SignupModal
          message="로그인 후 이용해주세요!"
          onClose={() => setShowSignupModal(false)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 영역 선택 모달 (로그인된 경우)                            */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showSelectionModal && (
        <SelectionModal
          onClose={() => setShowSelectionModal(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default MainPage;
