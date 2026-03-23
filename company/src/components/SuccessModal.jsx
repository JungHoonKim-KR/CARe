import React, { useEffect } from 'react'
import './SuccessModal.css'

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = '확인'
}) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 모달이 열리면 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="success-modal-backdrop" onClick={handleBackdropClick}>
      <div className="success-modal-container">
        <button className="success-modal-close" onClick={onClose} aria-label="닫기">
          ×
        </button>

        <div className="success-modal-content">
          {/* Success Icon */}
          <div className="success-modal-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#DCFCE7"/>
              <path d="M20 32L28 40L44 24" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Title */}
          <h2 className="success-modal-title">{title}</h2>

          {/* Message */}
          {message && <p className="success-modal-message">{message}</p>}

          {/* Button */}
          <button
            className="success-modal-button"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
