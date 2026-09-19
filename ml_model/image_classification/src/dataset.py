"""
PyTorch Dataset and DataLoaders for DSWD Waste Images.
"""
from pathlib import Path
from typing import Tuple, List, Dict, Any
import pandas as pd
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "image_classification" / "processed"

# Waste stream classes
CLASSES = ["Plastic", "Other", "Metal", "Paper", "Glass"]
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASSES)}
IDX_TO_CLASS = {i: c for i, c in enumerate(CLASSES)}

# Normalization constants (ImageNet standard)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def get_transforms(is_train: bool = True):
    if is_train:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.1, contrast=0.1),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
        ])
    else:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
        ])

class DSWDDataset(Dataset):
    def __init__(self, df: pd.DataFrame, is_train: bool = False):
        self.df = df.reset_index(drop=True)
        self.transform = get_transforms(is_train=is_train)

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        row = self.df.iloc[idx]
        img_path = BASE_DIR / row["relative_path"]
        
        with Image.open(img_path) as img:
            img = img.convert("RGB")
            tensor_img = self.transform(img)
            
        stream_label = row["waste_stream"]
        class_idx = CLASS_TO_IDX.get(stream_label, CLASS_TO_IDX["Other"])
        return tensor_img, class_idx

def get_data_loaders(batch_size: int = 16) -> Tuple[DataLoader, DataLoader, DataLoader, Dict[str, Any]]:
    splits_csv = PROCESSED_DIR / "dswd_splits.csv"
    if not splits_csv.exists():
        raise FileNotFoundError("dswd_splits.csv not found. Run dataset_audit.py first.")
        
    df = pd.read_csv(splits_csv)
    train_df = df[df["split"] == "train"]
    val_df = df[df["split"] == "validation"]
    test_df = df[df["split"] == "test"]
    
    train_ds = DSWDDataset(train_df, is_train=True)
    val_ds = DSWDDataset(val_df, is_train=False)
    test_ds = DSWDDataset(test_df, is_train=False)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    
    metadata = {
        "train_count": len(train_df),
        "val_count": len(val_df),
        "test_count": len(test_df),
        "classes": CLASSES,
        "class_to_idx": CLASS_TO_IDX,
        "idx_to_class": IDX_TO_CLASS
    }
    return train_loader, val_loader, test_loader, metadata
