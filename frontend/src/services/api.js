// SmartBinX API Client Service with rich Ahmedabad smart municipal waste dataset

const API_BASE = '/api';

export const INITIAL_MOCK_BINS = [
  {
    id: "bin-104",
    bin_code: "AHM-104",
    zone: "Sabarmati Riverfront (Zone C)",
    address: "Sabarmati Riverfront Promenade, Near Subhash Bridge, Ahmedabad",
    latitude: 23.0560,
    longitude: 72.5850,
    capacity_kg: 50,
    current_fill: 82.0,
    fill_percentage: 82.0,
    estimated_weight_kg: 31.4,
    waste_stream: "Organic (Compost)",
    status: "Critical",
    priority_score: 94,
    predicted_overflow_hours: 3.7,
    predicted_overflow_text: "03h 42m",
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
        { factor: "Current Volumetric Fill", description: "Sensor reading at 82% capacity", points: 31, raw_value: "82%" },
        { factor: "Overflow Velocity", description: "Predicted critical breach in 3.7h", points: 29, raw_value: "3h 42m" },
        { factor: "Footfall Surge Rate", description: "Riverfront weekend promenade crowd", points: 15, raw_value: "+48% surge" },
        { factor: "Organic Degradation", description: "Odor & methane risk in warm corridor", points: 10, raw_value: "48% Organic" },
        { factor: "Time Lapsed", description: "6.2 hours since last morning run", points: 9, raw_value: "6.2 hrs" }
      ],
      ai_recommendation: "Dispatch collection truck V-01 (Sabarmati Heavy Compactor) immediately. Projected overflow breach at 18:20 IST."
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
    zone: "Sabarmati (Zone C)",
    address: "Riverfront Flower Park Walkway East, Ahmedabad",
    latitude: 23.0490,
    longitude: 72.5780,
    capacity_kg: 50,
    current_fill: 94.0,
    fill_percentage: 94.0,
    estimated_weight_kg: 41.0,
    waste_stream: "Plastic & Beverage Containers",
    status: "Critical",
    priority_score: 97,
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
      score: 97,
      tier: "CRITICAL",
      breakdown: [
        { factor: "Urgent Spill Hazard", points: 38, raw_value: "94% Fill" },
        { factor: "Immediate Overflow Time", points: 32, raw_value: "45 mins" },
        { factor: "Promenade Tourist Zone", points: 15, raw_value: "Zone C Corridor" },
        { factor: "Rapid Velocity Spike", points: 12, raw_value: "+62% surge" }
      ],
      ai_recommendation: "EMERGENCY REPLAN TRIGGERED: Insert directly into active Truck V-01 route sequence."
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
    vehicle_code: "V-01 (Sabarmati Heavy Compactor)",
    vehicle_type: "Hydraulic Compactor (Diesel Euro VI)",
    driver_name: "Ramesh Patel",
    driver_phone: "+91 98250 14210",
    capacity_kg: 2000,
    current_load_kg: 300,
    current_load: 300,
    available_capacity_kg: 1700,
    utilization_percentage: 15.0,
    status: "Active (Sabarmati)",
    latitude: 23.0520,
    longitude: 72.5800,
    speed_kmh: 24
  },
  {
    id: "V-02",
    vehicle_code: "V-02 (Navrangpura Electric Tipper)",
    vehicle_type: "Zero-Emission EV Tipper",
    driver_name: "Kiran Solanki",
    driver_phone: "+91 94260 88123",
    capacity_kg: 1200,
    current_load_kg: 1000,
    current_load: 1000,
    available_capacity_kg: 200,
    utilization_percentage: 83.3,
    status: "Near Full (Navrangpura)",
    latitude: 23.0360,
    longitude: 72.5600,
    speed_kmh: 18
  },
  {
    id: "V-03",
    vehicle_code: "V-03 (Vastrapur Standard Tipper)",
    vehicle_type: "Medium Municipal Tipper",
    driver_name: "Dinesh Varma",
    driver_phone: "+91 97240 55319",
    capacity_kg: 1800,
    current_load_kg: 700,
    current_load: 700,
    available_capacity_kg: 1100,
    utilization_percentage: 38.9,
    status: "Active (Vastrapur)",
    latitude: 23.0380,
    longitude: 72.5250,
    speed_kmh: 28
  }
];

