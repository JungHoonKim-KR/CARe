from pathlib import Path
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.scratch import ScratchComparisonResponse, DetectResponse
from app.services.scratch_comparison_service import compare_scratches
from app.services.detect_service import detect_and_upload

router = APIRouter(prefix="/scratches", tags=["scratches"])


# 기존 유사도 비교 — 그대로 유지
@router.post("/compare", response_model=ScratchComparisonResponse)
async def compare_scratch_images(
        reference_image: UploadFile = File(...),
        target_image:    UploadFile = File(...),
) -> ScratchComparisonResponse:
    ref_suffix    = Path(reference_image.filename or "ref.jpg").suffix    or ".jpg"
    target_suffix = Path(target_image.filename    or "target.jpg").suffix or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=ref_suffix) as ref_tmp:
        ref_tmp.write(await reference_image.read())
        ref_path = Path(ref_tmp.name)

    with tempfile.NamedTemporaryFile(delete=False, suffix=target_suffix) as target_tmp:
        target_tmp.write(await target_image.read())
        target_path = Path(target_tmp.name)

    try:
        similarity, diff_score = compare_scratches(ref_path, target_path)
        return ScratchComparisonResponse(similarity=similarity, diff_score=diff_score)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        for p in (ref_path, target_path):
            if p.exists():
                p.unlink()


# 신규 흠집 탐지
@router.post("/detect", response_model=DetectResponse)
async def detect_scratch_image(
        image:    UploadFile = File(...),
        zone:     str        = Form("front"),    # front / rear / front-left 등
        log_type: str        = Form("BEFORE"),   # BEFORE / AFTER
) -> DetectResponse:
    suffix = Path(image.filename or "image.jpg").suffix or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await image.read())
        tmp_path = Path(tmp.name)

    try:
        result = await detect_and_upload(tmp_path, zone, log_type)
        return DetectResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        if tmp_path.exists():
            tmp_path.unlink()