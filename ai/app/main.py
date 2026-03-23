from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.scratches import router as scratches_router
from app.api.routes.face import router as face_router

from dotenv import load_dotenv
load_dotenv()
def create_app() -> FastAPI:
    app = FastAPI(
        title="Scratch Comparison API",
        version="1.0.0",
        description="Compare scratch similarity between two vehicle images.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5174"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(scratches_router, prefix="/api/v1")
    app.include_router(face_router, prefix="/api/v1")
    return app


app = create_app()
