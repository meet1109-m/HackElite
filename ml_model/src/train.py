"""Model training routines.

This module will later handle:
- Training fill-level forecasting models (e.g. ARIMA, Random Forest, XGBoost)
- Training overflow classification models
- Training / fine-tuning waste-image classification models
"""


def train_fill_level_model(training_data):
    """Placeholder function for training the fill-level prediction model.

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Fill-level model training not yet implemented.")


def train_classifier_model(image_dataset):
    """Placeholder function for training the waste material classification model.

    To be implemented during the ML development phase.
    """
    raise NotImplementedError("Waste classification training not yet implemented.")


if __name__ == "__main__":
    print("Training module placeholder. Models have not been implemented or trained yet.")
