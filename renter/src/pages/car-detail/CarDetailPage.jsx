import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import BottomNav from '../../components/BottomNav'
import './CarDetailPage.css'

const INSURANCE_PLANS = [
  {
    id: 'basic',
    label: '베이직',
    price: 45,
    coverage: '차량손해면책',
    deductible: '자기부담금 T500,000',
    icon: '⏱',
  },
  {
    id: 'standard',
    label: '스탠다드',
    price: 80,
    coverage: '제3자 책임보험',
    deductible: '자기부담금 T300,000',
    icon: '🗓',
  },
  {
    id: 'premium',
    label: '프리미엄',
    price: 125,
    coverage: '완전 면책',
    deductible: '자기부담금 T0',
    icon: '⭐',
  },
]

const TERMS = [
  { id: 'service',   label: '렌터카 서비스 이용 약관', required: true },
  { id: 'insurance', label: '보험 및 보장 약관',        required: true },
  { id: 'cancel',    label: '취소 및 환불 정책',         required: true },
  { id: 'privacy',   label: '개인정보 처리 방침',        required: true },
]

const AI_SUMMARY = {
  insurance: [
    { icon: '🛡', title: '고가 차량 보호',    desc: 'SL65 AMG는 고가 차량으로, 사고 시 수리비가 높습니다.' },
    { icon: '⚠️', title: '첫 한국 방문',     desc: '해외 운전 경험이 적은 고객에게 종합 보험을 권장합니다.' },
    { icon: '📈', title: '85%의 고객 선택', desc: '유사 조건의 고객 중 대다수가 이 플랜을 선택했습니다.' },
  ],
}

