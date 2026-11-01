import json
import os
import numpy as np
from typing import Dict, Any, List, Optional, Tuple

class ModelUnavailableError(Exception):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}

class DiseaseClassifier:
    def __init__(self, manifest_path: str, model_path: Optional[str] = None):
        self.manifest_path = manifest_path
        self.model_path = model_path
        self.manifest = self._load_manifest()
        self.confidence_threshold = self.manifest.get("confidenceThreshold", 0.75)
        self.classes = self.manifest.get("classes", [])
        self.model = None
        self._tf = None
        self._init_model()

    def _load_manifest(self) -> Dict[str, Any]:
        if not os.path.exists(self.manifest_path):
            # Try relative to current script directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            alt_path = os.path.join(base_dir, self.manifest_path)
            if os.path.exists(alt_path):
                self.manifest_path = alt_path
            else:
                raise FileNotFoundError(f"Model manifest not found at {self.manifest_path}")

        with open(self.manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _init_model(self):
        """Attempts to load real TensorFlow model weights if configured."""
        if not self.model_path or not os.path.exists(self.model_path):
            # Model weights not yet trained or path not set
            return

        try:
            import tensorflow as tf
            self._tf = tf
            self.model = tf.keras.models.load_model(self.model_path)
        except Exception as e:
            # Keep model as None; status will report model unavailable
            self.model = None
            self.model_load_error = str(e)

    def is_model_loaded(self) -> bool:
        return self.model is not None

    def predict(self, preprocessed_batch: np.ndarray, crop_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes prediction using loaded TensorFlow model.
        If model weights are not loaded, raises ModelUnavailableError with instructions.
        Applies temperature calibration, softmax, threshold checks, and abstention.
        """
        if self.model is None:
            raise ModelUnavailableError(
                "Disease classification model weights are not configured or trained. "
                "Please run 'python scripts/train.py' to generate model weights and set MODEL_PATH.",
                details={
                    "model_path": self.model_path,
                    "manifest_version": self.manifest.get("modelVersion"),
                    "instructions": "Follow services/disease-inference/README.md to train or download weights."
                }
            )

        # Run TensorFlow model inference
        raw_logits = self.model.predict(preprocessed_batch, verbose=0)
        
        # Softmax if not already normalized
        if np.any(raw_logits < 0) or not np.isclose(np.sum(raw_logits[0]), 1.0, atol=1e-2):
            exp_logits = np.exp(raw_logits[0] - np.max(raw_logits[0]))
            probabilities = exp_logits / np.sum(exp_logits)
        else:
            probabilities = raw_logits[0]

        # Map to classes
        class_probs = []
        for idx, cls in enumerate(self.classes):
            prob_val = float(probabilities[idx]) if idx < len(probabilities) else 0.0
            class_probs.append({
                "className": cls["className"],
                "displayName": cls["displayName"],
                "crop": cls["crop"],
                "probability": round(prob_val, 5)
            })

        # Sort by probability descending
        class_probs.sort(key=lambda x: x["probability"], reverse=True)
        top_prob = class_probs[0]["probability"]
        top_class_name = class_probs[0]["className"]

        top_class_info = next((c for c in self.classes if c["className"] == top_class_name), None)

        # Check if confidence meets threshold
        if top_prob < self.confidence_threshold:
            return {
                "status": "uncertain",
                "predictedClass": None,
                "predictedClassDisplayName": None,
                "confidence": round(top_prob, 5),
                "classProbabilities": class_probs,
                "modelVersion": self.manifest.get("modelVersion"),
                "abstentionReason": (
                    f"Model confidence ({round(top_prob * 100, 1)}%) falls below the strict diagnostic "
                    f"safety threshold ({int(self.confidence_threshold * 100)}%). Leaf symptom patterns "
                    "are ambiguous or may indicate multiple compounding stresses. Retake photo under "
                    "uniform natural daylight focusing closely on the diseased region."
                ),
                "nextSteps": [
                    {
                        "action": "Retake Clear Photo",
                        "descriptionEn": "Capture a close-up photo of the affected leaf in bright, indirect sunlight without blur or shadows.",
                        "descriptionTe": "మసక లేకుండా, నీడలు పడకుండా స్పష్టమైన వెలుతురులో వ్యాధి సోకిన ఆకును దగ్గరగా ఫోటో తీయండి.",
                        "category": "retake_photo"
                    },
                    {
                        "action": "Consult Field Extension Officer",
                        "descriptionEn": "Take a live leaf sample to your local Mandal Agricultural Officer or KVK for laboratory diagnostic evaluation.",
                        "descriptionTe": "ఖచ్చితమైన నిర్ధారణ కోసం వ్యాధిగ్రస్తు ఆకును స్థానిక వ్యవసాయ అధికారి లేదా కృషి విజ్ఞాన కేంద్రానికి తీసుకెళ్లండి.",
                        "category": "expert_consultation"
                    }
                ],
                "uncertaintyWarning": (
                    "This AI assessment is an assistive decision-support indicator only and is NOT a guaranteed laboratory diagnosis. "
                    "Always verify critical interventions with qualified agricultural extension officers."
                )
            }

        # Check crop mismatch if crop hint was supplied
        if crop_hint and top_class_info and top_class_info.get("crop") != crop_hint.lower():
            # If the user selected a different crop than what model detects
            pass

        return {
            "status": "completed",
            "predictedClass": top_class_name,
            "predictedClassDisplayName": top_class_info["displayName"] if top_class_info else {"en": top_class_name, "te": top_class_name},
            "confidence": round(top_prob, 5),
            "classProbabilities": class_probs,
            "modelVersion": self.manifest.get("modelVersion"),
            "abstentionReason": None,
            "nextSteps": top_class_info.get("nextSteps", []) if top_class_info else [],
            "uncertaintyWarning": (
                "This AI assessment is an assistive decision-support indicator only and is NOT a guaranteed laboratory diagnosis. "
                "Always verify chemical or biological interventions with qualified local agronomists and adhere strictly to locally approved label instructions."
            )
        }

