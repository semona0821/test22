import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonNav from '../../components/CommonNav.jsx';
import Bronze from '../../assets/MyPageTiers/MyPageBronze.png';
import Silver from '../../assets/MyPageTiers/MyPageSilver.png';
import Gold from '../../assets/MyPageTiers/MyPageGold.png';
import Platinum from '../../assets/MyPageTiers/MyPagePlatinum.png';
import Diamond from '../../assets/MyPageTiers/MyPageDiamond.png';
import Unrank from '../../assets/MyPageTiers/MyPageUnrank.png';
import './MyPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const tierMap = {
  bronze: Bronze,
  silver: Silver,
  gold: Gold,
  platinum: Platinum,
  diamond: Diamond,
  unrank: Unrank,
};

const MyPage = () => {
  const [nickname, setNickname] = useState('');
  const [scores, setScores] = useState({});
  const [tierImage, setTierImage] = useState(Unrank);
  const [editMode, setEditMode] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        const localNickname = localStorage.getItem('nickname');
        if (!studentId) {
          console.error("❌ studentId 없음");
          return;
        }

        setNickname(localNickname || "닉네임 없음");

        const res = await axios.post(`${BACKEND_URL}/rank/my`, {
          seasonId: "1",
          studentId: studentId
        });

        console.log("✅ /rank/my 응답:", res.data);

        const data = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
        if (!data) {
          console.warn("⚠️ 유저 랭킹 데이터 없음");
          setScores({
            "소프트웨어 개발": 0,
            "데이터 이해와 활용": 0,
            "시스템 아키텍처 이해와 활용": 0,
            "정보 보안 이해와 활용": 0,
            "IT 비즈니스와 윤리": 0,
            "프로젝트 관리 및 커뮤니케이션": 0,
          });
          return;
        }

        setNickname(data.nickname);
        setScores({
          "소프트웨어 개발": data.lecture1Score ?? 0,
          "데이터 이해와 활용": data.lecture2Score ?? 0,
          "시스템 아키텍처 이해와 활용": data.lecture3Score ?? 0,
          "정보 보안 이해와 활용": data.lecture4Score ?? 0,
          "IT 비즈니스와 윤리": data.lecture5Score ?? 0,
          "프로젝트 관리 및 커뮤니케이션": data.lecture6Score ?? 0,
        });

        const tierKey = data.rankImage?.replace('.png', '').toLowerCase() || 'unrank';
        setTierImage(tierMap[tierKey] || Unrank);
      } catch (err) {
        console.error("❌ 마이페이지 데이터 불러오기 실패:", err);
      }
    };
    fetchData();
  }, []);

  const checkNicknameDuplication = async (nickname) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/member/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      return res.data === false; // 사용 가능하면 true 반환
    } catch (err) {
      console.error("닉네임 중복 확인 실패", err);
      return false;
    }
  };

  const handleSave = async () => {
    if (!newNick) {
      setMessage('닉네임을 입력해주세요!');
      return;
    }

    const isValid = await checkNicknameDuplication(newNick);
    if (!isValid) {
      setMessage("이미 사용 중인 닉네임입니다.");
      return;
    }

    try {
      const studentId = localStorage.getItem('studentId');
      const res = await axios.post(`${BACKEND_URL}/member/auth/change-nickname`, {
        studentId,
        newNickname: newNick,
      });

      if (res.status === 200) {
        setNickname(newNick);
        setMessage('닉네임이 변경되었습니다');
        setEditMode(false);
      } else {
        setMessage('닉네임 변경 실패');
      }
    } catch (err) {
      console.error('❌ 닉네임 변경 오류:', err);
      setMessage('서버 오류로 변경에 실패했습니다.');
    }
  };



  return (
    <div className="mypage-wrapper">
      <div className="mypage-container">
        <h2 className="mypage-title">
          {nickname ? `${nickname}'s Page` : 'My Page'}
        </h2>

        <div className="mypage-content">
          <div className="banner-section">
            <img src={tierImage} alt="티어 이미지" className="tier-banner-img" />
            {editMode ? (
              <div className="nick-edit-inline">
                <input
                  type="text"
                  className="nick-input"
                  placeholder="새 닉네임"
                  value={newNick}
                  onChange={e => setNewNick(e.target.value)}
                />
                <button className="btn-save" onClick={handleSave}>저장</button>
              </div>
            ) : (
              <button className="btn-edit-inline" onClick={() => setEditMode(true)}>
                닉네임 변경 ⚙️
              </button>
            )}
            {message && <p className="nick-message">{message}</p>}
          </div>

          <ul className="score-section">
            {Object.entries(scores || {}).map(([label, point]) => (
              <li key={label}>
                {label}: <span>{point}점</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