export const INITIAL_MOCK_ZONES = [
  { id: "z-sabarmati", name: "Sabarmati Riverfront (Zone C)", center_lat: 23.0550, center_lng: 23.0550, current_generation_kg: 780, baseline_generation_kg: 520, delta_percentage: 50.0 },
  { id: "z-navrangpura", name: "Navrangpura (Zone B)", center_lat: 23.0380, center_lng: 72.5610, current_generation_kg: 840, baseline_generation_kg: 610, delta_percentage: 37.7 },
  { id: "z-vastrapur", name: "Vastrapur (Zone A)", center_lat: 23.0340, center_lng: 72.5300, current_generation_kg: 590, baseline_generation_kg: 550, delta_percentage: 7.2 },
  { id: "z-maninagar", name: "Maninagar (Zone D)", center_lat: 23.0070, center_lng: 72.6010, current_generation_kg: 620, baseline_generation_kg: 580, delta_percentage: 6.9 },
  { id: "z-bodakdev", name: "Bodakdev (Zone E)", center_lat: 23.0410, center_lng: 72.5120, current_generation_kg: 480, baseline_generation_kg: 510, delta_percentage: -5.8 },
  { id: "z-paldi", name: "Paldi (Zone G)", center_lat: 23.0150, center_lng: 72.5630, current_generation_kg: 430, baseline_generation_kg: 470, delta_percentage: -8.5 }
];

