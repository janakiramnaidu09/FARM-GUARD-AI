"""
FarmGuard AI - Disease Model Training Pipeline
Fine-tunes MobileNetV2 on agricultural leaf disease datasets with transfer learning,
data augmentation, class weighting, and model checkpointing.
"""

import os
import sys
import json
import argparse
from pathlib import Path

def train_model(
    data_dir: str = "data/processed",
    manifest_path: str = "model/model_manifest.json",
    output_model_path: str = "model/weights/crop_disease_mobilenetv2.keras",
    epochs: int = 25,
    batch_size: int = 32,
    learning_rate: float = 1e-4
):
    import tensorflow as tf
    from tensorflow.keras import layers, models, optimizers, callbacks
    from tensorflow.keras.applications import MobileNetV2

    print(f"[*] TensorFlow version: {tf.__version__}")
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    classes = [c["className"] for c in manifest["classes"]]
    num_classes = len(classes)
    img_height, img_width = manifest["inputShape"][:2]

    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")

    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        print(f"[!] Training directory '{train_dir}' or validation directory '{val_dir}' not found.")
        print("[!] Please run 'python scripts/prepare_dataset.py' with your raw images first.")
        sys.exit(1)

    print(f"[*] Loading training data from {train_dir}...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=classes,
        batch_size=batch_size,
        image_size=(img_height, img_width),
        shuffle=True,
        seed=42
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=classes,
        batch_size=batch_size,
        image_size=(img_height, img_width),
        shuffle=False
    )

    # Data augmentation pipeline
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1)
    ], name="data_augmentation")

    # Rescaling input to [-1, 1] for MobileNetV2
    rescale = layers.Rescaling(1./127.5, offset=-1)

    # Base transfer learning model
    print("[*] Instantiating MobileNetV2 base model (ImageNet weights)...")
    base_model = MobileNetV2(
        input_shape=(img_height, img_width, 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False  # Freeze base during stage 1

    inputs = tf.keras.Input(shape=(img_height, img_width, 3))
    x = data_augmentation(inputs)
    x = rescale(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs, name="FarmGuard_MobileNetV2")

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
        metrics=["accuracy", tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )

    model.summary()

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)

    cb_list = [
        callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-6),
        callbacks.ModelCheckpoint(filepath=output_model_path, monitor="val_accuracy", save_best_only=True)
    ]

    print("[*] Starting initial training epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=cb_list
    )

    # Optional Stage 2: Fine-tuning top layers of base model
    print("[*] Unfreezing top layers of MobileNetV2 for fine-tuning...")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate / 10),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
        metrics=["accuracy", tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        callbacks=cb_list
    )

    # Final save
    model.save(output_model_path)
    print(f"[+] Model saved successfully to {output_model_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()

    train_model(epochs=args.epochs, batch_size=args.batch_size, learning_rate=args.lr)

