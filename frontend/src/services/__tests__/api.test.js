import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../api';

describe('apiService - Frontend API & Auth Service', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Authentication Lifecycle', () => {
    it('login stores access token, auth flag, and user profile in sessionStorage', async () => {
      const mockResponse = {
        access_token: 'mock-jwt-token-xyz-123',
        token_type: 'bearer',
        expires_in: 86400,
        user: {
          id: 'user-001',
          email: 'amc-admin@ahmedabadcity.gov.in',
          username: 'amc_admin',
          full_name: 'AMC Administrator',
          role: 'AMC Operations',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const res = await apiService.login({
        email_or_username: 'amc-admin@ahmedabadcity.gov.in',
        password: '8821',
      });

      expect(res.access_token).toBe('mock-jwt-token-xyz-123');
      expect(window.sessionStorage.getItem('smartbinx_token')).toBe('mock-jwt-token-xyz-123');
      expect(window.sessionStorage.getItem('smartbinx_auth')).toBe('true');
      expect(JSON.parse(window.sessionStorage.getItem('smartbinx_user'))).toEqual(mockResponse.user);
    });

    it('logout completely removes token and session metadata from sessionStorage', () => {
      window.sessionStorage.setItem('smartbinx_token', 'test-token');
      window.sessionStorage.setItem('smartbinx_auth', 'true');
      window.sessionStorage.setItem('smartbinx_user', JSON.stringify({ role: 'Admin' }));

      apiService.logout();

      expect(window.sessionStorage.getItem('smartbinx_token')).toBeNull();
      expect(window.sessionStorage.getItem('smartbinx_auth')).toBeNull();
      expect(window.sessionStorage.getItem('smartbinx_user')).toBeNull();
    });

    it('injects Authorization Bearer token header into outgoing requests', async () => {
      window.sessionStorage.setItem('smartbinx_token', 'signed-bearer-token');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ bin_code: 'AHM-104' }],
      });

      await apiService.getBins();

      expect(global.fetch).toHaveBeenCalled();
      const headers = global.fetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer signed-bearer-token');
    });
  });

  describe('Core Waste & Fleet Operational Endpoints', () => {
    it('getBins returns bin list from server or fallback', async () => {
      const mockBins = [
        { bin_code: 'AHM-104', zone: 'Bodakdev', fill_percentage: 82.0 },
        { bin_code: 'AHM-118', zone: 'Navrangpura', fill_percentage: 88.0 },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockBins,
      });

      const bins = await apiService.getBins();
      expect(bins).toHaveLength(2);
      expect(bins[0].bin_code).toBe('AHM-104');
    });

    it('recordTelemetry dispatches fillPercentage and weight to /api/bins/{code}/telemetry', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Recorded', bin_code: 'AHM-104', fill_percentage: 90.0 }),
      });

      const result = await apiService.recordTelemetry('AHM-104', 90.0, 36.0);
      expect(global.fetch).toHaveBeenCalled();
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/api/bins/AHM-104/telemetry');
      expect(url).toContain('fill_percentage=90');
      expect(options.method).toBe('POST');
      expect(result.bin_code).toBe('AHM-104');
    });

    it('updateBinStatus dispatches status update and alert logging to /api/bins/{code}/status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Updated', bin_code: 'AHM-104', new_status: 'Sensor Offline' }),
      });

      const result = await apiService.updateBinStatus('AHM-104', 'Sensor Offline', 'Battery dead');
      expect(global.fetch).toHaveBeenCalled();
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/api/bins/AHM-104/status');
      expect(url).toContain('status=Sensor+Offline');
      expect(options.method).toBe('POST');
    });

    it('collectBin dispatches collection event to /api/bins/{code}/collect', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Collected', bin_code: 'AHM-104', vehicle_code: 'V-01' }),
      });

      const result = await apiService.collectBin('AHM-104', 'V-01');
      expect(global.fetch).toHaveBeenCalled();
      const [url] = global.fetch.mock.calls[0];
      expect(url).toContain('/api/bins/AHM-104/collect');
      expect(url).toContain('vehicle_code=V-01');
    });

    it('recalculatePriorities posts custom weight configuration', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ bin_code: 'AHM-104', priority_score: 95 }],
      });

      const weights = { fill_weight: 0.5, overflow_weight: 0.3 };
      await apiService.recalculatePriorities(weights);

      expect(global.fetch).toHaveBeenCalled();
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/api/bins/priority/recalculate');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual(weights);
    });

    it('classifyWasteImage sends multipart FormData when given a File or Blob', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          dominant_material: 'Plastic',
          confidence_pct: 94.0,
          source: 'AI Detected from Image',
        }),
      });

      const mockFile = new Blob(['fake image bytes'], { type: 'image/jpeg' });
      const res = await apiService.classifyWasteImage(mockFile);

      expect(global.fetch).toHaveBeenCalled();
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toContain('/api/waste/classify');
      expect(options.method).toBe('POST');
      expect(options.body).toBeInstanceOf(FormData);
      expect(res.dominant_material).toBe('Plastic');
    });
  });
});
