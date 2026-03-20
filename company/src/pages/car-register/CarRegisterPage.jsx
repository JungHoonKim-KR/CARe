import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarService from '../../services/CarService'
import './CarRegisterPage.css'

export default function CarRegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    modelId: '',
    plateNumber: '',
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
    { id: 'ioniq5', name: '현대 아이오닉5' },
    { id: 'ev6', name: '기아 EV6' },
    { id: 'gv60', name: '제네시스 GV60' },
    { id: 'model3', name: '테슬라 Model 3' },
    { id: 'modely', name: '테슬라 Model Y' },
    { id: 'avante', name: '현대 아반떼' },
    { id: 'sonata', name: '현대 소나타' },
    { id: 'k5', name: '기아 K5' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleImageChange = (e, direction) => {
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
      ...prev,
      [direction]: file
    }))

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviews(prev => ({
        ...prev,
        [direction]: reader.result
      }))
    }
    reader.readAsDataURL(file)

    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.modelId) {
      setError('차량 모델을 선택해주세요.')
      return
    }

    if (!formData.plateNumber) {
      setError('차량 번호를 입력해주세요.')
      return
    }

    if (!formData.frontImage || !formData.rearImage || !formData.leftImage || !formData.rightImage) {
      setError('모든 방향의 차량 사진을 업로드해주세요.')
      return
    }

    setLoading(true)

    try {
      const result = await CarService.registerCar(formData)

      if (result.success) {
        alert('차량이 성공적으로 등록되었습니다!')
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
          ← 뒤로
        </button>
        <h1 className="page-title">차량 등록</h1>
      </div>

      <div className="register-form-container">
        <form onSubmit={handleSubmit} className="car-register-form">
          {/* 기본 정보 */}
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
                {carModels.map(model => (
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
                  {previews.frontImage ? (
                    <div className="preview-container">
                      <img src={previews.frontImage} alt="전면" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, frontImage: null }))
                          setPreviews(prev => ({ ...prev, frontImage: null }))
                        }}
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

              {/* 후면 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 후면</span>
                  {previews.rearImage ? (
                    <div className="preview-container">
                      <img src={previews.rearImage} alt="후면" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, rearImage: null }))
                          setPreviews(prev => ({ ...prev, rearImage: null }))
                        }}
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

              {/* 좌측 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 좌측</span>
                  {previews.leftImage ? (
                    <div className="preview-container">
                      <img src={previews.leftImage} alt="좌측" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, leftImage: null }))
                          setPreviews(prev => ({ ...prev, leftImage: null }))
                        }}
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

              {/* 우측 */}
              <div className="image-upload-item">
                <label className="image-upload-label">
                  <span className="upload-title">🚗 우측</span>
                  {previews.rightImage ? (
                    <div className="preview-container">
                      <img src={previews.rightImage} alt="우측" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, rightImage: null }))
                          setPreviews(prev => ({ ...prev, rightImage: null }))
                        }}
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

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
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
