import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { apiService } from '../services/api';

describe('App - Routing, Authentication Guard & Navigation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    window.location.hash = '';
    window.history.pushState({}, 'Test', '/');
    vi.spyOn(apiService, 'getBins').mockResolvedValue([]);
    vi.spyOn(apiService, 'getVehicles').mockResolvedValue([]);
    vi.spyOn(apiService, 'getZones').mockResolvedValue([]);
    vi.spyOn(apiService, 'getAnalytics').mockResolvedValue(null);
    vi.spyOn(apiService, 'optimizeRoute').mockResolvedValue(null);
  });

  it('redirects unauthenticated users to /login when attempting to access /command-center', async () => {
    window.history.pushState({}, 'Command Center', '/command-center');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
    });
  });

  it('allows authenticated users with valid token to access protected routes', async () => {
    window.sessionStorage.setItem('smartbinx_auth', 'true');
    window.sessionStorage.setItem('smartbinx_token', 'valid-mock-token');
    window.sessionStorage.setItem('smartbinx_user', JSON.stringify({
      email: 'amc-admin@ahmedabadcity.gov.in',
      role: 'AMC Operations'
    }));

    window.history.pushState({}, 'Command Center', '/command-center');

    render(<App />);

    await waitFor(() => {
      // Navbar or AppLayout elements should be present
      expect(screen.getAllByText(/SmartBinX/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Ahmedabad AI/i).length).toBeGreaterThan(0);
    });
  });

  it('migrates legacy hash route (/#command-center) to standard URL path', async () => {
    window.sessionStorage.setItem('smartbinx_auth', 'true');
    window.sessionStorage.setItem('smartbinx_token', 'valid-mock-token');
    window.location.hash = '#command-center';

    render(<App />);

    await waitFor(() => {
      expect(window.location.hash).toBe('');
    });
  });
});
