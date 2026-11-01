# Model Card — FarmGuard MobileNetV2 Crop Disease Classifier

## 1. Model Details

- **Model Name**: FarmGuard-MobileNetV2-CropDisease
- **Model Version**: 1.0.0
- **Framework**: TensorFlow 2.15 / Keras & OpenCV
- **Architecture**: MobileNetV2 base (ImageNet weights) with custom classification head:
  - Input Layer: `(224, 224, 3)`
  - Data Augmentation: Random rotation, zoom, horizontal/vertical flip, contrast
  - Base: MobileNetV2 (frozen feature extractor, fine-tuned top 30 layers)
  - GlobalAveragePooling2D
  - Dropout (0.3)
  - Dense (128, ReLU)
  - BatchNormalization
  - Dropout (0.2)
  - Dense (8 classes, Softmax)

---

## 2. Intended Use

- **Primary Intended Use**: Assistive decision support for smallholder farmers to recognize visual symptoms of common fungal, bacterial, and blight diseases on crops in India (Tomato, Rice, Cotton).
- **Primary Beneficiaries**: Farmers, agricultural extension field workers, and Krishi Vigyan Kendra (KVK) staff.
- **Out-of-Scope Uses**:
  - Replacing accredited agronomy laboratory assays or culture tests.
  - Automatic pesticide or chemical prescription without label verification by certified agronomists.
  - Analyzing non-leaf plant parts (roots, stems, seeds).

---

## 3. Preprocessing & Diagnostic Pipeline

```
Raw Image File -> Magic Byte Signature Check (JPEG/PNG/WebP)
               -> OpenCV Decode: cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
               -> Dimension Verification: 100x100px min to 4096x4096px max
               -> Color Conversion: BGR -> RGB
               -> High-Quality Resizing: 224x224 (cv2.INTER_AREA / cv2.INTER_LINEAR)
               -> Normalization: [0.0, 1.0]
               -> TensorFlow Inferrer -> Softmax Distribution
```

---

## 4. Decision & Safety Abstention Rules

To prevent misleading farmers, FarmGuard AI enforces strict calibrated abstention rules:

1. **Confidence Threshold**: Configured at **0.75 (75%)**. If the top predicted class probability is $< 0.75$, the model **abstains** (`status: "uncertain"`), outputs no definitive disease claim, and provides practical photography guidelines and local KVK contact advice.
2. **Unsupported Images**: If an image cannot be decoded, is blurred, or has insufficient resolution, the system returns `status: "unsupported"` and asks for a clear re-take.
3. **Model Weights Missing**: If model weights are unconfigured, the inference service responds with HTTP 503 and exact setup instructions rather than returning fabricated or random predictions.

---

## 5. Supported Classes

| Class Code | Common Name | Scientific Agent | Crop |
| :--- | :--- | :--- | :--- |
| `Tomato___Early_blight` | Tomato Early Blight | *Alternaria solani* | Tomato |
| `Tomato___Late_blight` | Tomato Late Blight | *Phytophthora infestans* | Tomato |
| `Tomato___Healthy` | Healthy Leaf | N/A | Tomato |
| `Rice___Blast` | Rice Blast | *Magnaporthe oryzae* | Rice (Paddy) |
| `Rice___Brown_Spot` | Rice Brown Spot | *Bipolaris oryzae* | Rice (Paddy) |
| `Rice___Healthy` | Healthy Leaf | N/A | Rice (Paddy) |
| `Cotton___Bacterial_Blight` | Cotton Bacterial Blight | *Xanthomonas citri pv. malvacearum* | Cotton |
| `Cotton___Healthy` | Healthy Leaf | N/A | Cotton |

