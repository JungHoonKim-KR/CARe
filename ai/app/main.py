from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.scratches import router as scratches_router
from app.api.routes.face import router as face_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Scratch Comparison API",
        version="1.0.0",
        description="Compare scratch similarity between two vehicle images.",
    )
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(scratches_router, prefix="/api/v1")
    app.include_router(face_router, prefix="/api/v1")
    return app


app = create_app()
