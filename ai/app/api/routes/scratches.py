import time
import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ultralytics import YOLO

router = APIRouter(prefix="/scratches")

# 🌟 서버가 켜질 때 AI 모델을 딱 한 번만 불러와서 대기시킵니다.
MODEL_PATH = "app/models/scratches/best.pt"
try:
    model = YOLO(MODEL_PATH)
    print("🟢 AI 모델(best.pt) 로딩 완료! 출격 준비 끝!")
except Exception as e:
    print(f"🔴 AI 모델 로딩 실패 (경로를 확인해주세요): {e}")

@router.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 1. 프론트엔드(React)에서 0.2초마다 보낸 사진(Bytes) 수신
            frame_bytes = await websocket.receive_bytes()

            # 2. Bytes 데이터를 AI가 읽을 수 있는 이미지(NumPy 배열)로 변환
            nparr = np.frombuffer(frame_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is not None:
                start = time.time()
                # 3. AI 모델 추론 시작! (conf=0.25는 "25% 이상 확신하면 흠집으로 인정해라"라는 뜻)
                # 흠집을 너무 못 찾으면 0.1로 내리고, 너무 잡다한 걸 다 잡으면 0.5로 올리면 됩니다.
                results = model.predict(source=img, conf=0.25, verbose=False)
                print(f"[YOLO-WS] 추론 시간: {(time.time() - start)*1000:.1f}ms | 탐지 수: {sum(len(r.boxes) for r in results)}")


                real_boxes = []

                # 4. AI가 찾은 흠집들을 리액트가 그리기 편한 모양(x, y, 폭, 높이)으로 계산
                for r in results:
                    for box in r.boxes:
                        x1, y1, x2, y2 = box.xyxy[0].tolist() # 양끝 좌표
                        label_idx = int(box.cls[0])           # 클래스 번호
                        label_name = model.names[label_idx]   # 클래스 이름 (예: scratch)

                        real_boxes.append({
                            "x": int(x1),
                            "y": int(y1),
                            "w": int(x2 - x1), # 폭 (오른쪽 - 왼쪽)
                            "h": int(y2 - y1), # 높이 (아래 - 위)
                            "label": label_name
                        })

                # 5. 계산된 진짜 좌표를 프론트엔드로 슝! 🚀
                await websocket.send_json({"boxes": real_boxes})
            else:
                await websocket.send_json({"boxes": []})

    except WebSocketDisconnect:
        print("🟡 프론트엔드와 연결이 끊어졌습니다.")
    except Exception as e:
        print(f"🔴 통신 중 에러: {e}")