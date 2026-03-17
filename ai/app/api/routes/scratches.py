from pathlib import Path
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.scratch import ScratchComparisonResponse
from app.services.scratch_comparison_service import compare_scratches

router = APIRouter(prefix="/scratches", tags=["scratches"])


@router.post("/compare", response_model=ScratchComparisonResponse)
async def compare_scratch_images(
    reference_image: UploadFile = File(...),
    target_image: UploadFile = File(...),
) -> ScratchComparisonResponse:
    ref_suffix = Path(reference_image.filename or "ref.jpg").suffix or ".jpg"
    target_suffix = Path(target_image.filename or "target.jpg").suffix or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=ref_suffix) as ref_tmp:
        ref_bytes = await reference_image.read()
        ref_tmp.write(ref_bytes)
        ref_path = Path(ref_tmp.name)

    with tempfile.NamedTemporaryFile(delete=False, suffix=target_suffix) as target_tmp:
        target_bytes = await target_image.read()
        target_tmp.write(target_bytes)
        target_path = Path(target_tmp.name)

    try:
        similarity, diff_score = compare_scratches(ref_path, target_path)
        return ScratchComparisonResponse(similarity=similarity, diff_score=diff_score)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        for temp_path in (ref_path, target_path):
            if temp_path.exists():
                temp_path.unlink()
