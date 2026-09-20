import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService, INITIAL_MOCK_BINS, INITIAL_MOCK_VEHICLES, INITIAL_MOCK_ZONES } from '../services/api';

const WasteDataContext = createContext();

export const WasteDataProvider = ({ children }) => {
  const [bins, setBins] = useState(INITIAL_MOCK_BINS);
  const [vehicles, setVehicles] = useState(INITIAL_MOCK_VEHICLES);
  const [zones, setZones] = useState(INITIAL_MOCK_ZONES);
  const [analytics, setAnalytics] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [environmentalImpact, setEnvironmentalImpact] = useState(null);
  
  // Backend Connection Health & Offline State
  const [backendConnected, setBackendConnected] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [offlineDemoMode, setOfflineDemoMode] = useState(false);

  // Selected Digital Twin Modal
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedDigitalTwin, setSelectedDigitalTwin] = useState(null);

  // Active Routing & Dynamic Replanning State
  const [activeRoute, setActiveRoute] = useState(null);
  const [routes, setRoutes] = useState({});
  const [replanState, setReplanState] = useState({
    isReplanned: false,
    originalDistance: 31.2,
    replannedDistance: 33.4,
    delta: 2.2,
    insertedBin: 'AHM-156',
    status: 'Emergency insertion ready'
  });

  // What-If Simulation Result
  const [simulationResult, setSimulationResult] = useState(null);

  // Priority Weights Config (7 Normalized Factors totaling 100%)
  const [priorityWeights, setPriorityWeights] = useState({
    fill_weight: 30,
    overflow_weight: 25,
    gen_weight: 15,
    stream_weight: 10,
    zone_weight: 10,
    freq_weight: 5,
    delay_weight: 5
  });

  // IoT Sensor Telemetry State
  const [iotStatus, setIotStatus] = useState({
    totalNodes: 120,
    activeNodes: 116,
    offlineNodes: 4,
    telemetryFrequencySec: 60,
    fillSensorHealthPct: 98.4,
    weightSensorHealthPct: 95.8,
    cameraHealthPct: 88.2,
    lastPing: 'Just now (1s ago)'
  });

  // Ahmedabad Event Mode & AI Bin Placement
  const [eventMode, setEventMode] = useState(null);
  const [binPlacements] = useState([
    {
      id: 'place-1',
      zone: 'Bodakdev (Zone E)',
      location_name: 'Sindhu Bhavan Road / Judges Bungalow Junction',
      latitude: 23.0396,
      longitude: 72.5065,
      distance_to_nearest_bin_m: 420,
      priority: 'HIGH',
      reason: 'Commercial dining and restaurant surge (+82%) produces recurring overflow during evening hours.'
    },
    {
      id: 'place-2',
      zone: 'Navrangpura (Zone B)',
      location_name: 'CG Road Municipal Market Junction',
      latitude: 23.0361,
      longitude: 72.5645,
      distance_to_nearest_bin_m: 380,
      priority: 'HIGH',
      reason: 'Retail unboxing packaging density exceeds current bin capacity by 37.7%.'
    },
    {
      id: 'place-3',
      zone: 'Vastrapur (Zone A)',
      location_name: 'Vastrapur Lake South Gate Amphitheatre',
      latitude: 23.0335,
      longitude: 72.5278,
      distance_to_nearest_bin_m: 460,
      priority: 'MEDIUM',
      reason: 'Food vendor concentration produces localized compostable surges in the evening.'
    }
  ]);

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  // AI Demo Modal State
  const [isAIDemoOpen, setIsAIDemoOpen] = useState(false);

  // Add toast helper
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch initial data from live backend
  const fetchData = useCallback(async (isRetry = false) => {
    setLoading(true);
    try {
      const [fetchedBins, fetchedVehicles, fetchedZones, fetchedAnalytics, fetchedHotspots, fetchedAnomalies, fetchedImpact, defaultRoute] = await Promise.all([
        apiService.getBins(),
        apiService.getVehicles(),
        apiService.getZones(),
        apiService.getAnalytics(),
        apiService.getHotspots().catch(() => []),
        apiService.getAnomalies().catch(() => []),
        apiService.getEnvironmentalImpact().catch(() => null),
        apiService.optimizeRoute({ vehicle_id: 'V-01' })
      ]);

      if (fetchedBins && fetchedBins.length > 0) setBins(fetchedBins);
      if (fetchedVehicles && fetchedVehicles.length > 0) setVehicles(fetchedVehicles);
      if (fetchedZones && fetchedZones.length > 0) setZones(fetchedZones);
      if (fetchedAnalytics) setAnalytics(fetchedAnalytics);
      if (fetchedHotspots && fetchedHotspots.length > 0) setHotspots(fetchedHotspots);
      if (fetchedAnomalies && fetchedAnomalies.length > 0) setAnomalies(fetchedAnomalies);
      if (fetchedImpact) setEnvironmentalImpact(fetchedImpact);
      if (defaultRoute) {
        setActiveRoute(defaultRoute);
        setRoutes({ 'V-01': defaultRoute });
      }
      setBackendConnected(true);
      setBackendError(null);
      if (isRetry) {
        showToast('✓ Connected to SmartBinX FastAPI backend.', 'success');
      }
    } catch (err) {
      console.error('[SmartBinX API Error]', err);
      setBackendConnected(false);
      setBackendError(err.message);
      showToast(`🚨 Backend Offline: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Digital Twin Modal Handlers
  const openDigitalTwin = useCallback((bin) => {
    setSelectedBin(bin);
    setSelectedDigitalTwin(bin);
  }, []);

  const closeDigitalTwin = useCallback(() => {
    setSelectedBin(null);
    setSelectedDigitalTwin(null);
  }, []);

  const selectBinById = useCallback((binId) => {
    const found = bins.find(b => b.id === binId || b.bin_code.toLowerCase() === binId.toLowerCase());
    if (found) {
      openDigitalTwin(found);
    }
  }, [bins, openDigitalTwin]);

  // Route Optimization
  const optimizeRoute = useCallback(async (vehicleId = 'V-01') => {
    setLoading(true);
    try {
      const res = await apiService.optimizeRoute({ vehicle_id: vehicleId });
      if (res) {
        setActiveRoute(res);
        setRoutes(prev => ({ ...prev, [vehicleId]: res }));
        showToast(`✓ Route for ${vehicleId} optimized: ${res.distance_km} km (${res.duration_minutes} min, ${res.collected_weight_kg} kg payload).`, 'success');
        return res;
      }
    } catch (err) {
      showToast(`Route Optimization Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
    return null;
  }, [showToast]);

  // Dynamic Route Replanning
  const triggerDynamicReplan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.replanRoute({ vehicle_id: 'V-01', urgent_bin: 'AHM-156' });
      if (res) {
        setReplanState({
          isReplanned: true,
          originalDistance: res.previous_distance_km || 31.2,
          replannedDistance: res.new_distance_km || 33.4,
          delta: res.delta_distance_km || 2.2,
          insertedBin: res.inserted_bin || 'AHM-156',
          status: 'AHM-156 successfully inserted into Stop #2'
        });
        setActiveRoute(res);
        setRoutes(prev => ({ ...prev, 'V-01': res }));
        showToast('✓ Dynamic Replan executed: AHM-156 inserted. Overflow averted.', 'success');
        return res;
      }
    } catch (err) {
      showToast(`Dynamic Replan Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
    return null;
  }, [showToast]);

  // Simulation Runner
  const runSimulation = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await apiService.runSimulation(params);
      if (res) {
        setSimulationResult(res);
        showToast('✓ What-If Simulation computed: Estimated impact updated.', 'info');
        return res;
      }
    } catch (err) {
      showToast(`Simulation Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
    return null;
  }, [showToast]);

  // Waste Vision Classifier
  const classifyWasteImage = useCallback(async (file, stream, sampleId) => {
    setLoading(true);
    try {
      let payload;
      if (file instanceof File) {
        payload = new FormData();
        payload.append('file', file);
        if (stream) payload.append('stream', stream);
        if (sampleId) payload.append('sampleId', sampleId);
      } else {
        payload = { stream, sampleId };
      }
      const res = await apiService.classifyWaste(payload);
      showToast(`✓ AI Waste Vision classification complete (${res.confidence_pct || (res.confidence * 100).toFixed(0)}% Confidence).`, 'success');
      return res;
    } catch (err) {
      showToast(`Classification Failed: ${err.message}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Priority Weights Updater with comprehensive 10-zone & multi-stream calculation
  const updatePriorityWeights = useCallback((newWeights) => {
    setPriorityWeights(newWeights);
    
    // Zone sensitivity factor mapping based on AMC baseline generation & surge data
    const zoneWeights = {
      'Bodakdev': 1.0,     // Top hotspot surge (+82%)
      'SG Highway': 0.95,   // High generation corridor (+32%)
      'Ashram Road': 0.90,  // Major arterial transit corridor
      'Navrangpura': 0.85,  // Commercial & institutional hub
      'Prahlad Nagar': 0.85,// High-density corporate hub
      'Maninagar': 0.80,    // High footfall residential/railway hub
      'Satellite': 0.75,    // Mixed commercial/residential
      'Vastrapur': 0.75,    // Lake food court & retail zone
      'Paldi': 0.70,        // Traditional residential corridor
      'Sabarmati': 0.70     // Riverfront corridor
    };

    // Stream sensitivity factor mapping
    const streamWeights = {
      'Organic': 1.0,       // Highest biological decay & methane urgency
      'Hazardous': 0.95,    // Immediate environmental safety risk
      'Recyclable': 0.75,   // Material recovery value
      'Mixed': 0.60         // Standard baseline
    };

    // Recalculate priority scores across all bins
    setBins(prevBins => prevBins.map(bin => {
      const fillPart = (bin.fill_percentage / 100) * (newWeights.fill_weight || 30);
      const overflowPart = Math.max(0, (24 - (bin.predicted_overflow_hours || 12)) / 24) * (newWeights.overflow_weight || 25);
      const genPart = Math.min(20, ((bin.avg_daily_generation_kg || 45) / 50) * (newWeights.gen_weight || 15));
      
      const streamFactor = Object.entries(streamWeights).find(([key]) => bin.waste_stream?.includes(key))?.[1] || 0.60;
      const streamPart = streamFactor * (newWeights.stream_weight || 10);

      const zoneFactor = Object.entries(zoneWeights).find(([key]) => bin.zone?.includes(key))?.[1] || 0.70;
      const zonePart = zoneFactor * (newWeights.zone_weight || 10);

      const freqPart = (newWeights.freq_weight || 5) * 0.7;
      const delayPart = (newWeights.delay_weight || 5) * 0.8;

      const totalRaw = fillPart + overflowPart + genPart + streamPart + zonePart + freqPart + delayPart;
      const newScore = Math.min(99, Math.max(15, Math.round(totalRaw)));
      
      const newStatus = newScore >= 85 ? 'Critical' : (newScore >= 70 ? 'High Priority' : (bin.fill_percentage >= 50 ? 'Filling' : 'Healthy'));
      
      return {
        ...bin,
        priority_score: newScore,
        status: newStatus
      };
    }));
    showToast('✓ Priority scoring weights updated and scores recalculated across 120 digital twins.', 'success');
  }, [showToast]);

  // Telemetry Simulation Functions (Connected to Backend)
  const simulateFillIncrease = useCallback(async () => {
    const targetCodes = ['AHM-104', 'AHM-118', 'AHM-156'];

    setBins(prevBins => prevBins.map(bin => {
      if (targetCodes.includes(bin.bin_code)) {
        const newFill = Math.min(100, Math.round(bin.fill_percentage + 12));
        const newWeight = Number(((bin.estimated_weight_kg || bin.estimated_weight || 30) * 1.15).toFixed(1));
        const newHours = Math.max(0.3, Number(((bin.predicted_overflow_hours || 4) * 0.6).toFixed(1)));
        return {
          ...bin,
          fill_percentage: newFill,
          current_fill: newFill,
          estimated_weight_kg: newWeight,
          estimated_weight: newWeight,
          predicted_overflow_hours: newHours,
          predicted_overflow_text: `${Math.floor(newHours)}h ${Math.round((newHours % 1) * 60)}m`,
          status: 'Critical',
          priority_score: Math.min(99, (bin.priority_score || 85) + 6)
        };
      }
      return bin;
    }));

    // Send real telemetry readings to backend to update SQLite and in-memory state
    try {
      await Promise.allSettled(
        targetCodes.map(code => {
          const bin = bins.find(b => b.bin_code === code);
          const newFill = Math.min(100, Math.round((bin?.fill_percentage || 80) + 12));
          const newWeight = Number(((bin?.estimated_weight_kg || bin?.estimated_weight || 30) * 1.15).toFixed(1));
          return apiService.recordTelemetry(code, newFill, newWeight);
        })
      );
    } catch (e) {
      console.warn('[WasteData] Backend telemetry sync:', e);
    }

    showToast('⚡ [Simulated Telemetry] Rapid fill increase injected (+12% on Bodakdev/Navrangpura nodes) and synchronized with backend.', 'warning');
  }, [bins, showToast]);

  const simulateOverflowRisk = useCallback(async () => {
    const targetCodes = ['AHM-156', 'AHM-104'];

    setBins(prevBins => prevBins.map(bin => {
      if (bin.status === 'Critical' || bin.priority_score >= 80 || targetCodes.includes(bin.bin_code)) {
        return {
          ...bin,
          fill_percentage: Math.max(bin.fill_percentage, 96),
          current_fill: Math.max(bin.fill_percentage, 96),
          predicted_overflow_hours: 0.5,
          predicted_overflow_text: '00h 30m',
          priority_score: 98,
          status: 'Critical'
        };
      }
      return bin;
    }));

    // Send emergency overflow telemetry to backend
    try {
      await Promise.allSettled(
        targetCodes.map(code => apiService.recordTelemetry(code, 96.0))
      );
    } catch (e) {
      console.warn('[WasteData] Backend overflow telemetry sync:', e);
    }

    showToast('🚨 [Simulated Telemetry] Imminent overflow surge triggered on critical nodes (<30m countdown) and synchronized with backend.', 'error');
  }, [showToast]);

  // Operational Bin Collection
  const collectBin = useCallback(async (binCode, vehicleCode = 'V-01') => {
    setLoading(true);
    try {
      const res = await apiService.collectBin(binCode, vehicleCode);
      setBins(prevBins => prevBins.map(bin => {
        if (bin.bin_code === binCode) {
          return {
            ...bin,
            fill_percentage: 0.0,
            current_fill: 0.0,
            estimated_weight_kg: 0.0,
            estimated_weight: 0.0,
            status: 'Healthy',
            priority_score: 15,
            predicted_overflow_hours: 24.0,
            predicted_overflow_text: '>24h',
            last_collection: 'Just now'
          };
        }
        return bin;
      }));
      showToast(`✓ Bin ${binCode} successfully collected by vehicle ${vehicleCode}. State reset to Healthy.`, 'success');
      // Refresh analytics in background
      apiService.getAnalytics().then(setAnalytics).catch(() => {});
      return res;
    } catch (err) {
      showToast(`Collection Failed: ${err.message}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const simulateSensorOffline = useCallback(() => {
    setIotStatus(prev => ({
      ...prev,
      activeNodes: 112,
      offlineNodes: 8,
      fillSensorHealthPct: 93.3
    }));
    setBins(prevBins => prevBins.map((bin, i) => {
      if (i === 4 || i === 5) {
        return {
          ...bin,
          status: 'Sensor Offline',
          sensor_offline: true
        };
      }
      return bin;
    }));
    showToast('⚠️ [Simulated Telemetry] 4 IoT nodes entered offline heartbeat warning state.', 'warning');
  }, [showToast]);

  const refreshTelemetry = useCallback(async () => {
    await fetchData();
    setIotStatus({
      totalNodes: 120,
      activeNodes: 116,
      offlineNodes: 4,
      telemetryFrequencySec: 60,
      fillSensorHealthPct: 98.4,
      weightSensorHealthPct: 95.8,
      cameraHealthPct: 88.2,
      lastPing: 'Just now (0s ago)'
    });
    showToast('✓ Telemetry reset to baseline AMC operational state.', 'info');
  }, [fetchData, showToast]);

  // Event Mode Toggle
  const toggleEventMode = useCallback((event) => {
    setEventMode(event);
    if (event) {
      showToast(`⚡ Event Mode Activated: ${event.name} (+${event.wasteSurgePct}% surge)`, 'warning');
    } else {
      showToast('✓ Event Mode Deactivated. Standard municipal baseline restored.', 'info');
    }
  }, [showToast]);

  // AI Assistant Query
  const queryAIAssistant = useCallback(async (prompt) => {
    return await apiService.queryAIManager(prompt, { bins, vehicles, zones, analytics });
  }, [bins, vehicles, zones, analytics]);

  // AI Demo Modal triggers
  const startAIDemo = useCallback(() => {
    setIsAIDemoOpen(true);
  }, []);

  const closeAIDemo = useCallback(() => {
    setIsAIDemoOpen(false);
  }, []);

  const toggleOfflineDemo = useCallback((enabled) => {
    const nextState = enabled !== undefined ? enabled : !offlineDemoMode;
    setOfflineDemoMode(nextState);
    if (nextState) {
      setBins(INITIAL_MOCK_BINS);
      setVehicles(INITIAL_MOCK_VEHICLES);
      setZones(INITIAL_MOCK_ZONES);
      showToast('⚠️ Switched to Offline Demo Mode (using local mock fixtures)', 'warning');
    } else {
      fetchData(true);
    }
  }, [offlineDemoMode, fetchData, showToast]);

  return (
    <WasteDataContext.Provider value={{
      bins,
      setBins,
      vehicles,
      zones,
      analytics,
      hotspots,
      anomalies,
      environmentalImpact,
      backendConnected,
      backendError,
      offlineDemoMode,
      setOfflineDemoMode,
      toggleOfflineDemo,
      selectedBin,
      setSelectedBin,
      selectedDigitalTwin,
      openDigitalTwin,
      closeDigitalTwin,
      selectBinById,
      activeRoute,
      setActiveRoute,
      routes,
      optimizeRoute,
      replanState,
      triggerDynamicReplan,
      simulationResult,
      runSimulation,
      priorityWeights,
      updatePriorityWeights,
      eventMode,
      toggleEventMode,
      binPlacements,
      classifyWasteImage,
      queryAIAssistant,
      toasts,
      showToast,
      removeToast,
      isAIDemoOpen,
      startAIDemo,
      closeAIDemo,
      loading,
      refreshData: fetchData,
      collectBin,
      iotStatus,
      setIotStatus,
      simulateFillIncrease,
      simulateOverflowRisk,
      simulateSensorOffline,
      refreshTelemetry
    }}>
      {children}
      
      {/* Global Toast Notification Container with high z-index above modals & maps */}
      <div className="fixed bottom-5 right-5 z-[2000] space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-white border-[#E3EAE6] text-[#17201B] shadow-xl';
          if (toast.type === 'warning') {
            bg = 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] shadow-xl';
          } else if (toast.type === 'error') {
            bg = 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] shadow-xl';
          } else if (toast.type === 'info') {
            bg = 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] shadow-xl';
          }

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold pointer-events-auto transition-all transform animate-fade-in ${bg}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${toast.type === 'warning' ? 'bg-[#E89A27]' : (toast.type === 'error' ? 'bg-[#D64545]' : 'bg-[#16845B]')}`} />
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-2"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </WasteDataContext.Provider>
  );
};

export const useWasteData = () => {
  const context = useContext(WasteDataContext);
  if (!context) {
    throw new Error('useWasteData must be used within a WasteDataProvider');
  }
  return context;
};
