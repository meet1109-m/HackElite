"""
Transfer Learning Model Definition for Waste Image Classification.
Uses lightweight MobileNetV2 architecture with a custom classification head.
"""
import torch
import torch.nn as nn
from torchvision import models
from torchvision.models import mobilenet_v2, MobileNet_V2_Weights

class WasteClassifier(nn.Module):
    def __init__(self, num_classes: int = 5, pretrained: bool = True, dropout_rate: float = 0.2):
        super(WasteClassifier, self).__init__()
        weights = MobileNet_V2_Weights.DEFAULT if pretrained else None
        self.backbone = mobilenet_v2(weights=weights)
        
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def freeze_backbone(self):
        """Freezes feature extractor layers for Stage 1 training."""
        for param in self.backbone.features.parameters():
            param.requires_grad = False

    def unfreeze_top_layers(self, num_blocks: int = 3):
        """Unfreezes only the last few convolutional blocks for Stage 2 fine-tuning."""
        total_layers = len(self.backbone.features)
        for i, layer in enumerate(self.backbone.features):
            if i >= total_layers - num_blocks:
                for param in layer.parameters():
                    param.requires_grad = True
