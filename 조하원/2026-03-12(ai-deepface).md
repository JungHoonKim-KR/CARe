# AI 얼굴 인증 - DeepFace 기반 본인 확인 시스템

### [github 가기](https://github.com/wonby1n/ai-deepface)

여권 사진과 셀카(현재 사진)를 비교하여 동일인 여부를 판별하는 AI 얼굴 인증 모듈입니다.

---

## 사용 모델 및 기술 스택

### 얼굴 인식 모델: ArcFace
- **라이브러리**: [DeepFace](https://github.com/serengil/deepface) v0.0.99
- **모델**: `ArcFace`
  - 동양인 및 조명/각도 변화 등 까다로운 조건에서 높은 성능을 보임
  - 다른 선택지: `Facenet512`, `VGG-Face`, `Facenet` 등
- **얼굴 탐지 백엔드**: `RetinaFace`
  - 얼굴 탐지 정확도가 높아 여권 사진처럼 정면 얼굴 이미지에 적합
  - 다른 선택지: `mtcnn`, `opencv`, `ssd` 등

### 백엔드 프레임워크
| 라이브러리 | 용도 |
|---|---|
| TensorFlow 2.20 | DeepFace 모델 실행 엔진 |
| Keras 3.13 | TensorFlow 상위 추상화 레이어 |
| OpenCV 4.13 | 이미지 전처리 |
| RetinaFace 0.0.17 | 얼굴 탐지 |
| MTCNN 1.0.0 | 보조 얼굴 탐지 |
| FastAPI / Flask | (추후 API 서버 연동용으로 설치됨) |

---

## 동작 방식

```
여권 이미지 (passport_img/)
        ↓
  RetinaFace로 얼굴 탐지
        ↓
  ArcFace로 얼굴 임베딩 벡터 추출
        ↓         ← 동일 과정
셀카 이미지 (selfie_img/)
        ↓
  두 벡터 간 거리(distance) 계산
        ↓
  threshold 이하이면 → 동일인 ✅
  threshold 초과이면 → 다른 사람 ❌
```

- **distance**: 두 얼굴 벡터 간의 유사도 거리 (낮을수록 유사)
- **threshold**: ArcFace 기본값 `0.68` (이 값 이하면 동일인으로 판단)

---

## 프로젝트 구조

```
ai-deepface/
├── face.py            # 메인 실행 파일
├── requirements.txt   # 의존성 목록
├── passport_img/      # 여권 사진 폴더 (직접 이미지 추가 필요)
└── selfie_img/        # 셀카 사진 폴더 (직접 이미지 추가 필요)
```

---

## 설치 및 실행

### 환경 요구사항
- Python **3.10** 권장 (TensorFlow 호환성)

### 설치

```bash
# Python 3.10 가상환경 생성
python -m venv venv

# 가상환경 활성화
source venv/bin/activate       # macOS / Linux
venv\Scripts\activate          # Windows

# 의존성 설치
pip install -r requirements.txt
```

> 첫 실행 시 ArcFace, RetinaFace 모델 가중치 파일을 자동으로 다운로드합니다. (수백 MB)

### 이미지 준비

```
passport_img/ 폴더에 여권 사진 1장 추가
selfie_img/   폴더에 셀카 사진 1장 추가
```

지원 형식: `.jpg`, `.jpeg`, `.png` 등 일반적인 이미지 포맷

### 실행

```bash
python face.py
```

### 실행 결과 예시

```
📄 사용된 여권 이미지: passport.jpg
📄 사용된 셀카 이미지: selfie.jpg
사진 비교를 시작합니다. 모델을 로드하는 데 시간이 걸릴 수 있습니다...

=== [검증 결과] ===
✅ 동일인으로 확인되었습니다. (거리: 0.4231 / 기준치: 0.68)

[상세 데이터]
{
    "verified": true,
    "distance": 0.4231,
    "threshold": 0.68,
    "model": "ArcFace",
    "detector_backend": "retinaface",
    ...
}
```

---

## 코드 사용 예시 (함수 단위)

```python
from face import verify_identity

result = verify_identity(
    passport_image_path="passport_img/passport.jpg",
    selfie_image_path="selfie_img/selfie.jpg"
)

if result.get("verified"):
    print("본인 인증 성공")
else:
    print("본인 인증 실패")
```

---

## 주의사항

- 얼굴이 명확하게 보이는 이미지를 사용해야 합니다. (`enforce_detection=True`)
- 너무 어둡거나, 얼굴이 가려진 경우 `Face not detected` 오류가 발생할 수 있습니다.
- 첫 실행 시 모델 다운로드로 인해 시간이 오래 걸릴 수 있습니다.
