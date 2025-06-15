import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css';

import CommonNav       from './components/CommonNav.jsx'
import MainPage        from './pages/MainPage/MainPage.jsx'
import LoginPage       from './pages/LoginPage/LoginPage.jsx'
import SignupPage      from './pages/SignupPage/SignupPage.jsx'
import TopcitTestPage  from './pages/TopcitTestPage/TopcitTestPage.jsx'
import RankingPage     from './pages/RankingPage/RankingPage.jsx'
import MyPage          from './pages/MyPage/MyPage.jsx'
import PasswordResetPage from './pages/PasswordResetPage/PasswordResetPage.jsx';

function App() {

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel(); // 원탭 즉시 취소
      window.google.accounts.id.disableAutoSelect(); // 자동 선택 비활성화
    }
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('nickname'))
  )

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('nickname')
    localStorage.removeItem('password')
  }

  return (
    <Router>
      <CommonNav isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={<MainPage isLoggedIn={isLoggedIn} />}
          />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLogin} />}
          />

          <Route 
            path="/signup" 
            element={<SignupPage />} 
          />

          <Route 
            path="/find-password" 
            element={<PasswordResetPage />} 
          />

          <Route
            path="/topcit-test"
            element={
              isLoggedIn
                ? <TopcitTestPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/ranking"
            element={
              isLoggedIn
                ? <RankingPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/ranking/history"
            element={
              isLoggedIn
                ? <RankingPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/mypage"
            element={
              isLoggedIn
                ? <MyPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
