"""
Inference Module for Waste Image Classification.
Provides lazy-loaded, thread-safe inference for single images or batches.
"""
import io
import json
from pathlib import Path
from typing import Union, Dict, Any
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms

BASE_DIR = Path(__file__).resolve().parent.parent.parent
IMG_CLASS_DIR = BASE_DIR / "image_classification"
MODELS_DIR = IMG_CLASS_DIR / "models"

# Standard Transform for Inference
INFERENCE_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class WasteImageClassifier:
    """Singleton lazy-loader for PyTorch waste image classifier."""
    def __init__(self):
        self._model = None
        self._classes = None
        self._device = torch.device("cpu")

    def _load_model(self):
        if self._model is None:
            # Import dynamically to avoid circular dependencies
            import sys
            src_dir = str(IMG_CLASS_DIR / "src")
            if src_dir not in sys.path:
                sys.path.insert(0, src_dir)
            from model import WasteClassifier
            
            # Load classes
            class_json = MODELS_DIR / "class_names.json"
            if not class_json.exists():
                raise FileNotFoundError(f"Missing class_names.json in {MODELS_DIR}")
                
            with open(class_json, "r") as f:
                class_data = json.load(f)
                self._classes = class_data["classes"]
                
            model_weights = MODELS_DIR / "image_classifier.pt"
            if not model_weights.exists():
                raise FileNotFoundError(f"Missing image_classifier.pt in {MODELS_DIR}")
                
            model = WasteClassifier(num_classes=len(self._classes), pretrained=False)
            model.load_state_dict(torch.save_loaded := torch.load(model_weights, map_location=self._device))
            model.to(self._device)
            model.eval()
            self._model = model

    def predict(self, image_input: Union[str, Path, bytes, Image.Image]) -> Dict[str, Any]:
        """Classifies a waste image into WasteWise AI streams."""
        self._load_model()
        
        # Load & validate image
        try:
            if isinstance(image_input, (str, Path)):
                img_path = Path(image_input)
                if not img_path.exists():
                    raise FileNotFoundError(f"Image file does not exist: {img_path}")
                img = Image.open(img_path).convert("RGB")
            elif isinstance(image_input, bytes):
                img = Image.open(io.BytesIO(image_input)).convert("RGB")
            elif isinstance(image_input, Image.Image):
                img = image_input.convert("RGB")
            else:
                raise ValueError(f"Unsupported image input type: {type(image_input)}")
        except Exception as e:
            return {
                "error": f"Failed to process image: {str(e)}",
                "predicted_class": "Unknown",
                "confidence": 0.0,
                "probabilities": {},
                "source": "AI Detected from Image"
            }
            
        # Tensor transform
        tensor_img = INFERENCE_TRANSFORM(img).unsqueeze(0).to(self._device)
        
        with torch.no_grad():
            logits = self._model(tensor_img)
            probs = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()
            
        pred_idx = int(probs.argmax())
        pred_class = self._classes[pred_idx]
        confidence = float(probs[pred_idx])
        
        probabilities_dict = {
            cname: round(float(probs[i]), 4)
            for i, cname in enumerate(self._classes)
        }
        
        return {
            "predicted_class": pred_class,
            "confidence": round(confidence, 4),
            "probabilities": probabilities_dict,
            "waste_stream": pred_class,
            "source": "AI Detected from Image"
        }

# Global Singleton instance
_classifier = WasteImageClassifier()

def predict_waste_image(image_input: Union[str, Path, bytes, Image.Image]) -> Dict[str, Any]:
    return _classifier.predict(image_input)

if __name__ == "__main__":
    # Test on first available test image
    test_img_dir = BASE_DIR / "data" / "DSWD" / "DSWD" / "Test" / "Image"
    test_files = list(test_img_dir.glob("*.png"))
    if test_files:
        sample_img = test_files[0]
        print(f"Testing image predictor on sample: {sample_img.name}...")
        res = predict_waste_image(sample_img)
        print("Prediction result:\n", json.dumps(res, indent=2))
