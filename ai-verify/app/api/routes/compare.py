from pathlib import Path
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.scratch import ScratchComparisonResponse
from app.services.scratch_comparison_service import compare_scratches

router = APIRouter(prefix="/scratches", tags=["scratches"])


@router.post("/compare", response_model=ScratchComparisonResponse)
async def compare_scratch_images(
    reference_image: UploadFile = File(..., description="기준 이미지 (BEFORE)"),
    target_image: UploadFile = File(..., description="비교 이미지 (AFTER)"),
) -> ScratchComparisonResponse:
    ref_suffix = Path(reference_image.filename or "ref.jpg").suffix or ".jpg"
    tgt_suffix = Path(target_image.filename or "target.jpg").suffix or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=ref_suffix) as f:
        f.write(await reference_image.read())
        ref_path = Path(f.name)

    with tempfile.NamedTemporaryFile(delete=False, suffix=tgt_suffix) as f:
        f.write(await target_image.read())
        tgt_path = Path(f.name)

    try:
        similarity, diff_score = compare_scratches(ref_path, tgt_path)
        return ScratchComparisonResponse(similarity=similarity, diff_score=diff_score)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        for p in (ref_path, tgt_path):
            if p.exists():
                p.unlink()
