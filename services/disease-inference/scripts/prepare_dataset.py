"""
FarmGuard AI - Dataset Preparation Pipeline
Splits and validates raw agricultural leaf image datasets into stratified
train, validation, and test sets according to model_manifest.json.
"""

import os
import sys
import json
import shutil
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple

def load_manifest(manifest_path: str) -> Dict:
    with open(manifest_path, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_image_file(file_path: Path, min_dim: int = 100, max_dim: int = 4096) -> bool:
    try:
        img = cv2.imread(str(file_path))
        if img is None:
            return False
        h, w = img.shape[:2]
        if h < min_dim or w < min_dim or h > max_dim or w > max_dim:
            return False
        return True
    except Exception:
        return False

def prepare_dataset(
    raw_dir: str = "data/raw",
    processed_dir: str = "data/processed",
    manifest_path: str = "model/model_manifest.json",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
):
    np.random.seed(seed)
    manifest = load_manifest(manifest_path)
    supported_classes = [c["className"] for c in manifest["classes"]]
    
    print(f"[*] Preparing dataset for {len(supported_classes)} supported classes...")
    raw_path = Path(raw_dir)
    proc_path = Path(processed_dir)
    
    if not raw_path.exists():
        print(f"[!] Raw dataset directory '{raw_dir}' does not exist.")
        print(f"[*] Creating placeholder structure in '{raw_dir}' for data placement.")
        for cls in supported_classes:
            (raw_path / cls).mkdir(parents=True, exist_ok=True)
        print("[*] Please download agricultural leaf images (e.g. PlantVillage or ICAR dataset)")
        print(f"    and place class folders into '{raw_dir}/'.")
        return

    # Clean / prepare destination folders
    for split in ["train", "val", "test"]:
        for cls in supported_classes:
            (proc_path / split / cls).mkdir(parents=True, exist_ok=True)

    summary = {}
    for cls in supported_classes:
        class_dir = raw_path / cls
        if not class_dir.exists():
            print(f"[!] Warning: Class directory '{cls}' missing in raw data.")
            summary[cls] = {"train": 0, "val": 0, "test": 0, "corrupted": 0}
            continue

        valid_files = []
        corrupted = 0
        for ext in ["*.jpg", "*.jpeg", "*.png", "*.JPG", "*.JPEG", "*.PNG"]:
            for f in class_dir.glob(ext):
                if validate_image_file(f):
                    valid_files.append(f)
                else:
                    corrupted += 1

        np.random.shuffle(valid_files)
        total = len(valid_files)
        n_train = int(total * train_ratio)
        n_val = int(total * val_ratio)

        train_files = valid_files[:n_train]
        val_files = valid_files[n_train:n_train + n_val]
        test_files = valid_files[n_train + n_val:]

        for f in train_files:
            shutil.copy2(f, proc_path / "train" / cls / f.name)
        for f in val_files:
            shutil.copy2(f, proc_path / "val" / cls / f.name)
        for f in test_files:
            shutil.copy2(f, proc_path / "test" / cls / f.name)

        summary[cls] = {
            "train": len(train_files),
            "val": len(val_files),
            "test": len(test_files),
            "corrupted": corrupted
        }
        print(f"  - {cls}: {len(train_files)} train, {len(val_files)} val, {len(test_files)} test ({corrupted} dropped)")

    stats_file = proc_path / "dataset_summary.json"
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"[+] Dataset preparation complete. Summary saved to {stats_file}")

if __name__ == "__main__":
    prepare_dataset()

