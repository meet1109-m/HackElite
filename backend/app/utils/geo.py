import math
from typing import Tuple, List, Dict, Any

# Earth radius in kilometers
EARTH_RADIUS_KM = 6371.0

# Bounding box for Ahmedabad metropolitan area
AHMEDABAD_BBOX = {
    "min_lat": 22.9000,
    "max_lat": 23.1800,
    "min_lon": 72.4200,
    "max_lon": 72.7200,
}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth

    in kilometers using the Haversine formula.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(EARTH_RADIUS_KM * c, 3)


def is_within_ahmedabad(lat: float, lon: float) -> bool:
    """Validate if a given (lat, lon) coordinate is within the Ahmedabad bounding box."""
    return (
        AHMEDABAD_BBOX["min_lat"] <= lat <= AHMEDABAD_BBOX["max_lat"]
        and AHMEDABAD_BBOX["min_lon"] <= lon <= AHMEDABAD_BBOX["max_lon"]
    )


def calculate_route_distance(coordinates: List[Tuple[float, float]]) -> float:
    """Calculate cumulative distance in kilometers along a sequential list of (lat, lon) coordinates."""
    if len(coordinates) < 2:
        return 0.0

    total_dist = 0.0
    for i in range(len(coordinates) - 1):
        lat1, lon1 = coordinates[i]
        lat2, lon2 = coordinates[i + 1]
        total_dist += haversine_distance(lat1, lon1, lat2, lon2)

    return round(total_dist, 2)


def estimate_travel_time_minutes(distance_km: float, average_speed_kmh: float = 25.0) -> int:
    """Estimate travel time in minutes for urban waste collection trucks in Ahmedabad

    (default 25 km/h urban collection speed).
    """
    if distance_km <= 0:
        return 0
    hours = distance_km / average_speed_kmh
    return max(1, round(hours * 60))
