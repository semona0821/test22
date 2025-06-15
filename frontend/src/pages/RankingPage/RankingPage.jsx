// src/pages/RankingPage/RankingPage.jsx

import React, { useState, useEffect } from 'react';        // React와 훅(useState, useEffect) 임포트
import './RankingPage.css';                                 // 스타일시트 임포트

// assets/RankingTiers 폴더에 있는 티어 이미지 임포트
import UnrankImg   from '../../assets/RankingTiers/Unrank.png';
import BronzeImg   from '../../assets/RankingTiers/Bronze.png';
import SilverImg   from '../../assets/RankingTiers/Silver.png';
import GoldImg     from '../../assets/RankingTiers/Gold.png';
import PlatinumImg from '../../assets/RankingTiers/Platinum.png';
import DiamondImg  from '../../assets/RankingTiers/Diamond.png';

// 티어 이미지 매핑 객체
const tierImages = {
  Unrank:   UnrankImg,
  Bronze:   BronzeImg,
  Silver:   SilverImg,
  Gold:     GoldImg,
  Platinum: PlatinumImg,
  Diamond:  DiamondImg,
};

// 백엔드 베이스 URL (실제 주소로 변경하세요)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * RankingPage 컴포넌트
 * - POST /rank/list/{seasonId} 로 랭킹 데이터를 조회
 * - totalScore 기준 내림차순 정렬 후 순위(ranking) 계산
 * - 순위, 이름, 티어, 총점, 1~6영역 점수를 테이블로 표시
 */
const RankingPage = () => {
  const [season, setSeason] = useState(1);                 // 현재 선택된 시즌 (1 또는 2)
  const [data, setData]     = useState([]);                // API로부터 받은 랭킹 데이터 배열
  const token = localStorage.getItem('token') || '';       // 로그인 토큰 (없으면 빈 문자열)

  // isActive 플래그 방식: 이전 요청 응답 무시
  useEffect(() => {
    let isActive = true;                                   // 이 effect가 유효한지 표시

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/rank/list/${season}`,               // 요청 URL
          {
            method: 'POST',                                // POST 메서드
            headers: {
              'Content-Type': 'application/json',          // JSON 형식
              token: token,                                // 인증 토큰
            },
          }
        );
        const resData = await response.json();            // JSON 파싱
        console.log(`[DEBUG] season=${season}`, resData); // 디버그 로그

        if (!isActive) return;                            // 무효화된 요청이면 무시

        if (Array.isArray(resData)) {
          // 총점 내림차순 정렬
          const sorted = [...resData].sort((a, b) => b.totalScore - a.totalScore);
          // 순위 계산 추가
          const ranked = sorted.map((item, idx) => ({
            ...item,
            ranking: idx + 1,
          }));
          setData(ranked);                                // 상태 업데이트
        } else {
          setData([]);                                    // 배열 아니면 빈
        }
      } catch (error) {
        if (isActive) {                                   // 에러 시에도 무효화 체크
          console.error('Error fetching rank list:', error);
          setData([]);
        }
      }
    };

    fetchData();                                          // 마운트 및 season 변경 시 호출

    return () => {
      isActive = false;                                   // cleanup: 이후 응답 무시
    };
  }, [season]);

  return (
    <div className="ranking-wrapper">                      {/* 전체 페이지 래퍼 */}
      {/* 시즌 탭: 1, 2 */}
      <div className="season-tabs">
        {[1, 2].map((n) => (
          <button
            key={n}
            className={season === n ? 'active' : ''}
            onClick={() => setSeason(n)}
          >
            시즌 {n}
          </button>
        ))}
      </div>
      {/* 랭킹 테이블 */}
      <div className="ranking-table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>티어</th>
              <th>총점</th>
              <th>1영역</th>
              <th>2영역</th>
              <th>3영역</th>
              <th>4영역</th>
              <th>5영역</th>
              <th>6영역</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u, idx) => {
              // "diamond.png" → "diamond" → "Diamond"
              const raw = u.rankImage.split('.')[0] || '';
              const key = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
              const src = tierImages[key] || UnrankImg;
              return (
                <tr key={`${season}-${idx}`}>             {/* 고유 key: 시즌-인덱스 */}
                  <td>{u.ranking}</td>
                  <td>{u.nickname}</td>
                  <td>
                    <img src={src} alt={key} className="tier-icon" />
                  </td>
                  <td>{u.totalScore}</td>
                  <td>{u.lecture1Score}</td>
                  <td>{u.lecture2Score}</td>
                  <td>{u.lecture3Score}</td>
                  <td>{u.lecture4Score}</td>
                  <td>{u.lecture5Score}</td>
                  <td>{u.lecture6Score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingPage;                                // 컴포넌트 내보내기
