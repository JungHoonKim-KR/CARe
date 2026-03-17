import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SplashPage from './pages/splash/SplashPage'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import LanguageSelectPage from './pages/language/LanguageSelectPage'
import HomePage from './pages/home/HomePage'
import MyCarPage from './pages/my-car/MyCarPage'
import ProfilePage from './pages/profile/ProfilePage'
import CarListPage from './pages/car-list/CarListPage'
import CarDetailPage from './pages/car-detail/CarDetailPage'
import PaymentPage from './pages/payment/PaymentPage'
import BookingCompletePage from './pages/booking-complete/BookingCompletePage'
import WalletPage from './pages/wallet/WalletPage'
import DIDAuthPage from './pages/did-auth/DIDAuthPage'
import DIDPassportGuidePage from './pages/did-auth/DIDPassportGuidePage'
import DIDCameraPage from './pages/did-auth/DIDCameraPage'
import DIDConfirmPage from './pages/did-auth/DIDConfirmPage'
import ScanPage from './pages/scan/ScanPage'
import CarFaceAuthPage from './pages/car-faceauth/CarFaceAuthPage'
import CarSmartKeyPage from './pages/car-smartkey/CarSmartKeyPage'
import CarCrackPage from './pages/car-crack/CarCrackPage'
import DamageHistoryPage from './pages/damage-history/DamageHistoryPage'
import DamageDetailPage from './pages/damage-detail/DamageDetailPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/language" element={<LanguageSelectPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/my-car" element={<MyCarPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/car-list" element={<CarListPage />} />
          <Route path="/car-detail" element={<CarDetailPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/booking-complete" element={<BookingCompletePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/did-auth" element={<DIDAuthPage />} />
          <Route path="/did-guide" element={<DIDPassportGuidePage />} />
          <Route path="/did-camera" element={<DIDCameraPage />} />
          <Route path="/did-confirm" element={<DIDConfirmPage />} />
          <Route path="/car-faceauth" element={<CarFaceAuthPage />} />
          <Route path="/car-crack" element={<CarCrackPage />} />
          <Route path="/car-smartkey" element={<CarSmartKeyPage />} />
          <Route path="/damage-history" element={<DamageHistoryPage />} />
          <Route path="/damage-detail" element={<DamageDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
