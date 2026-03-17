# AI 서비스 실행 가이드

이 디렉터리는 다중 AI 모델을 수용할 수 있도록 구조화된 FastAPI 서비스입니다.

## 1) 폴더 구조

- app/main.py: FastAPI 앱 진입점
- app/api/routes: API 라우터
- app/schemas: 요청/응답 스키마
- app/services: 유즈케이스(비즈니스 로직) 계층
- app/models: 모델 구현체 모음
  - app/models/resnet50_v3: 현재 스크래치 비교 모델
- app/cli: 로컬 실행용 스크립트

새 모델이 추가되면 app/models 아래에 모델별 폴더를 추가하고,
해당 모델을 호출하는 서비스 함수를 app/services에 추가하면 됩니다.

## 2) 개발 환경 설정

### Windows Git Bash (MINGW64)

  cd ai
  python -m venv .venv
  source .venv/Scripts/activate
  python -m pip install --upgrade pip
  pip install -r requirements.txt

### macOS/Linux (bash/zsh)

    cd ai
    python3.11 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt

## 3) 서버 실행

    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

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
