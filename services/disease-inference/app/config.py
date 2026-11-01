import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = "127.0.0.1"
    PORT: int = 8001
    ML_SERVICE_TOKEN: str = os.getenv("ML_SERVICE_TOKEN", "dev-ml-token-change-in-production")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "")
    MODEL_MANIFEST_PATH: str = os.getenv("MODEL_MANIFEST_PATH", "model/model_manifest.json")
    DISEASE_CONFIDENCE_THRESHOLD: float = float(os.getenv("DISEASE_CONFIDENCE_THRESHOLD", "0.75"))
    MAX_IMAGE_BYTES: int = int(os.getenv("MAX_IMAGE_BYTES", "8388608")) # 8 MB
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

