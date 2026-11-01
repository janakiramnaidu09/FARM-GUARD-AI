# FarmGuard Disease Classification Model Artifacts

This directory contains the schema, manifest, and weights specification for FarmGuard's agricultural leaf disease classifier.

- `manifest.schema.json`: JSON schema defining manifest validation.
- `model_manifest.json`: Active manifest specifying 8 initial crop disease classes (Tomato, Rice, Cotton) with bilingual Telugu/English display names, optimal input dimensions (224x224x3), confidence threshold (0.75), and actionable next steps.
- `weights/`: Directory designated for trained `.keras` or SavedModel weights.

