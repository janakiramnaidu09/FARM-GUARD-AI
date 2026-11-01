"""
FarmGuard AI - Disease Model Evaluation Pipeline
Evaluates trained models on the held-out test split, computing per-class
precision, recall, F1-score, confusion matrix, and threshold calibration metrics.
"""

import os
import sys
import json
import numpy as np
from pathlib import Path

def evaluate_model(
    test_dir: str = "data/processed/test",
    manifest_path: str = "model/model_manifest.json",
    model_path: str = "model/weights/crop_disease_mobilenetv2.keras",
    report_output: str = "model/evaluation_report.json"
):
    import tensorflow as tf
    from sklearn.metrics import classification_report, confusion_matrix

    if not os.path.exists(model_path):
        print(f"[!] Model file '{model_path}' not found.")
        sys.exit(1)

    if not os.path.exists(test_dir):
        print(f"[!] Test directory '{test_dir}' not found.")
        sys.exit(1)

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    classes = [c["className"] for c in manifest["classes"]]
    img_height, img_width = manifest["inputShape"][:2]
    threshold = manifest.get("confidenceThreshold", 0.75)

    print(f"[*] Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels="inferred",
        label_mode="int",
        class_names=classes,
        batch_size=32,
        image_size=(img_height, img_width),
        shuffle=False
    )

    y_true = []
    y_pred = []
    confidences = []
    abstained_count = 0

    print("[*] Running inference on test split...")
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        batch_conf = np.max(preds, axis=1)
        batch_pred = np.argmax(preds, axis=1)

        for true_lbl, pred_lbl, conf in zip(labels.numpy(), batch_pred, batch_conf):
            y_true.append(int(true_lbl))
            confidences.append(float(conf))
            if conf < threshold:
                abstained_count += 1
                y_pred.append(-1)  # Abstained
            else:
                y_pred.append(int(pred_lbl))

    total = len(y_true)
    abstention_rate = abstained_count / total if total > 0 else 0

    # Calculate metrics for non-abstained predictions
    eval_indices = [i for i, p in enumerate(y_pred) if p != -1]
    filtered_true = [y_true[i] for i in eval_indices]
    filtered_pred = [y_pred[i] for i in eval_indices]

    clf_report = classification_report(
        filtered_true,
        filtered_pred,
        target_names=classes,
        output_dict=True,
        zero_division=0
    )

    cm = confusion_matrix(filtered_true, filtered_pred, labels=list(range(len(classes))))

    report = {
        "model_version": manifest.get("modelVersion"),
        "total_test_samples": total,
        "confidence_threshold": threshold,
        "abstained_samples": abstained_count,
        "abstention_rate": round(abstention_rate, 4),
        "coverage_rate": round(1 - abstention_rate, 4),
        "post_threshold_accuracy": round(clf_report["accuracy"], 4),
        "per_class_metrics": {
            cls: {
                "precision": round(clf_report[cls]["precision"], 4),
                "recall": round(clf_report[cls]["recall"], 4),
                "f1_score": round(clf_report[cls]["f1-score"], 4),
                "support": clf_report[cls]["support"]
            }
            for cls in classes if cls in clf_report
        },
        "confusion_matrix": cm.tolist()
    }

    os.makedirs(os.path.dirname(report_output), exist_ok=True)
    with open(report_output, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"[+] Evaluation complete:")
    print(f"    - Post-Threshold Accuracy: {report['post_threshold_accuracy'] * 100:.2f}%")
    print(f"    - Abstention Rate: {report['abstention_rate'] * 100:.2f}%")
    print(f"    - Report saved to: {report_output}")

if __name__ == "__main__":
    evaluate_model()

