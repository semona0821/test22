// TopcitTestPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './TopcitTestPage.css'
import SelectionModal from '../../components/SelectionModal'

const areaKeyToId = {
  software: 1,
  data: 2,
  architecture: 3,
  security: 4,
  business: 5,
  project: 6,
}

const TOTAL_QUESTIONS = 20
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TopcitTestPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [area, setArea] = useState(null)
  const [lectureId, setLectureId] = useState(null)
  const [questionId, setQuestionId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [errorTitle, setErrorTitle] = useState('')
  const [errorContent, setErrorContent] = useState('')
  const studentId = localStorage.getItem('studentId')

  const token = 'String'

  // 컴포넌트 마운트 시 URL 파라미터에서 영역 확인
  useEffect(() => {
    const areaFromUrl = searchParams.get('area')
    if (areaFromUrl && areaKeyToId[areaFromUrl]) {
      handleAreaSelect(areaFromUrl)
    }
  }, [searchParams])

  // ✅ 경고창 복구 - 새로고침, 닫기 차단
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isReviewMode && currentQuestion) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isReviewMode, currentQuestion])

  // ✅ 경고창 복구 - React Router 탐색 차단
  useEffect(() => {
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    const confirmLeave = (url) => {
      if (!isReviewMode && currentQuestion) {
        const shouldLeave = window.confirm('현재 문제 풀이 중입니다. 페이지를 이동하시겠습니까?')
        if (!shouldLeave) throw new Error('navigation cancelled')
      }
    }

    window.history.pushState = function (...args) {
      confirmLeave(args[2])
      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function (...args) {
      confirmLeave(args[2])
      return originalReplaceState.apply(this, args)
    }

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [isReviewMode, currentQuestion])

  const handleAreaSelect = async (selectedAreaKey) => {
    const lecId = areaKeyToId[selectedAreaKey]
    setArea(selectedAreaKey)
    setLectureId(lecId)
    setCurrentIndex(1)

    const res = await fetch(`${BACKEND_URL}/quiz/lecture/${lecId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token, 'student-id': studentId },
    })

    if (!res.ok) {
      alert('문제를 불러오는 중 서버 오류가 발생했습니다.')
      return
    }

    const data = await res.json()
    setQuestionId(data.questionId)
    setCurrentQuestion(data)
  }

  const submitCurrentAnswer = async () => {
    const answer = selectedAnswers[currentIndex] || ''
    await fetch(`${BACKEND_URL}/quiz/${currentIndex}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token, 'student-id': studentId },
      body: JSON.stringify({
        lectureId,
        questionId,
        questionNumber: currentIndex,
        userAnswer: answer,
      }),
    })
  }

  const fetchQuestion = async (questionNumber, review = false) => {
    let url, body
    if (review) {
      url = `${BACKEND_URL}/quiz/result/${questionNumber}`
      body = JSON.stringify({ lectureId, questionId })
    } else {
      url = `${BACKEND_URL}/quiz/${questionNumber}`
      body = JSON.stringify({
        lectureId,
        questionId,
        questionNumber,
        userAnswer: selectedAnswers[questionNumber] || '',
      })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token, 'student-id': studentId },
      body,
    })

    if (!res.ok) return null

    const data = await res.json()
    setQuestionId(data.questionId)
    setCurrentQuestion(data)
    return data
  }

  const handleOptionClick = (id) => {
    if (isReviewMode || !Boolean(currentQuestion.questionType)) return
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: id })
  }

  const handlePrevious = async () => {
    if (currentIndex === 1) {
      if (isReviewMode) {
        const exit = window.confirm('검토를 종료하시겠습니까?')
        if (exit) navigate('/')
      }
      return
    }
    if (!isReviewMode) await submitCurrentAnswer()
    const newIndex = currentIndex - 1
    const data = await fetchQuestion(newIndex, isReviewMode)
    if (data) {
      setCurrentIndex(newIndex)
      setCurrentQuestion(data)
    }
  }

  const handleNext = async () => {
  const userAnswer = isReviewMode ? currentQuestion.userAnswer : selectedAnswers[currentIndex]
  const isEmpty = Boolean(currentQuestion.questionType) ? userAnswer == null : !userAnswer?.trim()

  if (!isReviewMode && isEmpty) {
    alert('답안을 입력하거나 선택해야 다음 문제로 넘어갈 수 있습니다.')
    return
  }

  if (!isReviewMode) await submitCurrentAnswer()

  const nextIndex = currentIndex + 1

  // 검토 모드 종료 조건
  if (isReviewMode && nextIndex > TOTAL_QUESTIONS) {
    const exit = window.confirm('문제 검토를 종료하시겠습니까?')
    if (exit) {
      setIsReviewMode(false)  // ✅ 여기 추가!
      navigate('/')
    }
    return
  }


  const data = await fetchQuestion(nextIndex, isReviewMode)
  if (data) {
    setCurrentIndex(nextIndex)
    setCurrentQuestion(data)
  }
}

  const handleFinish = async () => {
    const userAnswer = isReviewMode ? currentQuestion.userAnswer : selectedAnswers[currentIndex]
    const isEmpty = Boolean(currentQuestion.questionType) ? userAnswer == null : !userAnswer?.trim()

    if (!isReviewMode && isEmpty) {
      alert('답안을 입력하거나 선택해야 제출할 수 있습니다.')
      return
    }

    const wantSubmit = window.confirm('문제를 제출하시겠습니까?')
    if (!wantSubmit) return

    await fetch(`${BACKEND_URL}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token, 'student-id': studentId },
      body: JSON.stringify({
        lectureId,
        questionId,
        questionNumber: currentIndex,
        userAnswer,
      }),
    })

    const wantReview = window.confirm('문제를 검토하시겠습니까?')
    if (wantReview) {
      setIsReviewMode(true)
      setCurrentIndex(1)
      const res = await fetch(`${BACKEND_URL}/quiz/result/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token, 'student-id': studentId },
        body: JSON.stringify({ lectureId, questionId }),
      })
      if (!res.ok) return
      const data = await res.json()
      setQuestionId(data.questionId)
      setCurrentQuestion(data)
    } else {
      navigate('/')
    }
  }

  const handleErrorSubmit = async () => {
    if (!errorTitle.trim() || !errorContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    const res = await fetch(`${BACKEND_URL}/error/${questionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token, 'student-id': studentId },
      body: JSON.stringify({ errorTitle, errorContent }),
    })

    if (!res.ok) {
      alert('오류 신고 중 문제가 발생했습니다.')
      return
    }

    alert(await res.text())
    setShowPopup(false)
    setErrorTitle('')
    setErrorContent('')
  }

  if (!area) return <SelectionModal onSelect={handleAreaSelect} onClose={() => {}} />
  if (!currentQuestion) return <div>문제를 불러오는 중...</div>

  const userAnswer = isReviewMode ? currentQuestion.userAnswer : selectedAnswers[currentIndex]
  const correctAnswer = currentQuestion.correctAnswer
  const isCorrect = currentQuestion.isCorrect

  return (
    <div className="page-container">
      <section className="problem-box">
        <div className="button-group">
          <button onClick={() => setShowPopup(true)}>Error <span>!</span></button>
          {currentIndex < TOTAL_QUESTIONS ? (
            <button onClick={handleNext}>Next →</button>
          ) : (
            <button onClick={handleFinish}>Finish</button>
          )}
          <button onClick={handlePrevious} disabled={currentIndex === 1}>← Previous</button>
        </div>

        <div className="progress">{currentIndex} / {TOTAL_QUESTIONS}</div>
        <h2>{currentQuestion.questionContent || currentQuestion.questionContext}</h2>
          {/* 정답률 표시 */}
           <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
             정답률: {(currentQuestion.correctRate).toFixed(1)}%
           </div>
        {Boolean(currentQuestion.questionType) ? (
          <ul className="option-list">
            {Object.entries(currentQuestion.options).map(([id, text]) => {
              const isCorrectAnswer = String(id) === String(correctAnswer)
              const isUserSelected = String(id) === String(userAnswer)
              let className = 'option'
              if (isReviewMode) {
                if (isCorrectAnswer) className += ' correct'
                if (isUserSelected && !isCorrect) className += ' incorrect'
              } else {
                if (isUserSelected) className += ' selected'
              }
              return (
                <li key={id} className={className} onClick={() => handleOptionClick(id)}>
                  {text}
                </li>
              )
            })}
          </ul>
        ) : (
          <div>
            {!isReviewMode ? (
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) =>
                  setSelectedAnswers({ ...selectedAnswers, [currentIndex]: e.target.value })
                }
                className="subjective-input"
              />
            ) : (
              <>
                <div className={`subjective-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div>당신의 답변: {userAnswer || '무응답'}</div>
                </div>
                <div className="subjective-answer">정답: {correctAnswer}</div>
              </>
            )}
          </div>
        )}
      </section>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">
              <span className="popup-icon">❗</span>
              <span className="popup-title">오류 신고</span>
              <button
                className="popup-close"
                onClick={() => {
                  setShowPopup(false)
                  setErrorTitle('')
                  setErrorContent('')
                }}
              >
                X
              </button>
            </div>
            <div className="popup-body">
              <label>제목</label>
              <input
                type="text"
                className="popup-input"
                value={errorTitle}
                onChange={(e) => setErrorTitle(e.target.value)}
                placeholder="오류 제목을 입력하세요"
              />
              <label>내용</label>
              <textarea
                className="popup-textarea"
                rows="5"
                value={errorContent}
                onChange={(e) => setErrorContent(e.target.value)}
                placeholder="오류 내용을 구체적으로 설명해주세요"
              />
              <button className="popup-submit" onClick={handleErrorSubmit}>등록하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopcitTestPage
