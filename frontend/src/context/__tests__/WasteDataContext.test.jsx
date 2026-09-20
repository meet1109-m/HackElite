import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { WasteDataProvider, useWasteData } from '../WasteDataContext';
import { apiService } from '../../services/api';

describe('WasteDataContext - Operational State Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(apiService, 'getBins').mockResolvedValue([
      { bin_code: 'AHM-104', zone: 'Bodakdev', fill_percentage: 82.0, estimated_weight: 31.4, status: 'Filling', priority_score: 94 },
      { bin_code: 'AHM-156', zone: 'Bodakdev', fill_percentage: 60.0, estimated_weight: 24.0, status: 'Healthy', priority_score: 50 },
      { bin_code: 'AHM-105', zone: 'Bodakdev', fill_percentage: 40.0, estimated_weight: 16.0, status: 'Healthy', priority_score: 40 },
    ]);
    vi.spyOn(apiService, 'getVehicles').mockResolvedValue([
      { vehicle_code: 'V-01', capacity_kg: 2000, current_load: 1200, status: 'Available' }
    ]);
    vi.spyOn(apiService, 'recordTelemetry').mockResolvedValue({ status: 'Recorded' });
    vi.spyOn(apiService, 'updateBinStatus').mockResolvedValue({ status: 'Updated' });
    vi.spyOn(apiService, 'collectBin').mockResolvedValue({ status: 'Collected' });
    vi.spyOn(apiService, 'recalculatePriorities').mockResolvedValue([
      { bin_code: 'AHM-104', priority_score: 98 }
    ]);
  });

  const wrapper = ({ children }) => <WasteDataProvider>{children}</WasteDataProvider>;

  it('hydrates initial bins and fleet vehicles correctly', async () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    expect(result.current.bins).toBeDefined();
    expect(result.current.bins.length).toBeGreaterThan(0);
    expect(result.current.vehicles).toBeDefined();
    expect(result.current.vehicles.length).toBeGreaterThan(0);
  });

  it('simulateFillIncrease dispatches telemetry update and adjusts bin state', async () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    await act(async () => {
      result.current.simulateFillIncrease();
    });

    expect(apiService.recordTelemetry).toHaveBeenCalled();
    const updatedBin = result.current.bins.find(b => b.bin_code === 'AHM-104');
    expect(updatedBin.fill_percentage).toBeGreaterThanOrEqual(82.0);
  });

  it('simulateOverflowRisk sets emergency fill level on AHM-156 and AHM-104', async () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    await act(async () => {
      result.current.simulateOverflowRisk();
    });

    expect(apiService.recordTelemetry).toHaveBeenCalledWith('AHM-156', 96.0);
    const bin156 = result.current.bins.find(b => b.bin_code === 'AHM-156');
    expect(bin156.status).toBe('Critical');
    expect(bin156.fill_percentage).toBe(96.0);
  });

  it('simulateSensorOffline marks bins as offline and invokes updateBinStatus', async () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    await act(async () => {
      result.current.simulateSensorOffline();
    });

    expect(apiService.updateBinStatus).toHaveBeenCalledWith('AHM-105', 'Sensor Offline', expect.any(String));
    expect(result.current.bins.some(b => b.status === 'Sensor Offline')).toBe(true);
  });

  it('collectBin resets bin fill percentage to 0% and status to Healthy', async () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    await act(async () => {
      await result.current.collectBin('AHM-104', 'V-01');
    });

    expect(apiService.collectBin).toHaveBeenCalledWith('AHM-104', 'V-01');
    const collectedBin = result.current.bins.find(b => b.bin_code === 'AHM-104');
    expect(collectedBin.fill_percentage).toBe(0.0);
    expect(collectedBin.status).toBe('Healthy');
  });

  it('updatePriorityWeights dispatches recalculatePriorities with custom weights', async () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    const newWeights = {
      fill_weight: 40,
      overflow_weight: 30,
      stream_weight: 10,
      zone_weight: 10,
      gen_weight: 5,
      delay_weight: 3,
      freq_weight: 2
    };

    await act(async () => {
      await result.current.updatePriorityWeights(newWeights);
    });

    expect(apiService.recalculatePriorities).toHaveBeenCalledWith(newWeights);
  });

  it('toast notification system adds and dismisses notifications', () => {
    const { result } = renderHook(() => useWasteData(), { wrapper });

    act(() => {
      result.current.showToast('Test Toast Notification', 'info');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].message).toBe('Test Toast Notification');
    expect(result.current.toasts[0].type).toBe('info');

    act(() => {
      result.current.removeToast(result.current.toasts[0].id);
    });

    expect(result.current.toasts.length).toBe(0);
  });
});
