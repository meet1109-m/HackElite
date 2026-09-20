import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WasteDataProvider } from '../../context/WasteDataContext';

// Mock react-leaflet to prevent Leaflet DOM measurement errors in jsdom
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="mock-map-container">{children}</div>,
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  Marker: ({ children }) => <div data-testid="mock-marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="mock-popup">{children}</div>,
  Polyline: () => <div data-testid="mock-polyline" />,
  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    invalidateSize: vi.fn(),
    getContainer: () => document.createElement('div'),
  }),
}));

// Mock recharts ResponsiveContainer to avoid 0-width in jsdom
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }) => <div data-testid="mock-responsive-container" style={{ width: 500, height: 300 }}>{children}</div>,
  };
});

import CommandCenterPage from '../CommandCenterPage';
import BinIntelligencePage from '../BinIntelligencePage';
import RouteOptimizerPage from '../RouteOptimizerPage';
import WasteVisionPage from '../WasteVisionPage';
import AnalyticsHotspotsPage from '../AnalyticsHotspotsPage';
import RecyclingIntelligencePage from '../RecyclingIntelligencePage';
import WhatIfSimulatorPage from '../WhatIfSimulatorPage';
import AIWasteManagerPage from '../AIWasteManagerPage';
import LandingPage from '../LandingPage';

describe('Smoke Tests - Core Application Views', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  const renderWithProviders = (ui) => {
    return render(
      <MemoryRouter>
        <WasteDataProvider>
          {ui}
        </WasteDataProvider>
      </MemoryRouter>
    );
  };

  it('renders CommandCenterPage without crashing', () => {
    renderWithProviders(<CommandCenterPage />);
    expect(screen.getAllByText(/Command Center/i).length).toBeGreaterThan(0);
  });

  it('renders BinIntelligencePage without crashing', () => {
    renderWithProviders(<BinIntelligencePage />);
    expect(screen.getAllByText(/Bin Intelligence/i).length).toBeGreaterThan(0);
  });

  it('renders RouteOptimizerPage without crashing', () => {
    renderWithProviders(<RouteOptimizerPage />);
    expect(screen.getAllByText(/Route Optimizer/i).length).toBeGreaterThan(0);
  });

  it('renders WasteVisionPage without crashing', () => {
    renderWithProviders(<WasteVisionPage />);
    expect(screen.getAllByText(/Waste Vision/i).length).toBeGreaterThan(0);
  });

  it('renders AnalyticsHotspotsPage without crashing', () => {
    renderWithProviders(<AnalyticsHotspotsPage />);
    expect(screen.getAllByText(/Analytics/i).length).toBeGreaterThan(0);
  });

  it('renders RecyclingIntelligencePage without crashing', () => {
    renderWithProviders(<RecyclingIntelligencePage />);
    expect(screen.getAllByText(/Recycling/i).length).toBeGreaterThan(0);
  });

  it('renders WhatIfSimulatorPage without crashing', () => {
    renderWithProviders(<WhatIfSimulatorPage />);
    expect(screen.getAllByText(/What-If/i).length).toBeGreaterThan(0);
  });

  it('renders AIWasteManagerPage without crashing', () => {
    renderWithProviders(<AIWasteManagerPage />);
    expect(screen.getAllByText(/AI Waste/i).length).toBeGreaterThan(0);
  });

  it('renders LandingPage without crashing', () => {
    renderWithProviders(<LandingPage onNavigate={vi.fn()} />);
    expect(screen.getAllByText(/SmartBinX/i).length).toBeGreaterThan(0);
  });
});
