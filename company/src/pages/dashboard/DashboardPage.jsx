import React from 'react'
import { Link } from 'react-router-dom'
import './DashboardPage.css'

/* ── 상태 뱃지 매핑 ── */
const STATUS_MAP = {
  '이용중':  { cls: 'active',   label: '이용중'   },
  '예약완료': { cls: 'complete', label: '예약완료' },
  '반납완료': { cls: 'returned', label: '반납완료' },
  '분쟁중':  { cls: 'dispute',  label: '분쟁중'   },
}

export default function DashboardPage() {
  /* ── 통계 ── */
  const stats = [
    {
      title: '총 수익',
      value: '12,500,000원',
      subtitle: '전체 누적 수익',
      icon: '💰',
      badge: { label: '+12.4%', type: 'up' },
      barPct: 72,
      accent: '#F5A623',
    },
    {
      title: '정산 대기',
      value: '850,000원',
      subtitle: '처리 대기 중',
      icon: '⏳',
      badge: { label: '3건 대기', type: 'wait' },
      barPct: 28,
      accent: '#fb923c',
    },
    {
      title: '운영 현황',
      value: '8대',
      subtitle: '완료 예약 45건',
      icon: '🚗',
      badge: { label: '가동률 80%', type: 'info' },
      barPct: 80,
      accent: '#818cf8',
    },
  ]

  /* ── 최근 예약 ── */
  const recentReservations = [
    { id: 1, carName: '현대 아반떼', customerName: '김철수', date: '2026.03.05', amount: '150,000원', status: '이용중' },
    { id: 2, carName: '기아 K5',    customerName: '이영희', date: '2026.03.07', amount: '180,000원', status: '예약완료' },
    { id: 3, carName: 'BMW 320i',  customerName: '박민수', date: '2026.03.04', amount: '360,000원', status: '반납완료' },
    { id: 4, carName: '현대 싼타페', customerName: '최지은', date: '2026.02.28', amount: '240,000원', status: '분쟁중' },
  ]

  /* ── 차량 상태 바 ── */
  const carStatus = [
    { label: '운행중',  count: 5, pct: 62,  color: '#F5A623' },
    { label: '대기중',  count: 2, pct: 25,  color: '#818cf8' },
    { label: '정비중',  count: 1, pct: 13,  color: '#fb923c' },
  ]

  /* ── 월별 수익 미니 차트 ── */
  const monthlyRevenue = [
    { month: '10월', value: 65 },
    { month: '11월', value: 48 },
    { month: '12월', value: 80 },
    { month: '1월',  value: 55 },
    { month: '2월',  value: 70 },
    { month: '3월',  value: 88, highlight: true },
  ]
  const maxVal = Math.max(...monthlyRevenue.map(d => d.value))

  /* ── 오늘 날짜 ── */
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="dashboard-page">

      {/* ── 헤더 ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-inner">
          <div>
            <h1 className="page-title">대시보드</h1>
            <p className="page-subtitle">수익 현황과 예약 관리를 한눈에 확인하세요</p>
          </div>
          <span className="header-date">📅 {today}</span>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ '--card-accent': stat.accent }}
          >
            <div className="stat-card-top">
              <div className="stat-card-icon">{stat.icon}</div>
              <span className={`stat-card-badge ${stat.badge.type}`}>{stat.badge.label}</span>
            </div>
            <div className="stat-card-title">{stat.title}</div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-subtitle">{stat.subtitle}</div>
            <div className="stat-card-bar-wrap">
              <div className="stat-card-bar" style={{ width: `${stat.barPct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── 하단 2열 그리드 ── */}
      <div className="dashboard-bottom-grid">

        {/* 최근 예약 테이블 */}
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-icon">📋</span>
              최근 예약
            </h2>
            <Link to="/reservations" className="section-link">전체보기 →</Link>
          </div>
          <div className="reservation-table-wrap">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>차량</th>
                  <th>대여자</th>
                  <th>예약일</th>
                  <th>금액</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map(r => {
                  const s = STATUS_MAP[r.status] ?? { cls: '', label: r.status }
                  return (
                    <tr key={r.id}>
                      <td className="res-car">{r.carName}</td>
                      <td>{r.customerName}</td>
                      <td>{r.date}</td>
                      <td className="res-amount">{r.amount}</td>
                      <td>
                        <span className={`status-badge ${s.cls}`}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우측 패널 */}
        <div className="quick-panel">

          {/* 월별 수익 미니 차트 */}
          <div className="quick-card">
            <div className="quick-card-title">월별 수익 추이</div>
            <div className="mini-chart">
              {monthlyRevenue.map((d, i) => (
                <div key={i} className="mini-bar-col">
                  <div
                    className={`mini-bar${d.highlight ? ' highlight' : ''}`}
                    style={{
                      height: `${(d.value / maxVal) * 48}px`,
                      animationDelay: `${0.5 + i * 0.06}s`,
                    }}
                  />
                  <span className="mini-bar-label">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="mini-chart-total">
              <span className="mini-chart-total-value">12.5M</span>
              <span className="mini-chart-total-label">이번 달 누적</span>
            </div>
          </div>

          {/* 차량 상태 */}
          <div className="quick-card">
            <div className="quick-card-title">차량 운영 현황</div>
            <div className="status-bars">
              {carStatus.map((s, i) => (
                <div key={i} className="status-bar-row">
                  <span className="status-bar-label">{s.label}</span>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{
                        width: `${s.pct}%`,
                        background: s.color,
                        animationDelay: `${0.55 + i * 0.1}s`,
                      }}
                    />
                  </div>
                  <span className="status-bar-count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}