// SmartBinX API Client Service with rich Ahmedabad smart municipal waste dataset

const API_BASE = '/api';

export const INITIAL_MOCK_BINS = [
  {
    id: "bin-104",
    bin_code: "AHM-104",
    zone: "Bodakdev (Zone E)",
    address: "Sindhu Bhavan Road Commercial Plaza, Bodakdev, Ahmedabad",
    latitude: 23.0392,
    longitude: 72.5061,
    capacity_kg: 50,
    current_fill: 82.0,
    fill_percentage: 82.0,
    estimated_weight_kg: 31.4,
    waste_stream: "Organic (Compost)",
    status: "Critical",
    priority_score: 94,
    predicted_overflow_hours: 4.3,
    predicted_overflow_text: "04h 18m",
    last_collection: "Today, 06:15 AM",
    avg_daily_generation_kg: 48.5,
    prediction: {
      fill_6h: 91.0,
      fill_12h: 98.5,
      fill_24h: 100.0,
      confidence: 94,
      model_type: "Ensemble LightGBM + Time Decay"
    },
    composition: {
      source: "AI Detected from Image",
      confidence: 91,
      recycling_purity_score: 76,
      plastic: 28.0,
      organic: 48.0,
      paper: 14.0,
      metal: 4.0,
      glass: 2.0,
      other: 4.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 94,
      tier: "CRITICAL",
      breakdown: [
        { factor: "Current Volumetric Fill", description: "Sensor reading at 82% capacity", points: 32, raw_value: "82%" },
        { factor: "Overflow Velocity", description: "Predicted critical breach in 4.3h", points: 28, raw_value: "4h 18m" },
        { factor: "Sindhu Bhavan Dining Surge", description: "Commercial dining and restaurant surge", points: 15, raw_value: "+82% surge" },
        { factor: "Organic Degradation", description: "Odor & methane decay risk in warm corridor", points: 15, raw_value: "48% Organic" },
        { factor: "Time Lapsed", description: "5 hours since last collection run", points: 4, raw_value: "5.0 hrs" }
      ],
      ai_recommendation: "Dispatch collection truck V-01 (Bodakdev West Depot) immediately. Projected overflow breach at 18:20 IST."
    }
  },
  {
    id: "bin-118",
    bin_code: "AHM-118",
    zone: "Navrangpura (Zone B)",
    address: "CG Road Commercial Complex, Navrangpura, Ahmedabad",
    latitude: 23.0370,
    longitude: 72.5620,
    capacity_kg: 50,
    current_fill: 89.0,
    fill_percentage: 89.0,
    estimated_weight_kg: 38.2,
    waste_stream: "Plastic & Dry Recyclables",
    status: "Critical",
    priority_score: 89,
    predicted_overflow_hours: 4.3,
    predicted_overflow_text: "04h 18m",
    last_collection: "Today, 05:45 AM",
    avg_daily_generation_kg: 52.0,
    prediction: {
      fill_6h: 96.0,
      fill_12h: 100.0,
      fill_24h: 100.0,
      confidence: 92,
      model_type: "Ensemble LightGBM + Time Decay"
    },
    composition: {
      source: "AI Detected from Image",
      confidence: 88,
      recycling_purity_score: 84,
      plastic: 72.0,
      organic: 6.0,
      paper: 12.0,
      metal: 5.0,
      glass: 3.0,
      other: 2.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 89,
      tier: "CRITICAL",
      breakdown: [
        { factor: "Current Volumetric Fill", description: "Sensor reading at 89% capacity", points: 34, raw_value: "89%" },
        { factor: "Overflow Velocity", description: "Predicted overflow in 4.3h", points: 26, raw_value: "4h 18m" },
        { factor: "High Recyclable Value", description: "High-grade PET & packaging stream", points: 15, raw_value: "72% Plastic" },
        { factor: "Commercial Zone Sensitivity", points: 14, raw_value: "CG Road Hub" }
      ],
      ai_recommendation: "Assign vehicle V-01 or V-03 for consolidated dry stream recovery."
    }
  },
  {
    id: "bin-091",
    bin_code: "AHM-091",
    zone: "Vastrapur (Zone A)",
    address: "Vastrapur Lake Food Court Corridor, Ahmedabad",
    latitude: 23.0350,
    longitude: 72.5290,
    capacity_kg: 50,
    current_fill: 76.0,
    fill_percentage: 76.0,
    estimated_weight_kg: 29.5,
    waste_stream: "Organic (Compost)",
    status: "High Priority",
    priority_score: 76,
    predicted_overflow_hours: 6.8,
    predicted_overflow_text: "06h 48m",
    last_collection: "Yesterday, 21:30 PM",
    avg_daily_generation_kg: 44.0,
    prediction: {
      fill_6h: 88.0,
      fill_12h: 96.0,
      fill_24h: 100.0,
      confidence: 89,
      model_type: "Regression SARIMAX"
    },
    composition: {
      source: "AI Estimated from Telemetry",
      confidence: 82,
      recycling_purity_score: 79,
      plastic: 18.0,
      organic: 62.0,
      paper: 10.0,
      metal: 3.0,
      glass: 2.0,
      other: 5.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 76,
      tier: "HIGH",
      breakdown: [
        { factor: "Fill Level", points: 27, raw_value: "76%" },
        { factor: "Predicted Overflow", points: 23, raw_value: "6.8 hrs" },
        { factor: "Food Court Organic Density", points: 14, raw_value: "62% Organic" },
        { factor: "Night Influx History", points: 12, raw_value: "Peak 19:00-22:00" }
      ],
      ai_recommendation: "Include in standard afternoon collection cycle before evening lake surge."
    }
  },
  {
    id: "bin-127",
    bin_code: "AHM-127",
    zone: "Bodakdev (Zone E)",
    address: "Sindhu Bhavan Road Commercial Plaza, Bodakdev",
    latitude: 23.0420,
    longitude: 72.5110,
    capacity_kg: 50,
    current_fill: 71.0,
    fill_percentage: 71.0,
    estimated_weight_kg: 26.8,
    waste_stream: "Paper & Cardboard",
    status: "High Priority",
    priority_score: 72,
    predicted_overflow_hours: 8.5,
    predicted_overflow_text: "08h 30m",
    last_collection: "Today, 04:30 AM",
    avg_daily_generation_kg: 39.0,
    prediction: {
      fill_6h: 81.0,
      fill_12h: 90.0,
      fill_24h: 98.0,
      confidence: 87,
      model_type: "Regression SARIMAX"
    },
    composition: {
      source: "AI Estimated from Telemetry",
      confidence: 85,
      recycling_purity_score: 88,
      plastic: 12.0,
      organic: 8.0,
      paper: 74.0,
      metal: 2.0,
      glass: 1.0,
      other: 3.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 72,
      tier: "HIGH",
      breakdown: [
        { factor: "Fill Level", points: 25, raw_value: "71%" },
        { factor: "Predicted Overflow", points: 20, raw_value: "8.5 hrs" },
        { factor: "High Pulp Purity Grade", points: 16, raw_value: "74% Paper" },
        { factor: "Commercial Rate", points: 11, raw_value: "39 kg/d" }
      ],
      ai_recommendation: "Collect during second shift to maintain clean dry cardboard recovery grade."
    }
  },
  {
    id: "bin-156",
    bin_code: "AHM-156",
    zone: "Bodakdev (Zone E)",
    address: "Judges Bungalow Road Corridor, Bodakdev, Ahmedabad",
    latitude: 23.0410,
    longitude: 72.5085,
    capacity_kg: 50,
    current_fill: 96.0,
    fill_percentage: 96.0,
    estimated_weight_kg: 48.0,
    waste_stream: "Mixed Waste",
    status: "Overflow Risk",
    priority_score: 98,
    predicted_overflow_hours: 0.75,
    predicted_overflow_text: "00h 45m",
    last_collection: "Today, 07:00 AM",
    avg_daily_generation_kg: 62.0,
    prediction: {
      fill_6h: 100.0,
      fill_12h: 100.0,
      fill_24h: 100.0,
      confidence: 96,
      model_type: "Ensemble LightGBM + Time Decay"
    },
    composition: {
      source: "AI Detected from Image",
      confidence: 94,
      recycling_purity_score: 78,
      plastic: 68.0,
      organic: 14.0,
      paper: 10.0,
      metal: 4.0,
      glass: 2.0,
      other: 2.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 98,
      tier: "CRITICAL",
      breakdown: [
        { factor: "Urgent Spill Hazard", points: 35, raw_value: "96% Fill" },
        { factor: "Immediate Overflow Time", points: 30, raw_value: "45 mins" },
        { factor: "Commercial Corridor Surge", points: 15, raw_value: "Bodakdev Hub" },
        { factor: "Rapid Velocity Spike", points: 10, raw_value: "+82% surge" },
        { factor: "Time Since Collection", points: 8, raw_value: "8.5 hrs" }
      ],
      ai_recommendation: "EMERGENCY REPLAN TRIGGERED: Insert directly into active Truck V-01 route sequence in Bodakdev."
    }
  },
  {
    id: "bin-045",
    bin_code: "AHM-045",
    zone: "Maninagar (Zone D)",
    address: "Kankaria Lake Gate 3, Maninagar, Ahmedabad",
    latitude: 23.0060,
    longitude: 72.6020,
    capacity_kg: 50,
    current_fill: 54.0,
    fill_percentage: 54.0,
    estimated_weight_kg: 21.0,
    waste_stream: "Organic (Compost)",
    status: "Filling",
    priority_score: 52,
    predicted_overflow_hours: 14.2,
    predicted_overflow_text: "14h 12m",
    last_collection: "Today, 06:30 AM",
    avg_daily_generation_kg: 35.0,
    prediction: {
      fill_6h: 68.0,
      fill_12h: 82.0,
      fill_24h: 96.0,
      confidence: 86,
      model_type: "Regression SARIMAX"
    },
    composition: {
      source: "AI Estimated from Telemetry",
      confidence: 80,
      recycling_purity_score: 74,
      plastic: 22.0,
      organic: 54.0,
      paper: 12.0,
      metal: 4.0,
      glass: 3.0,
      other: 5.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 52,
      tier: "MEDIUM",
      breakdown: [
        { factor: "Fill Level", points: 19, raw_value: "54%" },
        { factor: "Predicted Overflow", points: 16, raw_value: "14.2 hrs" },
        { factor: "Kankaria Pedestrian Base", points: 10, raw_value: "Zone D" },
        { factor: "Normal Generation", points: 7, raw_value: "35 kg/d" }
      ],
      ai_recommendation: "Stable fill rate. Scheduled for regular morning collection tomorrow."
    }
  },
  {
    id: "bin-062",
    bin_code: "AHM-062",
    zone: "Paldi (Zone G)",
    address: "Paldi Cross Road, Near Museum, Ahmedabad",
    latitude: 23.0140,
    longitude: 72.5640,
    capacity_kg: 50,
    current_fill: 38.0,
    fill_percentage: 38.0,
    estimated_weight_kg: 14.5,
    waste_stream: "Glass & Metal",
    status: "Healthy",
    priority_score: 36,
    predicted_overflow_hours: 28.5,
    predicted_overflow_text: "28h 30m",
    last_collection: "Today, 08:00 AM",
    avg_daily_generation_kg: 18.0,
    prediction: {
      fill_6h: 46.0,
      fill_12h: 55.0,
      fill_24h: 72.0,
      confidence: 90,
      model_type: "Regression SARIMAX"
    },
    composition: {
      source: "AI Estimated from Telemetry",
      confidence: 88,
      recycling_purity_score: 92,
      plastic: 8.0,
      organic: 4.0,
      paper: 6.0,
      metal: 38.0,
      glass: 42.0,
      other: 2.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 36,
      tier: "LOW",
      breakdown: [
        { factor: "Fill Level", points: 12, raw_value: "38%" },
        { factor: "Low Overflow Risk", points: 10, raw_value: "28.5 hrs" },
        { factor: "High Value Stream", points: 8, raw_value: "80% Glass/Metal" },
        { factor: "Low Accumulation Rate", points: 6, raw_value: "18 kg/d" }
      ],
      ai_recommendation: "Optimal status. No immediate vehicle dispatch required."
    }
  },
  {
    id: "bin-088",
    bin_code: "AHM-088",
    zone: "Satellite (Zone F)",
    address: "Shivranjani Crossroads, Satellite, Ahmedabad",
    latitude: 23.0240,
    longitude: 72.5320,
    capacity_kg: 50,
    current_fill: 42.0,
    fill_percentage: 42.0,
    estimated_weight_kg: 16.2,
    waste_stream: "Plastic & Packaging",
    status: "Healthy",
    priority_score: 41,
    predicted_overflow_hours: 22.0,
    predicted_overflow_text: "22h 00m",
    last_collection: "Today, 07:30 AM",
    avg_daily_generation_kg: 24.0,
    prediction: {
      fill_6h: 52.0,
      fill_12h: 64.0,
      fill_24h: 82.0,
      confidence: 89,
      model_type: "Regression SARIMAX"
    },
    composition: {
      source: "AI Estimated from Telemetry",
      confidence: 84,
      recycling_purity_score: 81,
      plastic: 64.0,
      organic: 12.0,
      paper: 16.0,
      metal: 4.0,
      glass: 2.0,
      other: 2.0,
      contamination_alert: null
    },
    priority_explanation: {
      score: 41,
      tier: "LOW",
      breakdown: [
        { factor: "Fill Level", points: 15, raw_value: "42%" },
        { factor: "Predicted Overflow", points: 14, raw_value: "22.0 hrs" },
        { factor: "Recyclable Fraction", points: 7, raw_value: "64% Plastic" },
        { factor: "Steady Pace", points: 5, raw_value: "24 kg/d" }
      ],
      ai_recommendation: "Healthy buffer. Include in routine tomorrow morning circuit."
    }
  }
];

