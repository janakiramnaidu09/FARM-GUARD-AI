import os
from fastapi import FastAPI, File, UploadFile, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .config import settings
from .preprocessor import ImagePreprocessor, ImagePreprocessingError
from .classifier import DiseaseClassifier, ModelUnavailableError

app = FastAPI(
    title="FarmGuard AI - Disease Inference Service",
    description="Internal OpenCV & TensorFlow inference microservice for agricultural crop disease classification",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

preprocessor = ImagePreprocessor(
    target_size=(224, 224),
    min_dim=100,
    max_dim=4096,
    normalization="mobilenet_v2_zero_one"
)

classifier = DiseaseClassifier(
    manifest_path=settings.MODEL_MANIFEST_PATH,
    model_path=settings.MODEL_PATH if settings.MODEL_PATH else None
)

def verify_token(authorization: Optional[str] = Header(None)):
    if not settings.ML_SERVICE_TOKEN:
        return True
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Missing Authorization header"}
        )
    token = authorization.replace("Bearer ", "").strip()
    if token != settings.ML_SERVICE_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Invalid service authorization token"}
        )
    return True

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "disease-inference",
        "version": "1.0.0",
        "model_loaded": classifier.is_model_loaded(),
        "model_manifest_version": classifier.manifest.get("modelVersion"),
        "supported_classes_count": len(classifier.classes)
    }

@app.get("/manifest")
def get_manifest():
    return classifier.manifest

@app.post("/predict")
async def predict_crop_disease(
    file: UploadFile = File(...),
    crop: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    verify_token(authorization)

    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"Image file size ({len(contents)} bytes) exceeds maximum permitted limit ({settings.MAX_IMAGE_BYTES} bytes)."
            }
        )

    # Preprocess with OpenCV
    try:
        batch, metadata = preprocessor.process(contents)
    except ImagePreprocessingError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": e.code, "message": e.message}
        )

    # Run inference with TensorFlow model
    try:
        result = classifier.predict(batch, crop_hint=crop)
        result["imageMetadata"] = metadata
        return result
    except ModelUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "MODEL_NOT_CONFIGURED",
                "message": e.message,
                "details": e.details
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INFERENCE_FAILED", "message": f"Inference execution failed: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.disease-inference.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

