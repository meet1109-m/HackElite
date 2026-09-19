import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const WasteDataContext = createContext();

export const WasteDataProvider = ({ children }) => {
  const [bins, setBins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [zones, setZones] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [replannedComparison, setReplannedComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Weights configuration
  const [weights, setWeights] = useState({
    fill: 0.35,
    overflow: 0.30,
    stream: 0.15,
    location: 0.10,
    generation: 0.10
  });

  // Event & Festival Mode
  const [activeEvent, setActiveEvent] = useState(null);

  // Scripted 10-Step AI Demo Mode
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedBins, fetchedVehicles, fetchedZones, fetchedAnalytics] = await Promise.all([
        apiService.getBins(),
        apiService.getVehicles(),
        apiService.getZones(),
        apiService.getAnalytics()
      ]);
      setBins(fetchedBins || []);
      setVehicles(fetchedVehicles || []);
      setZones(fetchedZones || []);
      setAnalytics(fetchedAnalytics || null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectBinById = async (binId) => {
    const found = bins.find(b => b.id === binId || b.bin_code.toLowerCase() === binId.toLowerCase());
    if (found) {
      setSelectedBin(found);
    } else {
      const b = await apiService.getBinById(binId);
      if (b) setSelectedBin(b);
    }
  };

  const closeBinModal = () => {
    setSelectedBin(null);
  };

  const updateWeights = async (newWeights) => {
    setWeights(newWeights);
    const res = await apiService.recalculatePriorities(newWeights);
    if (res) {
      await fetchData();
    }
  };

  // Start 10-Step AI Demo
  const startAIDemo = () => {
    setIsDemoModalOpen(true);
    setDemoStep(1);
    setIsDemoPlaying(true);
  };

  const nextDemoStep = () => {
    setDemoStep(prev => Math.min(10, prev + 1));
  };

  const prevDemoStep = () => {
    setDemoStep(prev => Math.max(1, prev - 1));
  };

  const resetDemo = () => {
    setDemoStep(1);
    setIsDemoPlaying(false);
    setIsDemoModalOpen(false);
  };

  return (
    <WasteDataContext.Provider value={{
      bins,
      vehicles,
      zones,
      analytics,
      selectedBin,
      setSelectedBin,
      selectBinById,
      closeBinModal,
      activeRoute,
      setActiveRoute,
      replannedComparison,
      setReplannedComparison,
      weights,
      updateWeights,
      activeEvent,
      setActiveEvent,
      loading,
      refreshData: fetchData,
      isDemoModalOpen,
      setIsDemoModalOpen,
      demoStep,
      setDemoStep,
      isDemoPlaying,
      setIsDemoPlaying,
      startAIDemo,
      nextDemoStep,
      prevDemoStep,
      resetDemo
    }}>
      {children}
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