export const INITIAL_MOCK_VEHICLES = [
  {
    id: "V-01",
    vehicle_code: "V-01 (Bodakdev Heavy Compactor)",
    vehicle_type: "Hydraulic Compactor (Diesel Euro VI)",
    driver_name: "Ramesh Patel",
    driver_phone: "+91 98250 14210",
    capacity_kg: 2000,
    current_load_kg: 450,
    current_load: 450,
    available_capacity_kg: 1550,
    utilization_percentage: 22.5,
    status: "Available (Bodakdev)",
    latitude: 23.0370,
    longitude: 72.5120,
    speed_kmh: 24
  },
  {
    id: "V-02",
    vehicle_code: "V-02 (Bodakdev Medium Tipper)",
    vehicle_type: "Medium Municipal Tipper",
    driver_name: "Kiran Solanki",
    driver_phone: "+91 94260 88123",
    capacity_kg: 2500,
    current_load_kg: 1850,
    current_load: 1850,
    available_capacity_kg: 650,
    utilization_percentage: 74.0,
    status: "On Route (Bodakdev)",
    latitude: 23.0385,
    longitude: 72.5090,
    speed_kmh: 18
  },
  {
    id: "V-03",
    vehicle_code: "V-03 (Dudheshwar Central Compactor)",
    vehicle_type: "Hydraulic Compactor",
    driver_name: "Dinesh Varma",
    driver_phone: "+91 97240 55319",
    capacity_kg: 1500,
    current_load_kg: 0,
    current_load: 0,
    available_capacity_kg: 1500,
    utilization_percentage: 0.0,
    status: "Available (Dudheshwar)",
    latitude: 23.0450,
    longitude: 72.5780,
    speed_kmh: 28
  },
  {
    id: "V-04",
    vehicle_code: "V-04 (Navrangpura Electric Tipper)",
    vehicle_type: "Zero-Emission EV Tipper",
    driver_name: "Amit Dave",
    driver_phone: "+91 98251 33412",
    capacity_kg: 3000,
    current_load_kg: 1200,
    current_load: 1200,
    available_capacity_kg: 1800,
    utilization_percentage: 40.0,
    status: "On Route (Navrangpura)",
    latitude: 23.0360,
    longitude: 72.5540,
    speed_kmh: 20
  },
  {
    id: "V-05",
    vehicle_code: "V-05 (Odhav East Heavy)",
    vehicle_type: "Heavy Multi-Axle Tipper",
    driver_name: "Suresh Chauhan",
    driver_phone: "+91 98240 77154",
    capacity_kg: 3500,
    current_load_kg: 0,
    current_load: 0,
    available_capacity_kg: 3500,
    utilization_percentage: 0.0,
    status: "Available (Odhav)",
    latitude: 23.0230,
    longitude: 72.6510,
    speed_kmh: 30
  },
  {
    id: "V-06",
    vehicle_code: "V-06 (Vastrapur Standard Tipper)",
    vehicle_type: "Standard Municipal Tipper",
    driver_name: "Vijay Shah",
    driver_phone: "+91 94280 22910",
    capacity_kg: 2000,
    current_load_kg: 700,
    current_load: 700,
    available_capacity_kg: 1300,
    utilization_percentage: 35.0,
    status: "Available (Vastrapur)",
    latitude: 23.0345,
    longitude: 72.5280,
    speed_kmh: 22
  },
  {
    id: "V-07",
    vehicle_code: "V-07 (Dudheshwar Maintenance Unit)",
    vehicle_type: "Utility Service Truck",
    driver_name: "Pravin Parmar",
    driver_phone: "+91 98980 11234",
    capacity_kg: 2500,
    current_load_kg: 0,
    current_load: 0,
    available_capacity_kg: 2500,
    utilization_percentage: 0.0,
    status: "Maintenance",
    latitude: 23.0450,
    longitude: 72.5780,
    speed_kmh: 0
  },
  {
    id: "V-08",
    vehicle_code: "V-08 (Prahlad Nagar Tipper)",
    vehicle_type: "Medium Municipal Tipper",
    driver_name: "Mahesh Prajapati",
    driver_phone: "+91 98254 99182",
    capacity_kg: 1800,
    current_load_kg: 600,
    current_load: 600,
    available_capacity_kg: 1200,
    utilization_percentage: 33.3,
    status: "Available (Prahlad Nagar)",
    latitude: 23.0140,
    longitude: 72.5065,
    speed_kmh: 25
  },
  {
    id: "V-09",
    vehicle_code: "V-09 (SG Highway Compactor)",
    vehicle_type: "Hydraulic Compactor",
    driver_name: "Nilesh Rathod",
    driver_phone: "+91 94270 44521",
    capacity_kg: 3000,
    current_load_kg: 1600,
    current_load: 1600,
    available_capacity_kg: 1400,
    utilization_percentage: 53.3,
    status: "Available (SG Highway)",
    latitude: 23.0260,
    longitude: 72.5035,
    speed_kmh: 26
  },
  {
    id: "V-10",
    vehicle_code: "V-10 (Maninagar Standard)",
    vehicle_type: "Standard Municipal Tipper",
    driver_name: "Harish Makwana",
    driver_phone: "+91 98255 66732",
    capacity_kg: 2200,
    current_load_kg: 950,
    current_load: 950,
    available_capacity_kg: 1250,
    utilization_percentage: 43.2,
    status: "Available (Maninagar)",
    latitude: 22.9985,
    longitude: 72.6020,
    speed_kmh: 24
  },
  {
    id: "V-11",
    vehicle_code: "V-11 (Ashram Road Heavy)",
    vehicle_type: "Heavy Multi-Axle Tipper",
    driver_name: "Bharat Vaghela",
    driver_phone: "+91 98242 88419",
    capacity_kg: 3200,
    current_load_kg: 1100,
    current_load: 1100,
    available_capacity_kg: 2100,
    utilization_percentage: 34.4,
    status: "Available (Ashram Road)",
    latitude: 23.0325,
    longitude: 72.5700,
    speed_kmh: 23
  },
  {
    id: "V-12",
    vehicle_code: "V-12 (Sabarmati Electric)",
    vehicle_type: "Zero-Emission EV Tipper",
    driver_name: "Jayesh Pandya",
    driver_phone: "+91 98250 55198",
    capacity_kg: 2800,
    current_load_kg: 350,
    current_load: 350,
    available_capacity_kg: 2450,
    utilization_percentage: 12.5,
    status: "Available (Sabarmati)",
    latitude: 23.0805,
    longitude: 72.5920,
    speed_kmh: 21
  }
];

