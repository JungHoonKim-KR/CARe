# AI 서비스 실행 가이드

이 디렉터리는 다중 AI 모델을 수용할 수 있도록 구조화된 FastAPI 서비스입니다.

## 1) 폴더 구조

- app/main.py: FastAPI 앱 진입점
- app/api/routes: API 라우터
  - app/api/routes/scratches.py: 스크래치 비교 API
  - app/api/routes/face.py: 얼굴 인증 API (DeepFace)
- app/schemas: 요청/응답 스키마
- app/services: 유즈케이스(비즈니스 로직) 계층
  - app/services/scratch_comparison_service.py: 스크래치 비교 서비스
  - app/services/face_service.py: 얼굴 인증 서비스
- app/models: 모델 구현체 모음
  - app/models/resnet50_v3: 스크래치 비교 모델 (ResNet50)
  - app/models/deepface: 얼굴 인증 모델 (DeepFace/VGG-Face)
- app/cli: 로컬 실행용 스크립트

새 모델이 추가되면 app/models 아래에 모델별 폴더를 추가하고,
해당 모델을 호출하는 서비스 함수를 app/services에 추가하면 됩니다.

## 2) 개발 환경 설정

### Windows Git Bash (MINGW64)

```bash
  cd ai
  python -m venv .venv
  source .venv/Scripts/activate
  python -m pip install --upgrade pip
  pip install -r requirements.txt
```

### macOS/Linux (bash/zsh)

```bash
    cd ai
    python3.11 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
```

## 3) 서버 실행

```
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger UI:
- http://localhost:8000/docs

헬스체크:
- GET http://localhost:8000/api/v1/health

## 4) API 엔드포인트

- POST /api/v1/scratches/compare
- Content-Type: multipart/form-data
- 필수 form-data 필드:
  - reference_image (파일)
  - target_image (파일)

응답 예시:

    {
      "similarity": 0.9132,
      "diff_score": 0.0215
    }

## 5) curl 테스트

    curl -X POST "http://localhost:8000/api/v1/scratches/compare" \
      -F "reference_image=@after.png" \
      -F "target_image=@before.png"

## 6) 설명

- 전처리: Resize(640), CenterCrop(640), Normalize
- 밝기 보정: target 이미지를 reference 밝기에 맞춤
- 특징 추출: ResNet50 마지막 FC 이전 feature map 사용
- 지표 계산:
  - 코사인 유사도 평균
  - feature map L1 평균(diff_score)

로컬 파일로 바로 실행하려면 아래 명령을 사용하세요.

    python -m app.cli.run_resnet50v3_legacy

위 스크립트는 아래 순서로 실행됩니다.

1. after.png를 기준 이미지로 로드
2. before.png를 대상 이미지로 로드
3. 유사도/변화량 출력

## 7) 팀 공통 참고 사항

- 최초 실행 시 torchvision이 ResNet50 가중치를 다운로드할 수 있어 초기 응답이 느릴 수 있습니다.
- GPU가 없어도 CPU로 자동 동작합니다.
- Windows Git Bash에서는 source .venv/bin/activate가 아니라 source .venv/Scripts/activate를 사용해야 합니다.

---

## 8) DeepFace 얼굴 인증 (추가됨)

국제운전면허증 사진과 셀카를 비교하여 동일인 여부를 판단하는 API가 추가되었습니다.

### 추가된 파일

- `app/api/routes/face.py`
- `app/services/face_service.py`
- `app/schemas/face.py`

### 패키지 재설치 (기존 팀원)

requirements.txt에 deepface가 추가되었으므로 한 번 더 실행해주세요.

    pip install -r requirements.txt

> 최초 실행 시 DeepFace 모델 가중치 자동 다운로드 (~500MB, `~/.deepface/weights/`에 캐싱)

### API 엔드포인트 (수정가능성 O)

- POST /api/v1/reservations/{reservationId}/face-auth
- Content-Type: multipart/form-data
- 필수 form-data 필드:
  - id_photo (파일) - 국제운전면허증 사진
  - selfie (파일) - 본인 셀카

응답 예시:

    {
      "verified": true,
      "distance": 0.3241,
      "threshold": 0.4000,
      "model": "VGG-Face"
    }

### curl 테스트

    curl -X POST "http://localhost:8000/api/v1/face/verify" \
      -F "id_photo=@license.jpg" \
      -F "selfie=@selfie.jpg"

### 참고

- `verified: true` → 동일인, `false` → 불일치
- `distance`가 낮을수록 유사도 높음
- `enforce_detection=False` 설정으로 얼굴 감지 실패 시에도 에러 없이 동작
