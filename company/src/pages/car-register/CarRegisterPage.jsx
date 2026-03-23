import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarService from '../../services/CarService'
import AuthService from '../../services/AuthService'
import './CarRegisterPage.css'

export default function CarRegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    modelId: '',
    plateNumber: '',
    dailyPrice: '',
    frontImage: null,
    rearImage: null,
    leftImage: null,
    rightImage: null
  })
  const [previews, setPreviews] = useState({
    frontImage: null,
    rearImage: null,
    leftImage: null,
    rightImage: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const carModels = [
    { id: 'model-001', name: '현대 아이오닉5' },
    { id: 'model-002', name: '기아 EV6' },
    { id: 'model-003', name: '제네시스 GV60' },
    { id: 'model-004', name: '테슬라 Model 3' },
    { id: 'model-005', name: '테슬라 Model Y' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (error) setError('')
  }

  const handleImageChange = (e, direction) => {
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
      ...prev,
      [direction]: file
    }))

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviews((prev) => ({
        ...prev,
        [direction]: reader.result
      }))
    }
    reader.readAsDataURL(file)

    if (error) setError('')
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

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

    if (!formData.modelId) {
      setError('차량 모델을 선택해주세요.')
      return
    }

    if (!formData.plateNumber) {
      setError('차량 번호를 입력해주세요.')
      return
    }

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
      return
    }

    setLoading(true)

    try {
      const result = await CarService.registerCar(companyId, formData)

      if (result.success) {
        alert('차량이 성공적으로 등록되었습니다.')
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
          ← 
        </button>
        <h1 className="page-title">차량 등록</h1>
      </div>

      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="car-register-form">
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
                {carModels.map((model) => (
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
                  {previews.frontImage ? (
                    <div className="preview-container">
                      <img src={previews.frontImage} alt="전면" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage('frontImage')}
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

              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">후면</span>
                  {previews.rearImage ? (
                    <div className="preview-container">
                      <img src={previews.rearImage} alt="후면" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage('rearImage')}
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

              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">좌측</span>
                  {previews.leftImage ? (
                    <div className="preview-container">
                      <img src={previews.leftImage} alt="좌측" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage('leftImage')}
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

              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">우측</span>
                  {previews.rightImage ? (
                    <div className="preview-container">
                      <img src={previews.rightImage} alt="우측" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage('rightImage')}
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

          {error && <div className="error-message">{error}</div>}

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
}