export const INITIAL_MOCK_ZONES = [
  { id: "z-bodakdev", name: "Bodakdev", center_lat: 23.0396, center_lng: 72.5065, current_generation_kg: 1638, baseline_generation_kg: 900, delta_percentage: 82.0 },
  { id: "z-sg-highway", name: "SG Highway", center_lat: 23.0270, center_lng: 72.5020, current_generation_kg: 1450, baseline_generation_kg: 1100, delta_percentage: 31.8 },
  { id: "z-navrangpura", name: "Navrangpura", center_lat: 23.0373, center_lng: 72.5524, current_generation_kg: 920, baseline_generation_kg: 750, delta_percentage: 22.7 },
  { id: "z-vastrapur", name: "Vastrapur", center_lat: 23.0350, center_lng: 72.5293, current_generation_kg: 810, baseline_generation_kg: 780, delta_percentage: 3.8 },
  { id: "z-prahlad-nagar", name: "Prahlad Nagar", center_lat: 23.0135, center_lng: 72.5075, current_generation_kg: 910, baseline_generation_kg: 880, delta_percentage: 3.4 },
  { id: "z-ashram-road", name: "Ashram Road", center_lat: 23.0338, center_lng: 72.5714, current_generation_kg: 980, baseline_generation_kg: 950, delta_percentage: 3.2 },
  { id: "z-sabarmati", name: "Sabarmati", center_lat: 23.0818, center_lng: 72.5938, current_generation_kg: 615, baseline_generation_kg: 600, delta_percentage: 2.5 },
  { id: "z-satellite", name: "Satellite", center_lat: 23.0304, center_lng: 72.5177, current_generation_kg: 840, baseline_generation_kg: 820, delta_percentage: 2.4 },
  { id: "z-maninagar", name: "Maninagar", center_lat: 22.9978, center_lng: 72.6033, current_generation_kg: 870, baseline_generation_kg: 850, delta_percentage: 2.4 },
  { id: "z-paldi", name: "Paldi", center_lat: 23.0125, center_lng: 72.5625, current_generation_kg: 660, baseline_generation_kg: 650, delta_percentage: 1.5 }
];

