import carIcon from '../../assets/car_icon.png'
import BottomNav from '../../components/BottomNav'
import './EmptyPage.css'

export default function MyCarPage() {
  return (
    <div className="empty-page">
      <div className="empty-content">
        <img src={carIcon} alt="My car" className="empty-icon" />
        <p className="empty-title">예약한 차량이 없어요</p>
        <p className="empty-desc">차량을 검색해서 첫 렌터카를 예약해보세요!</p>
      </div>
      <BottomNav />
    </div>
  )
}
