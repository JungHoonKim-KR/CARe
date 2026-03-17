import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import passportIcon from '../../assets/passport_icon.png'
import './DIDConfirmPage.css'

export default function DIDConfirmPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const image = state?.image
  const docType = state?.docType || 'passport'

  const isPassport = docType === 'passport'
  const [form, setForm] = useState({ name: '', docNo: '', issueDate: '' })

  const setField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = () => {
    // TODO: OCR AI integration, send to server
    localStorage.setItem(`${docType}_verified`, 'true')
    navigate('/did-auth')
  }

  return (
    <div className="did-confirm-page">
      <div className="did-confirm-header">
        <h2 className="did-confirm-title">
          <span className="did-confirm-highlight">
            {isPassport ? '여권 정보를' : '국제운전면허증 정보를'}
          </span><br />확인해 주세요.
        </h2>
      </div>

      {/* Captured image preview */}
      <div className="did-confirm-preview-wrap">
        {image ? (
          <img src={image} alt="촬영된 서류" className="did-confirm-preview-img" />
        ) : (
          <div className="did-confirm-preview-placeholder">
            <img src={passportIcon} alt="서류 아이콘" />
          </div>
        )}
      </div>

      <button className="did-retake-btn" onClick={() => navigate('/did-camera', { state: { docType } })}>
        다시 촬영하기
      </button>

      {/* Input form */}
      <div className="did-confirm-form">
        <div className="did-input-group">
          <label className="did-input-label">이름 (영문)</label>
          <input
            type="text"
            className="did-input"
            placeholder="HONG GIL DONG"
            value={form.name}
            onChange={setField('name')}
          />
        </div>
        <div className="did-input-group">
          <label className="did-input-label">{isPassport ? '여권번호' : '면허증 번호'}</label>
          <input
            type="text"
            className="did-input"
            placeholder={isPassport ? 'M12345678' : 'IDP-12345678'}
            value={form.docNo}
            onChange={setField('docNo')}
          />
        </div>
        <div className="did-input-group">
          <label className="did-input-label">발급일자</label>
          <input
            type="text"
            className="did-input"
            placeholder="YYYY-MM-DD"
            value={form.issueDate}
            onChange={setField('issueDate')}
          />
        </div>
      </div>

      <div className="did-confirm-footer">
        <button className="did-confirm-primary-btn" onClick={handleSubmit}>
          {isPassport ? '여권정보 등록하기' : '면허증 정보 등록하기'}
        </button>
      </div>
    </div>
  )
}