export class ApiError extends Error {
  constructor(message, status = 500, endpoint = '', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData && errorData.detail) {
          errorDetail = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Body was not JSON
      }
      throw new ApiError(errorDetail, res.status, endpoint);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network errors (e.g. Failed to fetch, connection refused, CORS failure)
    throw new ApiError(
      `Network error contacting ${endpoint}: Unable to connect to SmartBinX backend at http://localhost:8000. Ensure the FastAPI server is running.`,
      0,
      endpoint,
      err.message
    );
  }
}

export const apiService = {
  // Bins
  async getBins(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/bins${query ? `?${query}` : ''}`);
  },

  async getBinById(binId) {
    return await request(`/bins/${binId}`);
  },

  async getBinDigitalTwin(binId) {
    return await request(`/bins/${binId}/twin`);
  },

  async getBinReadings(binId) {
    return await request(`/bin-readings/${binId}`);
  },

  async recordTelemetry(binCode, fillPercentage, weight = null) {
    const params = new URLSearchParams({ fill_percentage: fillPercentage });
    if (weight !== null && weight !== undefined) {
      params.append('weight', weight);
    }
    return await request(`/bins/${encodeURIComponent(binCode)}/telemetry?${params.toString()}`, {
      method: 'POST'
    });
  },

  async collectBin(binCode, vehicleCode = 'V-01') {
    const params = new URLSearchParams({ vehicle_code: vehicleCode });
    return await request(`/bins/${encodeURIComponent(binCode)}/collect?${params.toString()}`, {
      method: 'POST'
    });
  },

  // Waste Vision
  async classifyWaste(payload = {}) {
    const isFormData = payload instanceof FormData;
    return await request('/waste/classify', {
      method: 'POST',
      body: isFormData ? payload : JSON.stringify(payload)
    });
  },

  // Vehicles
  async getVehicles(status = null) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request(`/vehicles${query}`);
  },

  async getBestVehicleForBin(binId) {
    return await request(`/vehicles/best-for-bin/${binId}`);
  },

  // Routes
  async optimizeRoute(payload = {}) {
    return await request('/routes/optimize', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async replanRoute(payload = {}) {
    return await request('/routes/replan', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Analytics & Zones
  async getAnalytics() {
    return await request('/analytics');
  },

  async getHotspots() {
    return await request('/analytics/hotspots');
  },

  async getAnomalies() {
    return await request('/analytics/anomalies');
  },

  async getEnvironmentalImpact() {
    return await request('/analytics/impact');
  },

  async getZones() {
    return await request('/zones');
  },

  // Simulation
  async runSimulation(payload = {}) {
    return await request('/simulation', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async runWhatIfSimulation(payload = {}) {
    return await request('/simulation/what-if', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // AI Assistant deterministic responder
  async queryAIManager(prompt, context = {}) {
    return await request('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ prompt, context })
    });
  }
};
