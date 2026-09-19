"""Data preprocessing and feature engineering routines.

This module will later handle:
- Cleaning and formatting historical waste generation data
- Normalizing sensor readings (fill-level, weight, humidity)
- Generating time-series features (hour, day of week, lag features)
- Preprocessing waste images for classification models
"""


def preprocess_fill_level_data(raw_data):
    """Placeholder function for preprocessing bin fill-level data.

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Fill-level preprocessing not yet implemented.")


def preprocess_image_data(image_path):
    """Placeholder function for preprocessing waste images.

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Image preprocessing not yet implemented.")
