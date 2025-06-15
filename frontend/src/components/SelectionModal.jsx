import React from 'react'
import './SelectionModal.css'

const areas = [
  { key: 'software',     label: '소프트웨어 개발' },
  { key: 'data',         label: '데이터 이해와 활용' },
  { key: 'architecture', label: '시스템 아키텍처 이해와 활용' },
  { key: 'security',     label: '정보보안 이해와 활용' },
  { key: 'business',     label: 'IT비즈니스와 윤리' },
  { key: 'project',      label: '프로젝트 관리 및 테크니컬 커뮤니케이션' },
]

const SelectionModal = ({ onClose, onSelect }) => (
  <div className="sm-overlay">
    <div className="sm-box">
      <div className="sm-header">
        <h2>문제 영역 선택</h2>
        <button className="sm-close" onClick={onClose}>×</button>
      </div>
      <div className="sm-content">
        {areas.map(area => (
          <div
            key={area.key}
            className="sm-item"
            onClick={() => onSelect(area.key)}
          >
            <div className="sm-checkbox" />
            <span>{area.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default SelectionModal
