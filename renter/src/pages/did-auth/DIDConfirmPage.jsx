import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import passportIcon from '../../assets/passport_icon.png'
import { renterLicense } from '../../api/auth'
import './DIDConfirmPage.css'

export default function DIDConfirmPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const image = state?.image
  const docType = state?.docType || 'passport'

  const isPassport = docType === 'passport'

  const [form, setForm] = useState({
    name: '',
    passportNo: '',
    birthDate: '',
    issueDate: '',
    expiryDate: '',
    // 면허증 분할 필드
    licenZero: '',
    licenFirst: '',
    licenSecond: '',
    licenThird: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const payload = isPassport
        ? {
            docType: 'PASSPORT',
            passportName: form.name,
            passportNo: form.passportNo,
            birthDate: form.birthDate.replace(/-/g, ''),
            issueDate: form.issueDate.replace(/-/g, ''),
            expiryDate: form.expiryDate.replace(/-/g, ''),
          }
        : {
            docType: 'INT_LICENSE',
            name: form.name,
            birthY: form.birthDate.slice(0, 4),
            birthM: form.birthDate.slice(5, 7),
            birthD: form.birthDate.slice(8, 10),
            licenZero: form.licenZero,
            licenFirst: form.licenFirst,
            licenSecond: form.licenSecond,
            licenThird: form.licenThird,
            issueDate: form.issueDate.replace(/-/g, ''),
          }

      const res = await renterLicense(payload)

      if (res.verified) {
        localStorage.setItem(`${docType}_verified`, 'true')

        // 여권이면 DID 카드에 표시할 정보 저장
        if (isPassport) {
          localStorage.setItem('did_name', form.name)
          localStorage.setItem('did_docId', res.docId || '')
          localStorage.setItem('did_expiry', form.expiryDate.replace(/-/g, ''))
        }

        const bothDone =
          localStorage.getItem('passport_verified') === 'true' &&
          localStorage.getItem('license_verified') === 'true'

        if (bothDone) {
          // 둘 다 완료 → DID+VC는 백엔드에서 자동 처리 → 카드 페이지로
          navigate('/did-card', {
            state: {
              name: localStorage.getItem('did_name') || form.name,
              docId: localStorage.getItem('did_docId') || res.docId,
              expiryDate: localStorage.getItem('did_expiry') || '',
            },
          })
        } else {
          navigate('/did-auth')
        }
      } else {
        setError('인증에 실패했습니다. 입력 정보를 다시 확인해 주세요.')
      }
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
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
          <label className="did-input-label">{isPassport ? '여권번호' : '면허증 번호 (4자리-2자리-6자리-2자리)'}</label>
          {isPassport ? (
            <input
              type="text"
              className="did-input"
              placeholder="M12345678"
              value={form.passportNo}
              onChange={setField('passportNo')}
            />
          ) : (
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="text" className="did-input" placeholder="11" value={form.licenZero} onChange={setField('licenZero')} style={{ width: '20%' }} />
              <input type="text" className="did-input" placeholder="22" value={form.licenFirst} onChange={setField('licenFirst')} style={{ width: '20%' }} />
              <input type="text" className="did-input" placeholder="123456" value={form.licenSecond} onChange={setField('licenSecond')} style={{ width: '35%' }} />
              <input type="text" className="did-input" placeholder="78" value={form.licenThird} onChange={setField('licenThird')} style={{ width: '20%' }} />
            </div>
          )}
        </div>
        <div className="did-input-group">
          <label className="did-input-label">생년월일</label>
          <input
            type="text"
            className="did-input"
            placeholder="YYYY-MM-DD"
            value={form.birthDate}
            onChange={setField('birthDate')}
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
        {isPassport && (
          <div className="did-input-group">
            <label className="did-input-label">만료일자</label>
            <input
              type="text"
              className="did-input"
              placeholder="YYYY-MM-DD"
              value={form.expiryDate}
              onChange={setField('expiryDate')}
            />
          </div>
        )}
      </div>

      {error && <p className="did-confirm-error">{error}</p>}

      <div className="did-confirm-footer">
        <button
          className="did-confirm-primary-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '확인 중...' : isPassport ? '여권정보 등록하기' : '면허증 정보 등록하기'}
        </button>
      </div>
    </div>
  )
}
