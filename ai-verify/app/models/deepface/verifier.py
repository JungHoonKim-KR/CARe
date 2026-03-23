from pathlib import Path

from deepface import DeepFace


def verify(
    img1_path: Path | str,
    img2_path: Path | str,
    model_name: str = "VGG-Face",
    detector_backend: str = "retinaface",
    enforce_detection: bool = False,
) -> dict:
    result = DeepFace.verify(
        img1_path=str(img1_path),
        img2_path=str(img2_path),
        model_name=model_name,
        detector_backend=detector_backend,
        enforce_detection=enforce_detection,
    )
    return {
        "verified": result["verified"],
        "distance": result["distance"],
        "threshold": result["threshold"],
        "model": model_name,
    }
