import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import faceIcon from '../../assets/face_icon.png'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import './ProfilePage.css'

export default function ProfilePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/landing')
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={faceIcon} alt="프로필" className="profile-avatar" />
        <p className="profile-name">{t('profile.userName')}</p>
        <p className="profile-email">user@example.com</p>
      </div>

      <ul className="profile-menu">
        <li className="profile-menu-item" onClick={() => navigate('/wallet')}>
          {t('profile.wallet')}
        </li>
        <li className="profile-menu-item">{t('profile.editInfo')}</li>
        <li className="profile-menu-item">{t('profile.reservations')}</li>
        <li
          className="profile-menu-item"
          onClick={() => navigate('/language', { state: { from: 'profile' } })}
        >
          {t('profile.languageSettings')}
        </li>
        <li className="profile-menu-item">{t('profile.customerSupport')}</li>
        <li className="profile-menu-item logout" onClick={handleLogout}>
          {t('profile.logout')}
        </li>
      </ul>

      <BottomNav />
    </div>
  )
}
