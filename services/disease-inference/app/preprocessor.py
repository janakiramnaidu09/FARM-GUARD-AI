import cv2
import numpy as np
from typing import Tuple, Dict, Any, Optional

class ImagePreprocessingError(Exception):
    def __init__(self, message: str, code: str = "INVALID_IMAGE"):
        super().__init__(message)
        self.message = message
        self.code = code

class ImagePreprocessor:
    def __init__(
        self,
        target_size: Tuple[int, int] = (224, 224),
        min_dim: int = 100,
        max_dim: int = 4096,
        normalization: str = "mobilenet_v2_zero_one"
    ):
        self.target_size = target_size
        self.min_dim = min_dim
        self.max_dim = max_dim
        self.normalization = normalization

    def process(self, raw_bytes: bytes) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Validates raw image bytes, decodes with OpenCV, checks dimensions,
        converts color space, resizes, and normalizes for model inference.
        """
        if not raw_bytes or len(raw_bytes) == 0:
            raise ImagePreprocessingError("Empty image bytes received", "EMPTY_PAYLOAD")

        # Decode using OpenCV
        np_arr = np.frombuffer(raw_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            raise ImagePreprocessingError(
                "Image could not be decoded. Unsupported or corrupt image file.",
                "DECODE_FAILED"
            )

        orig_height, orig_width = img_bgr.shape[:2]

        # Dimension checks
        if orig_height < self.min_dim or orig_width < self.min_dim:
            raise ImagePreprocessingError(
                f"Image dimensions ({orig_width}x{orig_height}) are too small. Minimum resolution is {self.min_dim}x{self.min_dim}.",
                "DIMENSION_TOO_SMALL"
            )

        if orig_height > self.max_dim or orig_width > self.max_dim:
            raise ImagePreprocessingError(
                f"Image dimensions ({orig_width}x{orig_height}) exceed maximum allowed ({self.max_dim}x{self.max_dim}).",
                "DIMENSION_TOO_LARGE"
            )

        # Convert BGR (OpenCV default) to RGB
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # High-quality resize using OpenCV INTER_AREA (for downsampling) or INTER_LINEAR (for upsampling)
        interpolation = cv2.INTER_AREA if (orig_width > self.target_size[0] and orig_height > self.target_size[1]) else cv2.INTER_LINEAR
        resized = cv2.resize(img_rgb, self.target_size, interpolation=interpolation)

        # Normalization
        img_float = resized.astype(np.float32)
        if self.normalization == "mobilenet_v2_zero_one":
            normalized = img_float / 255.0
        elif self.normalization == "tf_minus_one_to_one":
            normalized = (img_float / 127.5) - 1.0
        else:
            normalized = img_float / 255.0

        # Expand dims for batch: (1, 224, 224, 3)
        batch = np.expand_dims(normalized, axis=0)

        metadata = {
            "original_width": orig_width,
            "original_height": orig_height,
            "channels": img_bgr.shape[2] if len(img_bgr.shape) > 2 else 1,
            "processed_shape": list(batch.shape)
        }

        return batch, metadata

