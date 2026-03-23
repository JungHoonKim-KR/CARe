import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarService from '../../services/CarService'
<<<<<<< HEAD
=======
import AuthService from '../../services/AuthService'
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
import './CarRegisterPage.css'

export default function CarRegisterPage() {
  const navigate = useNavigate()
<<<<<<< HEAD
  const [formData, setFormData] = useState({
    modelId: '',
    plateNumber: '',
=======

  const [formData, setFormData] = useState({
    modelId: '',
    plateNumber: '',
    dailyPrice: '',
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
    frontImage: null,
    rearImage: null,
    leftImage: null,
    rightImage: null
  })
<<<<<<< HEAD
=======

>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
  const [previews, setPreviews] = useState({
    frontImage: null,
    rearImage: null,
    leftImage: null,
    rightImage: null
  })
<<<<<<< HEAD
=======

>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const carModels = [
<<<<<<< HEAD
    { id: 'ioniq5', name: '현대 아이오닉5' },
    { id: 'ev6', name: '기아 EV6' },
    { id: 'gv60', name: '제네시스 GV60' },
    { id: 'model3', name: '테슬라 Model 3' },
    { id: 'modely', name: '테슬라 Model Y' },
    { id: 'avante', name: '현대 아반떼' },
    { id: 'sonata', name: '현대 소나타' },
    { id: 'k5', name: '기아 K5' }
=======
    { id: 'model-001', name: '현대 아이오닉5' },
    { id: 'model-002', name: '기아 EV6' },
    { id: 'model-003', name: '제네시스 GV60' },
    { id: 'model-004', name: '테슬라 Model 3' },
    { id: 'model-005', name: '테슬라 Model Y' }
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
<<<<<<< HEAD
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
=======

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
    if (error) setError('')
  }

  const handleImageChange = (e, direction) => {
<<<<<<< HEAD
    const file = e.target.files[0]
    if (!file) return

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`${direction} 이미지 크기는 10MB 이하여야 합니다.`)
      return
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError(`${direction}은(는) 이미지 파일이어야 합니다.`)
      return
    }

    setFormData(prev => ({
=======
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('이미지 크기는 10MB 이하여야 합니다.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    setFormData((prev) => ({
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
      ...prev,
      [direction]: file
    }))

<<<<<<< HEAD
    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviews(prev => ({
=======
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviews((prev) => ({
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
        ...prev,
        [direction]: reader.result
      }))
    }
    reader.readAsDataURL(file)

    if (error) setError('')
  }

<<<<<<< HEAD
=======
  const removeImage = (direction) => {
    setFormData((prev) => ({
      ...prev,
      [direction]: null
    }))

    setPreviews((prev) => ({
      ...prev,
      [direction]: null
    }))
  }

>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

<<<<<<< HEAD
    // 유효성 검사
=======
    const companyId = AuthService.getCompanyId()

    console.log('제출 데이터 확인:', {
      companyId,
      modelId: formData.modelId,
      plateNumber: formData.plateNumber,
      dailyPrice: formData.dailyPrice,
      frontImage: formData.frontImage,
      rearImage: formData.rearImage,
      leftImage: formData.leftImage,
      rightImage: formData.rightImage
    })

    if (!companyId) {
      setError('companyId가 없습니다. 다시 로그인해주세요.')
      return
    }

>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
    if (!formData.modelId) {
      setError('차량 모델을 선택해주세요.')
      return
    }

    if (!formData.plateNumber) {
      setError('차량 번호를 입력해주세요.')
      return
    }

<<<<<<< HEAD
    if (!formData.frontImage || !formData.rearImage || !formData.leftImage || !formData.rightImage) {
      setError('모든 방향의 차량 사진을 업로드해주세요.')
=======
    if (!formData.dailyPrice) {
      setError('일일 요금을 입력해주세요.')
      return
    }

    if (
      !formData.frontImage ||
      !formData.rearImage ||
      !formData.leftImage ||
      !formData.rightImage
    ) {
      setError('전후좌우 이미지를 모두 업로드해주세요.')
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
      return
    }

    setLoading(true)

    try {
<<<<<<< HEAD
      const result = await CarService.registerCar(formData)

      if (result.success) {
        alert('차량이 성공적으로 등록되었습니다!')
=======
      const result = await CarService.registerCar(companyId, formData)

      if (result.success) {
        alert('차량이 성공적으로 등록되었습니다.')
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
        navigate('/cars')
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('차량 등록 예외:', err)
      setError('차량 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="car-register-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/cars')}>
<<<<<<< HEAD
          ← 뒤로
=======
          ← 
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
        </button>
        <h1 className="page-title">차량 등록</h1>
      </div>

      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="car-register-form">
<<<<<<< HEAD
          {/* 기본 정보 */}
=======
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
          <div className="form-section">
            <h2 className="section-title">기본 정보</h2>

            <div className="form-group">
              <label htmlFor="modelId">차량 모델 *</label>
              <select
                id="modelId"
                name="modelId"
                value={formData.modelId}
                onChange={handleInputChange}
                required
              >
                <option value="">차량 모델을 선택하세요</option>
<<<<<<< HEAD
                {carModels.map(model => (
=======
                {carModels.map((model) => (
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="plateNumber">차량 번호 *</label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleInputChange}
                placeholder="12가3456"
                required
              />
            </div>
<<<<<<< HEAD
          </div>

          {/* 차량 사진 */}
          <div className="form-section">
            <h2 className="section-title">차량 사진 (4방향) *</h2>
            <p className="section-description">
              차량의 전후좌우 사진을 업로드해주세요. (각 10MB 이하)
            </p>

            <div className="image-upload-grid">
              {/* 전면 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 전면</span>
=======

            <div className="form-group">
              <label htmlFor="dailyPrice">일일 요금 *</label>
              <input
                type="number"
                id="dailyPrice"
                name="dailyPrice"
                value={formData.dailyPrice}
                onChange={handleInputChange}
                placeholder="예: 80000"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">차량 사진 (4방향) *</h2>
            <p className="section-description">
              차량의 전면, 후면, 좌측, 우측 이미지를 업로드해주세요.
            </p>

            <div className="image-upload-grid">
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">전면</span>
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                  {previews.frontImage ? (
                    <div className="preview-container">
                      <img src={previews.frontImage} alt="전면" />
                      <button
                        type="button"
                        className="remove-image"
<<<<<<< HEAD
                        onClick={() => {
                          setFormData(prev => ({ ...prev, frontImage: null }))
                          setPreviews(prev => ({ ...prev, frontImage: null }))
                        }}
=======
                        onClick={() => removeImage('frontImage')}
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">클릭하여 업로드</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'frontImage')}
                    hidden
                  />
                </label>
              </div>

<<<<<<< HEAD
              {/* 후면 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 후면</span>
=======
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">후면</span>
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                  {previews.rearImage ? (
                    <div className="preview-container">
                      <img src={previews.rearImage} alt="후면" />
                      <button
                        type="button"
                        className="remove-image"
<<<<<<< HEAD
                        onClick={() => {
                          setFormData(prev => ({ ...prev, rearImage: null }))
                          setPreviews(prev => ({ ...prev, rearImage: null }))
                        }}
=======
                        onClick={() => removeImage('rearImage')}
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">클릭하여 업로드</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'rearImage')}
                    hidden
                  />
                </label>
              </div>

<<<<<<< HEAD
              {/* 좌측 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 좌측</span>
=======
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">좌측</span>
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                  {previews.leftImage ? (
                    <div className="preview-container">
                      <img src={previews.leftImage} alt="좌측" />
                      <button
                        type="button"
                        className="remove-image"
<<<<<<< HEAD
                        onClick={() => {
                          setFormData(prev => ({ ...prev, leftImage: null }))
                          setPreviews(prev => ({ ...prev, leftImage: null }))
                        }}
=======
                        onClick={() => removeImage('leftImage')}
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">클릭하여 업로드</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'leftImage')}
                    hidden
                  />
                </label>
              </div>

<<<<<<< HEAD
              {/* 우측 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 우측</span>
=======
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">우측</span>
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                  {previews.rightImage ? (
                    <div className="preview-container">
                      <img src={previews.rightImage} alt="우측" />
                      <button
                        type="button"
                        className="remove-image"
<<<<<<< HEAD
                        onClick={() => {
                          setFormData(prev => ({ ...prev, rightImage: null }))
                          setPreviews(prev => ({ ...prev, rightImage: null }))
                        }}
=======
                        onClick={() => removeImage('rightImage')}
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">클릭하여 업로드</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'rightImage')}
                    hidden
                  />
                </label>
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
=======
          {error && <div className="error-message">{error}</div>}

>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/cars')}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? '등록 중...' : '차량 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
