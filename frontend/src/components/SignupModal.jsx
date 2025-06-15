import React from 'react';
import './SignupModal.css';

const SignupModal = ({ onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <p>회원 가입 후 이용해주세요!</p>
      <button className="modal-btn" onClick={onClose}>확인</button>
    </div>
  </div>
);

export default SignupModal;
