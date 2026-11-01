# FarmGuard AI — Disease Inference Service

Internal microservice built with **FastAPI**, **OpenCV**, and **TensorFlow 2.15** for automated leaf disease classification, calibrated confidence estimation, and safe diagnostic abstention.

---

## 1. Architecture Overview

```
                      +---------------------------------------+
                      |       FarmGuard Express API           |
                      +---------------------------------------+
                                          |
                      POST /predict (multipart/form-data)
                      Header: Authorization: Bearer <ML_SERVICE_TOKEN>
                                          v
+---------------------------------------------------------------------------------+
| Fast API Inference Service (Port 8001)                                          |
|                                                                                 |
| 1. Authentication Check (ML_SERVICE_TOKEN validation)                           |
| 2. File Size & Decodability Verification                                        |
| 3. OpenCV Preprocessing Pipeline                                                |
|    - Decodes buffer: cv2.imdecode(np_arr, cv2.IMREAD_COLOR)                    |
|    - Dimension check: [100px x 100px] min to [4096px x 4096px] max              |
|    - BGR -> RGB color space conversion                                          |
|    - Resize: 224x224 (cv2.INTER_AREA / cv2.INTER_LINEAR)                        |
|    - Normalization: MobileNetV2 standard [0, 1]                                 |
| 4. TensorFlow 2.15 Model Inference                                              |
|    - Softmax probability distribution                                           |
|    - Top-1 confidence vs Configured Safety Threshold (default: 0.75)             |
| 5. Decision & Abstention Logic:                                                 |
|    - Confidence >= 0.75 -> status: "completed", top class, safe next steps      |
|    - Confidence < 0.75  -> status: "uncertain", abstention reason, retake guide  |
|    - Corrupt / Non-leaf -> status: "unsupported" / HTTP 422                      |
|    - Model weights missing -> HTTP 503 with actionable setup instructions        |
+---------------------------------------------------------------------------------+
```

---

## 2. Setup & Installation

### Step 1: Create Virtual Environment
```bash
cd services/disease-inference
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run the Service
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

---

## 3. Training & Evaluation Pipeline

### Step 1: Prepare Dataset
Download the PlantVillage or ICAR agricultural dataset and place class folders in `data/raw/`:
```bash
python scripts/prepare_dataset.py
```

### Step 2: Fine-Tune MobileNetV2
```bash
python scripts/train.py --epochs 25 --batch-size 32 --lr 0.0001
```
The trained model will be output to:
`model/weights/crop_disease_mobilenetv2.keras`

### Step 3: Evaluate & Check Abstention Calibration
```bash
python scripts/evaluate.py
```
This generates `model/evaluation_report.json` with per-class precision, recall, F1, and threshold abstention rates.

---

## 4. API Specification

### `GET /health`
Returns service readiness, loaded model state, and supported class count.

### `GET /manifest`
Returns the active `model_manifest.json` describing supported crops, classes, and versions.

### `POST /predict`
- **Headers:** `Authorization: Bearer <ML_SERVICE_TOKEN>`
- **Body:** `file` (multipart/form-data), `crop` (optional query parameter)
- **Response:**
```json
{
  "status": "completed",
  "predictedClass": "Rice___Blast",
  "predictedClassDisplayName": {
    "en": "Rice Blast (Magnaporthe oryzae)",
    "te": "వరి అగ్గితెగులు (బ్లాస్ట్)"
  },
  "confidence": 0.89234,
  "classProbabilities": [ ... ],
  "modelVersion": "1.0.0",
  "nextSteps": [ ... ],
  "uncertaintyWarning": "This AI assessment is an assistive decision-support indicator only...",
  "imageMetadata": {
    "original_width": 1280,
    "original_height": 720,
    "channels": 3,
    "processed_shape": [1, 224, 224, 3]
  }
}
```

