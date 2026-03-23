import boto3
import uuid
import io
from PIL import Image
from pathlib import Path
import os

s3 = boto3.client(
    "s3",
    aws_access_key_id     = os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name           = os.getenv("AWS_REGION", "ap-northeast-2"),
)
BUCKET = os.getenv("S3_BUCKET", "your-bucket-name")


def upload_image_to_s3(image: Image.Image, prefix: str = "scratches") -> str:
    """PIL 이미지 → S3 업로드 → URL 반환"""
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    buffer.seek(0)

    key = f"{prefix}/{uuid.uuid4()}.jpg"
    s3.upload_fileobj(
        buffer,
        BUCKET,
        key,
        ExtraArgs={"ContentType": "image/jpeg"},
    )
    return f"https://{BUCKET}.s3.ap-northeast-2.amazonaws.com/{key}"


def upload_file_to_s3(file_path: Path, prefix: str = "originals") -> str:
    """파일 경로 → S3 업로드 → URL 반환"""
    key = f"{prefix}/{uuid.uuid4()}{file_path.suffix}"
    s3.upload_file(
        str(file_path),
        BUCKET,
        key,
        ExtraArgs={"ContentType": "image/jpeg"},
    )
    return f"https://{BUCKET}.s3.ap-northeast-2.amazonaws.com/{key}"