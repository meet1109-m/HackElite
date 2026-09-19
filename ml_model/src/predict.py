"""Model inference and prediction routines.

This module will later handle:
- Predicting future fill-levels given recent sensor history
- Estimating time-to-overflow for active bins
- Classifying waste images into recycling categories (plastic, organic, paper, metal, glass, etc.)
"""


def predict_fill_level(features):
    """Placeholder function to predict fill level for a given bin.

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Fill-level prediction not yet implemented.")


def predict_overflow_risk(features):
    """Placeholder function to estimate overflow risk score (0.0 - 1.0).

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Overflow risk prediction not yet implemented.")


def classify_waste_image(image):
    """Placeholder function to classify a waste item from an image.

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Waste classification inference not yet implemented.")
