from pathlib import Path

from PIL import Image
import torch
import torch.nn.functional as F

from app.models.resnet50_v3.feature_extractor import get_model
from app.models.resnet50_v3.preprocessing import match_brightness, preprocess


def compare_scratches_final(path_ref: Path | str, path_target: Path | str) -> tuple[float, float]:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = get_model(device)

    img_ref = Image.open(path_ref).convert("RGB")
    img_target = Image.open(path_target).convert("RGB")
    img_target_adjusted = match_brightness(img_target, img_ref)

    tensor_ref = preprocess(img_ref).unsqueeze(0).to(device)
    tensor_target = preprocess(img_target_adjusted).unsqueeze(0).to(device)

    with torch.no_grad():
        map_ref = model(tensor_ref)
        map_target = model(tensor_target)

    c = map_ref.shape[1]
    v_ref = map_ref.view(c, -1).t()
    v_target = map_target.view(c, -1).t()

    similarity = F.cosine_similarity(v_ref, v_target, dim=1).mean().item()
    diff_score = torch.abs(map_ref - map_target).mean().item()
    return similarity, diff_score


def compare_scratches(path_ref: Path | str, path_target: Path | str) -> tuple[float, float]:
    return compare_scratches_final(path_ref, path_target)