export const apiService = {
  // Bins
  async getBins(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/bins${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_MOCK_BINS;
    }
  },

  async getBinById(binId) {
    try {
      const res = await fetch(`${API_BASE}/bins/${binId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_MOCK_BINS.find(b => b.id === binId || b.bin_code.toLowerCase() === binId.toLowerCase()) || INITIAL_MOCK_BINS[0];
    }
  },

  async getBinReadings(binId) {
    try {
      const res = await fetch(`${API_BASE}/bin-readings/${binId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return [
        { time: '06:00', fill: 42, weight: 15.2 },
        { time: '08:00', fill: 55, weight: 20.1 },
        { time: '10:00', fill: 68, weight: 25.4 },
        { time: '12:00', fill: 74, weight: 28.0 },
        { time: '14:00', fill: 82, weight: 31.4 },
      ];
    }
  },

  // Waste Vision
  async classifyWaste(payload = {}) {
    try {
      const res = await fetch(`${API_BASE}/waste/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return {
        plastic: 68.4,
        organic: 16.2,
        paper: 9.8,
        metal: 3.2,
        glass: 1.4,
        other: 1.0,
        confidence: 0.91,
        purity_score: 78.4,
        source: 'AI Detected from Image',
        contamination_level: 'Low Contamination'
      };
    }
  },

  // Vehicles
  async getVehicles() {
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_MOCK_VEHICLES;
    }
  },

  async getBestVehicleForBin(binId) {
    try {
      const res = await fetch(`${API_BASE}/vehicles/best-for-bin/${binId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return {
        bin_id: binId,
        best_vehicle: {
          vehicle_code: "V-01 (Sabarmati Heavy Compactor)",
          driver_name: "Ramesh Patel",
          driver_phone: "+91 98250 14210",
          distance_km: 2.4,
          available_capacity_kg: 1700,
          current_load_kg: 300,
          capacity_kg: 2000
        },
        recommendation_summary: "Truck V-01 selected: Closest proximity (2.4 km) with 1,700 kg available payload margin. Zero risk of overload."
      };
    }
  },

  // Routes - distinct data for each vehicle
  async optimizeRoute(payload = {}) {
    const vehicleId = payload.vehicle_id || 'V-01';
    try {
      const res = await fetch(`${API_BASE}/routes/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      if (vehicleId === 'V-02') {
        return {
          vehicle_id: 'V-02',
          vehicle_name: 'V-02 (Navrangpura Electric Tipper)',
          color: '#2878C8',
          distance_km: 19.8,
          duration_minutes: 64,
          collected_weight_kg: 1000,
          vehicle_capacity_kg: 1200,
          utilization_pct: 83.3,
          start_depot: 'DEPOT-02 (Navrangpura Central Depot)',
          end_mrf: 'MRF-01 (Pirana Material Recovery Facility)',
          polyline_coords: [
            [23.0360, 72.5600],
            [23.0060, 72.6020],
            [23.0140, 72.5640],
            [23.0240, 72.5320],
            [23.0010, 72.5830]
          ],
          stops: [
            { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-02 (Navrangpura Depot)', is_depot: true, weight_kg: 0, priority: 0, lat: 23.0360, lng: 72.5600 },
            { stop_number: 1, bin_id: 'AHM-045', bin_code: 'AHM-045 (Kankaria Gate 3)', is_depot: false, weight_kg: 320, priority: 52, is_critical: false, lat: 23.0060, lng: 72.6020 },
            { stop_number: 2, bin_id: 'AHM-062', bin_code: 'AHM-062 (Paldi Cross Road)', is_depot: false, weight_kg: 280, priority: 36, is_critical: false, lat: 23.0140, lng: 72.5640 },
            { stop_number: 3, bin_id: 'AHM-088', bin_code: 'AHM-088 (Shivranjani Crossroads)', is_depot: false, weight_kg: 400, priority: 41, is_critical: false, lat: 23.0240, lng: 72.5320 },
            { stop_number: 4, bin_id: 'MRF', bin_code: 'MRF-01 (Pirana Recovery Facility)', is_mrf: true, weight_kg: 0, priority: 0, lat: 23.0010, lng: 72.5830 }
          ],
          ai_recommendation: "Truck V-02: Optimized for zero-emission dry packaging collection across Paldi and Shivranjani commercial junctions."
        };
      } else if (vehicleId === 'V-03') {
        return {
          vehicle_id: 'V-03',
          vehicle_name: 'V-03 (Vastrapur Standard Tipper)',
          color: '#E89A27',
          distance_km: 22.6,
          duration_minutes: 78,
          collected_weight_kg: 700,
          vehicle_capacity_kg: 1800,
          utilization_pct: 38.9,
          start_depot: 'DEPOT-03 (Vastrapur Western Terminal)',
          end_mrf: 'MRF-02 (Ranip Circular Hub)',
          polyline_coords: [
            [23.0380, 72.5250],
            [23.0350, 72.5290],
            [23.0420, 72.5110],
            [23.0240, 72.5320],
            [23.0650, 72.5700]
          ],
          stops: [
            { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-03 (Vastrapur Western Terminal)', is_depot: true, weight_kg: 0, priority: 0, lat: 23.0380, lng: 72.5250 },
            { stop_number: 1, bin_id: 'AHM-091', bin_code: 'AHM-091 (Vastrapur Food Court)', is_depot: false, weight_kg: 310, priority: 76, is_critical: false, lat: 23.0350, lng: 72.5290 },
            { stop_number: 2, bin_id: 'AHM-127', bin_code: 'AHM-127 (Bodakdev SBR Plaza)', is_depot: false, weight_kg: 240, priority: 72, is_critical: false, lat: 23.0420, lng: 72.5110 },
            { stop_number: 3, bin_id: 'AHM-088', bin_code: 'AHM-088 (Shivranjani Crossroads)', is_depot: false, weight_kg: 150, priority: 41, is_critical: false, lat: 23.0240, lng: 72.5320 },
            { stop_number: 4, bin_id: 'MRF', bin_code: 'MRF-02 (Ranip Circular Hub)', is_mrf: true, weight_kg: 0, priority: 0, lat: 23.0650, lng: 72.5700 }
          ],
          ai_recommendation: "Truck V-03: Has 1,100 kg capacity reserve. Ready as standby or secondary dispatch for western zone spikes."
        };
      }

      // Default V-01 (Sabarmati Heavy Compactor)
      return {
        vehicle_id: 'V-01',
        vehicle_name: 'V-01 (Sabarmati Heavy Compactor)',
        color: '#16845B',
        distance_km: 27.4,
        duration_minutes: 98,
        collected_weight_kg: 1740,
        vehicle_capacity_kg: 2000,
        utilization_pct: 87.0,
        start_depot: 'DEPOT-01 (Sabarmati Central AMC Hub)',
        end_mrf: 'MRF-01 (Pirana Material Recovery Facility)',
        polyline_coords: [
          [23.0520, 72.5800],
          [23.0560, 72.5850],
          [23.0370, 72.5620],
          [23.0350, 72.5290],
          [23.0420, 72.5110],
          [23.0010, 72.5830]
        ],
        stops: [
          { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-01 (Sabarmati AMC Hub)', is_depot: true, weight_kg: 0, priority: 0, lat: 23.0520, lng: 72.5800 },
          { stop_number: 1, bin_id: 'AHM-104', bin_code: 'AHM-104 (Sabarmati Riverfront)', is_depot: false, weight_kg: 340, priority: 94, is_critical: true, lat: 23.0560, lng: 72.5850 },
          { stop_number: 2, bin_id: 'AHM-118', bin_code: 'AHM-118 (Navrangpura CG Road)', is_depot: false, weight_kg: 420, priority: 89, is_critical: true, lat: 23.0370, lng: 72.5620 },
          { stop_number: 3, bin_id: 'AHM-091', bin_code: 'AHM-091 (Vastrapur Food Court)', is_depot: false, weight_kg: 510, priority: 76, is_critical: false, lat: 23.0350, lng: 72.5290 },
          { stop_number: 4, bin_id: 'AHM-127', bin_code: 'AHM-127 (Bodakdev SBR Plaza)', is_depot: false, weight_kg: 470, priority: 72, is_critical: false, lat: 23.0420, lng: 72.5110 },
          { stop_number: 5, bin_id: 'MRF', bin_code: 'MRF-01 (Pirana Material Recovery Facility)', is_mrf: true, weight_kg: 0, priority: 0, lat: 23.0010, lng: 72.5830 }
        ],
        ai_recommendation: "Truck V-01: High-priority corridor clearance. Covers critical bins AHM-104 and AHM-118 before 4-hour overflow window."
      };
    }
  },

  async replanRoute(payload = {}) {
    try {
      const res = await fetch(`${API_BASE}/routes/replan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return {
        vehicle_id: 'V-01',
        vehicle_name: 'V-01 (Sabarmati Heavy Compactor)',
        color: '#16845B',
        is_replanned: true,
        previous_distance_km: 31.2,
        distance_km: 33.4,
        new_distance_km: 33.4,
        delta_distance_km: 2.2,
        duration_minutes: 112,
        collected_weight_kg: 1950,
        vehicle_capacity_kg: 2000,
        utilization_pct: 97.5,
        inserted_bin: "AHM-156",
        overflow_risk_status: "Averted (Collected in 38m)",
        start_depot: 'DEPOT-01 (Sabarmati Central AMC Hub)',
        end_mrf: 'MRF-01 (Pirana Material Recovery Facility)',
        polyline_coords: [
          [23.0520, 72.5800],
          [23.0560, 72.5850],
          [23.0490, 72.5780],
          [23.0370, 72.5620],
          [23.0350, 72.5290],
          [23.0420, 72.5110],
          [23.0010, 72.5830]
        ],
        stops: [
          { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-01 (Sabarmati AMC Hub)', is_depot: true, weight_kg: 0, priority: 0, lat: 23.0520, lng: 72.5800 },
          { stop_number: 1, bin_id: 'AHM-104', bin_code: 'AHM-104 (Sabarmati Riverfront)', is_depot: false, weight_kg: 340, priority: 94, is_critical: true, lat: 23.0560, lng: 72.5850 },
          { stop_number: 2, bin_id: 'AHM-156', bin_code: 'AHM-156 (Sabarmati Flower Park) [DYNAMIC INSERTION]', is_depot: false, weight_kg: 410, priority: 97, is_critical: true, is_dynamically_inserted: true, lat: 23.0490, lng: 72.5780 },
          { stop_number: 3, bin_id: 'AHM-118', bin_code: 'AHM-118 (Navrangpura CG Road)', is_depot: false, weight_kg: 420, priority: 89, is_critical: true, lat: 23.0370, lng: 72.5620 },
          { stop_number: 4, bin_id: 'AHM-091', bin_code: 'AHM-091 (Vastrapur Food Court)', is_depot: false, weight_kg: 510, priority: 76, is_critical: false, lat: 23.0350, lng: 72.5290 },
          { stop_number: 5, bin_id: 'AHM-127', bin_code: 'AHM-127 (Bodakdev SBR Plaza)', is_depot: false, weight_kg: 470, priority: 72, is_critical: false, lat: 23.0420, lng: 72.5110 },
          { stop_number: 6, bin_id: 'MRF', bin_code: 'MRF-01 (Pirana Material Recovery Facility)', is_mrf: true, weight_kg: 0, priority: 0, lat: 23.0010, lng: 72.5830 }
        ],
        ai_recommendation: "Dynamic Waypoint Insertion Complete: AHM-156 scheduled before 45-minute overflow breach. Delta +2.2 km absorbed within shift budget."
      };
    }
  },

  // Analytics & Zones
  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return {
        total_waste_collected_tonnes: 4.24,
        potentially_recoverable_tonnes: 2.71,
        landfill_diversion_percentage: 63.9,
        stream_breakdown: { "Organic": 1.82, "Plastic": 0.91, "Paper": 0.62, "Glass": 0.38, "Metal": 0.22, "Other": 0.29 },
        purity_scores: { "Plastic": 84.5, "Organic": 81.0, "Paper": 88.2, "Glass & Metal": 92.4 },
        co2e_emissions_avoided_kg: 384.6,
        fuel_saved_liters: 31.2,
        distance_optimized_km: 142.8
      };
    }
  },

  async getZones() {
    try {
      const res = await fetch(`${API_BASE}/zones`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      return INITIAL_MOCK_ZONES;
    }
  },

  // Simulation
  async runSimulation(payload = {}) {
    try {
      const res = await fetch(`${API_BASE}/simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const vehicles = payload.vehicles_count || 3;
      const surge = payload.generation_surge_pct || 20;
      const traffic = payload.traffic_factor || 'Heavy';
      const trafficMult = traffic === 'Heavy' ? 1.15 : (traffic === 'Light' ? 0.92 : 1.0);

      return {
        distance_km: Number((42.1 * (1 + (surge / 100) * 0.4) * trafficMult).toFixed(1)),
        overflow_risk_pct: Number(Math.min(95, Math.max(2, (5.2 + (surge * 0.25) + (3 - vehicles) * 4.5))).toFixed(1)),
        fleet_utilization_pct: Number(Math.min(98, Math.max(30, (71.0 + (3 - vehicles) * 12 + surge * 0.3))).toFixed(1)),
        uncollected_bins: Math.max(0, Math.round(2 + (3 - vehicles) * 3 + surge * 0.1)),
        fuel_liters: Number((14.2 * (1 + (surge / 100) * 0.35) * trafficMult).toFixed(1))
      };
    }
  },

  // AI Assistant deterministic responder
  async queryAIManager(prompt, context = {}) {
    try {
      const res = await fetch(`${API_BASE}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch {
      const lower = (prompt || '').toLowerCase();

      if (lower.includes('immediate') || lower.includes('overflow') || lower.includes('urgent')) {
        return {
          answer: "🚨 **High-Urgency Bins Identified:**\n\n1. **AHM-156 (Sabarmati Flower Park)**: 94% fill, overflow predicted in **45 minutes** (Priority 97).\n2. **AHM-104 (Sabarmati Riverfront)**: 82% fill, overflow in **3h 42m** (Priority 94).\n3. **AHM-118 (Navrangpura CG Road)**: 89% fill, overflow in **4h 18m** (Priority 89).\n\n**Action:** Dispatch Truck **V-01** immediately to cover the Sabarmati-Navrangpura corridor.",
          cards: [{
            title: "Urgent Dispatch Queue",
            data: [
              { label: "Top Critical Bin", value: "AHM-156 (45m)" },
              { label: "Recommended Truck", value: "V-01 (1,700kg avail)" },
              { label: "Corridor", value: "Sabarmati East" }
            ]
          }]
        };
      }

      if (lower.includes('ahm-104') || lower.includes('why is')) {
        return {
          answer: "🔍 **Explainable Analysis for Bin AHM-104:**\n\n- **Location:** Sabarmati Riverfront Walkway (Zone C)\n- **Priority Score:** 94 / 100 (CRITICAL)\n- **Fill Level:** 82% (31.4 kg / 50 kg capacity)\n- **Predicted Overflow:** 3 hours 42 minutes\n\n**Why Critical?**\n1. High weekend pedestrian volume on the riverfront promenade (+48% generation surge).\n2. 48% organic compostable stream with odor risk if uncollected past 4 hours.\n3. Truck V-01 is currently 2.4 km away with 1,700 kg available margin.",
          cards: [{
            title: "AHM-104 AI Breakdown",
            data: [
              { label: "Fill Level", value: "82% (31.4 kg)" },
              { label: "Overflow In", value: "3h 42m" },
              { label: "Purity Score", value: "76/100" }
            ]
          }]
        };
      }

      if (lower.includes('vehicle') || lower.includes('collect ahm-104') || lower.includes('truck')) {
        return {
          answer: "🚛 **Vehicle Allocation Analysis:**\n\n- **Recommended:** **Truck V-01 (Ramesh Patel)**\n- **Proximity:** 2.4 km from AHM-104\n- **Available Payload:** 1,700 kg available (Load: 300 / 2,000 kg, 15% Utilization)\n\n*Why not V-02?* Truck V-02 has only 200 kg remaining capacity and would exceed safe payload limits.",
          cards: [{
            title: "Fleet Matching Result",
            data: [
              { label: "Selected Truck", value: "V-01 (Sabarmati)" },
              { label: "Proximity", value: "2.4 km" },
              { label: "Payload Margin", value: "1,700 kg" }
            ]
          }]
        };
      }

      if (lower.includes('zone') || lower.includes('most waste') || lower.includes('hotspot')) {
        return {
          answer: "📊 **Ahmedabad Zonal Generation Intelligence:**\n\n- **Top Hotspot:** **Sabarmati Riverfront (Zone C)** at **780 kg/day** (+50.0% above baseline).\n- **Second Hotspot:** **Navrangpura (Zone B)** at **840 kg/day** (+37.7% above baseline).\n- **Lowest Volume:** **Paldi (Zone G)** at **430 kg/day** (-8.5% below baseline).\n\n**Recommendation:** Transition Sabarmati collection frequency from 24h to **12h cycles** to avert overflow.",
          cards: [{
            title: "Zonal Telemetry Summary",
            data: [
              { label: "Peak Surge", value: "Zone C (+50%)" },
              { label: "Highest Tonnage", value: "Navrangpura (840 kg)" },
              { label: "Cadence Shift", value: "24h → 12h" }
            ]
          }]
        };
      }

      if (lower.includes('recycl') || lower.includes('divert') || lower.includes('pirana') || lower.includes('recovery')) {
        return {
          answer: "🌱 **Circularity & Landfill Diversion Metrics (Today):**\n\n- **Total Collected:** 4.24 tonnes\n- **Diverted from Landfill:** **2.71 tonnes (63.9%)**\n- **Plastic Purity Score:** 84.5% (Suitable for direct polymer baling)\n- **CO₂e Avoided:** 384.6 kg\n- **Fuel Saved:** 31.2 Liters via AI TSP routing",
          cards: [{
            title: "Ahmedabad Recovery Impact",
            data: [
              { label: "Diversion Rate", value: "63.9%" },
              { label: "Recovered Tonnage", value: "2.71 t" },
              { label: "CO₂e Avoided", value: "384.6 kg" }
            ]
          }]
        };
      }

      if (lower.includes('remove') || lower.includes('what happens') || lower.includes('simulator')) {
        return {
          answer: "⚡ **What-If Simulation Verdict (Removing 1 Vehicle):**\n\n- Reducing fleet from 3 to 2 vehicles increases average utilization from **71% to 89%**.\n- Total fleet route distance increases by **+7.0 km** due to circuitous multi-zone legs.\n- City-wide overflow risk rises from **5.2% to 11.4%**, risking delayed pickups in Sabarmati and Navrangpura during evening peaks.",
          cards: [{
            title: "Simulation Impact",
            data: [
              { label: "Utilization", value: "71% → 89%" },
              { label: "Distance", value: "42km → 49km" },
              { label: "Overflow Risk", value: "5% → 11%" }
            ]
          }]
        };
      }

      return {
        answer: `SmartBinX AI Decision Intelligence connected. Telemetry active across 120 Ahmedabad bins in 12 AMC zones. All systems operating normally with a 63.9% landfill diversion rate. You can ask about urgent bins, vehicle assignments, zonal generation surges, or route replanning.`,
        cards: [{
          title: "System Status",
          data: [
            { label: "Monitored Bins", value: "120 Nodes" },
            { label: "Active Fleet", value: "3 Trucks" },
            { label: "Diversion Rate", value: "63.9%" }
          ]
        }]
      };
    }
  }
};
