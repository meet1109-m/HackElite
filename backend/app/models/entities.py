import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    Text,
)
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Zone(Base):
    __tablename__ = "zones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    zone_type = Column(String(100), nullable=True)
    waste_generation = Column(Float, default=0.0)
    baseline_generation = Column(Float, default=500.0)
    footfall_estimate = Column(Integer, default=5000)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)


class Bin(Base):
    __tablename__ = "bins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bin_code = Column(String(50), unique=True, nullable=False, index=True)
    zone = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity_kg = Column(Float, default=40.0)
    fill_percentage = Column(Float, default=0.0)
    estimated_weight = Column(Float, default=0.0)
    waste_stream = Column(String(50), default="Mixed")  # Organic, Recyclable, Mixed, Hazardous
    status = Column(String(50), default="Healthy")      # Healthy, Filling, High Priority, Critical, Overflow Risk, Offline
    priority_score = Column(Integer, default=0)
    predicted_overflow_time = Column(String(50), default=">24h")
    overflow_severity = Column(String(20), default="Green")  # Green, Yellow, Orange, Red
    last_collection = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BinReading(Base):
    __tablename__ = "bin_readings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bin_id = Column(String(36), ForeignKey("bins.id"), nullable=False, index=True)
    bin_code = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    fill_percentage = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_code = Column(String(50), unique=True, nullable=False, index=True)
    capacity_kg = Column(Float, default=2000.0)
    current_load = Column(Float, default=0.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="Available")  # Available, On Route, Maintenance, Off Duty
    assigned_route_id = Column(String(36), nullable=True)
    driver_name = Column(String(100), nullable=True, default="Ramesh Patel")
    driver_phone = Column(String(50), nullable=True, default="+91 98250 14210")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Route(Base):
    __tablename__ = "routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=False)
    vehicle_code = Column(String(50), nullable=False)
    distance_km = Column(Float, default=0.0)
    estimated_duration_mins = Column(Integer, default=0)
    load_kg = Column(Float, default=0.0)
    utilization_pct = Column(Float, default=0.0)
    waypoints_json = Column(Text, nullable=True)  # JSON string of ordered stops
    status = Column(String(50), default="Active") # Active, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)


class Collection(Base):
    __tablename__ = "collections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vehicle_id = Column(String(36), nullable=False)
    bin_id = Column(String(36), nullable=False)
    bin_code = Column(String(50), nullable=False)
    weight_collected = Column(Float, nullable=False)
    waste_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class WasteClassification(Base):
    __tablename__ = "waste_classifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bin_id = Column(String(36), nullable=True, index=True)
    bin_code = Column(String(50), nullable=True)
    image_url = Column(String(255), nullable=True)
    plastic_percentage = Column(Float, default=0.0)
    paper_percentage = Column(Float, default=0.0)
    metal_percentage = Column(Float, default=0.0)
    glass_percentage = Column(Float, default=0.0)
    organic_percentage = Column(Float, default=0.0)
    other_percentage = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    source = Column(String(50), default="AI Estimated")  # "AI Detected from Image" or "AI Estimated"
    created_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bin_id = Column(String(36), ForeignKey("bins.id"), nullable=False, index=True)
    bin_code = Column(String(50), nullable=False)
    prediction_time = Column(DateTime, default=datetime.utcnow)
    fill_6h = Column(Float, default=0.0)
    fill_12h = Column(Float, default=0.0)
    fill_24h = Column(Float, default=0.0)
    predicted_overflow_hours = Column(Float, default=24.0)
    confidence = Column(Float, default=0.75)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_type = Column(String(50), nullable=False)  # Overflow Risk, Contamination, Anomaly, Sensor Offline
    severity = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    bin_id = Column(String(36), nullable=True)
    bin_code = Column(String(50), nullable=True)
    zone = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="Active")    # Active, Acknowledged, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)
