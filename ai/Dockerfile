FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcb1 \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# DeepFace FaceNet 모델 미리 다운로드 (curl -L로 GitHub redirect 처리)
RUN mkdir -p /root/.deepface/weights && \
    curl -fSL -o /root/.deepface/weights/facenet_weights.h5 \
    "https://github.com/serengil/deepface_models/releases/download/v1.0/facenet_weights.h5"

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