export default function CarDetailPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const car        = state?.car        || {}
  const searchInfo = state?.searchInfo || {}

  const [imgIdx, setImgIdx]         = useState(0)
  const [insurance, setInsurance]   = useState('basic')
  const [favorite, setFavorite]     = useState(false)
  const [allChecked, setAllChecked] = useState(false)
  const [termChecks, setTermChecks] = useState(
    Object.fromEntries(TERMS.map((t) => [t.id, false]))
  )
  const [expandedTerm, setExpandedTerm] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)

  const selectedPlan = INSURANCE_PLANS.find((p) => p.id === insurance)
  const basePrice    = car.pricePerDay || 1033
  const totalPrice   = basePrice + selectedPlan.price

  const toggleAll = () => {
    const next = !allChecked
    setAllChecked(next)
    setTermChecks(Object.fromEntries(TERMS.map((t) => [t.id, next])))
  }

  const toggleTerm = (id) => {
    const next = { ...termChecks, [id]: !termChecks[id] }
    setTermChecks(next)
    setAllChecked(TERMS.every((t) => next[t.id]))
  }

  const allRequired = TERMS.filter((t) => t.required).every((t) => termChecks[t.id])

  const handleReserve = () => {
    if (!allRequired) {
      alert('필수 약관에 모두 동의해 주세요.')
      return
    }
    navigate('/payment', {
      state: {
        car,
        searchInfo,
        insurance: selectedPlan,
        rentalPrice: basePrice,
        deposit: 300,
        total: totalPrice + 300,
      },
    })
  }

  const services = car.services || {
    included: ['무료 GPS', '스노우 체인', '무제한 주행거리', '조건조건 1'],
    excluded: ['스노우 체인', '유아용 카시트'],
  }

  return (
    <div className="cd-wrap">
      {/* 헤더 */}
      <header className="cd-header">
        <img src={careLogo} alt="CARe" className="cd-logo" />
        <button className="cd-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="cd-header-title">{car.name || '메르세데스-벤츠 SL65 AMG'}</h1>
        <button className="cd-fav" onClick={() => setFavorite(!favorite)}>
          {favorite
            ? <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F7A633"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="#bbb"/></svg>
          }
        </button>
      </header>

      <div className="cd-scroll">
        {/* 차량 이미지 슬라이더 */}
        <div className="cd-img-area">
          <button className="cd-arr cd-arr-l" onClick={() => setImgIdx(p => Math.max(0, p - 1))}>‹</button>
          <span className="cd-car-img">{car.emoji || '🚗'}</span>
          <button className="cd-arr cd-arr-r" onClick={() => setImgIdx(p => Math.min(2, p + 1))}>›</button>
          <div className="cd-dots">
            {[0,1,2].map(i => <span key={i} className={`cd-dot${imgIdx === i ? ' on' : ''}`}/>)}
          </div>
        </div>

        {/* 평점 */}
        <div className="cd-rating">
          <span className="cd-star">★</span>
          <span className="cd-rv">{car.rating || 4.9}</span>
          <span className="cd-rcnt">({car.reviews || 230} Reviews)</span>
        </div>

        {/* 차량 상세 사양 */}
        <div className="cd-section">
          <p className="cd-sec-title">차량 상세 사양</p>
          <div className="cd-spec-grid">
            <div className="cd-spec-cell">
              <p className="cd-spec-lbl">생산년도</p>
              <p className="cd-spec-val">{car.year || '2024년 3월'}</p>
            </div>
            <div className="cd-spec-cell cd-spec-mid">
              <p className="cd-spec-lbl">주행거리</p>
              <p className="cd-spec-val">{car.mileage || '12,450 km/h'}</p>
            </div>
            <div className="cd-spec-cell">
              <p className="cd-spec-lbl">연료</p>
              <p className="cd-spec-val">{car.fuel || '가솔린'}</p>
            </div>
          </div>
        </div>

        {/* 보험 */}
        <div className="cd-section">
          <p className="cd-sec-title">보험</p>
          <div className="cd-ins-row">
            {INSURANCE_PLANS.map(plan => (
              <button
                key={plan.id}
                className={`cd-ins-card${insurance === plan.id ? ' sel' : ''}`}
                onClick={() => setInsurance(plan.id)}
              >
                <span className="cd-ins-ico">{plan.icon}</span>
                <p className="cd-ins-lbl">{plan.label}</p>
                <p className="cd-ins-price">{plan.price}T</p>
                <p className="cd-ins-cov">{plan.coverage}</p>
                <p className="cd-ins-ded">{plan.deductible}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 포함 서비스 */}
        <div className="cd-section">
          <p className="cd-sec-title">포함 서비스</p>
          <div className="cd-svc-box">
            <div className="cd-svc-grid">
              {services.included.map(s => (
                <div key={s} className="cd-svc-item">
                  <span className="cd-svc-chk">✓</span>
                  <span className="cd-svc-name">{s}</span>
                </div>
              ))}
              {services.excluded.map(s => (
                <div key={s} className="cd-svc-item">
                  <span className="cd-svc-x">✕</span>
                  <span className="cd-svc-name cd-svc-off">{s}</span>
                </div>
              ))}
            </div>
            <div className="cd-company">
              <div className="cd-co-logo">O</div>
              <span className="cd-co-name">{car.company || 'ORIX Rent-A-Car'}</span>
              <button className="cd-co-link">업체 정보 보기</button>
            </div>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="cd-section cd-section-last">
          <p className="cd-sec-title">약관 동의</p>

          {/* 전체 동의 */}
          <div className="cd-term-all" onClick={toggleAll}>
            <span className={`cd-chk${allChecked ? ' chk-on' : ''}`}>{allChecked && '✓'}</span>
            <span className="cd-term-all-txt">전체 동의하기</span>
          </div>

          {/* 개별 약관 */}
          {TERMS.map(term => (
            <div key={term.id} className="cd-term-wrap">
              <div className="cd-term-row">
                <span
                  className={`cd-chk${termChecks[term.id] ? ' chk-on' : ''}`}
                  onClick={() => toggleTerm(term.id)}
                >{termChecks[term.id] && '✓'}</span>
                <span className="cd-term-txt">{term.label}</span>
                <span className="cd-term-req">(필수)</span>
                <button
                  className="cd-chev"
                  onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    style={{ transform: expandedTerm === term.id ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" stroke="#aaa" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {expandedTerm === term.id && (
                <div className="cd-ai-box">
                  {AI_SUMMARY[term.id] ? (
                    <>
                      <button className="cd-ai-btn">⭐ AI 요약</button>
                      <div className="cd-ai-list">
                        {AI_SUMMARY[term.id].map(pt => (
                          <div key={pt.title} className="cd-ai-item">
                            <span className="cd-ai-ico">{pt.icon}</span>
                            <div>
                              <p className="cd-ai-ttl">{pt.title}</p>
                              <p className="cd-ai-dsc">{pt.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="cd-trans-row">
                        <button className={`cd-trans${!showTranslation ? ' trans-on' : ''}`} onClick={() => setShowTranslation(false)}>번역보기</button>
                        <button className={`cd-trans${showTranslation ? ' trans-on' : ''}`}  onClick={() => setShowTranslation(true)}>원문보기</button>
                      </div>
                      <p className="cd-term-body">
                        {showTranslation
                          ? '心が傷ついた時、その心を元の健康な状態に戻すことを「リカバリー」と言います。今この時身で耐え立ち直っていくことがとても大切だと思います。'
                          : '보험 약관의 주요 내용입니다. 차량 손해, 대인·대물 배상 및 자기 신체 손해에 관한 보상 범위와 자기부담금이 명시되어 있습니다.'}
                      </p>
                    </>
                  ) : (
                    <p className="cd-term-body">
                      해당 약관의 상세 내용을 확인하세요. 서비스 이용에 관한 권리, 의무 및 제한 사항이 포함되어 있습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ height: 130 }} />
      </div>

      {/* 하단 고정 바 */}
      <div className="cd-bar">
        <div className="cd-bar-price">
          <p className="cd-bar-lbl">총 금액</p>
          <p className="cd-bar-amt">{totalPrice.toLocaleString()} <span className="cd-bar-unit">USDC</span></p>
        </div>
        <button className="cd-bar-btn" onClick={handleReserve}>예약하기 ›</button>
      </div>

      <BottomNav />
    </div>
  )
}
