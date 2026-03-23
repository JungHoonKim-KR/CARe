from pydantic import BaseModel, Field


class ScratchComparisonResponse(BaseModel):
    similarity: float = Field(..., description="Cosine similarity score")
    diff_score: float = Field(..., description="Average feature map L1 difference")
