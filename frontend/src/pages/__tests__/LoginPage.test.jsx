import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';
import { WasteDataProvider } from '../../context/WasteDataContext';
import { apiService } from '../../services/api';

describe('LoginPage - Component & Authentication Validation Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    // Mock getZones/getBins to prevent unhandled rejected promises in WasteDataProvider
    vi.spyOn(apiService, 'getBins').mockResolvedValue([]);
    vi.spyOn(apiService, 'getVehicles').mockResolvedValue([]);
    vi.spyOn(apiService, 'getZones').mockResolvedValue([]);
    vi.spyOn(apiService, 'getAnalytics').mockResolvedValue(null);
  });

  const renderLoginPage = (props = {}) => {
    return render(
      <WasteDataProvider>
        <LoginPage onLoginSuccess={vi.fn()} onNavigate={vi.fn()} {...props} />
      </WasteDataProvider>
    );
  };

  it('renders login form with brand logo, title, and initial inputs', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { level: 1, name: /SmartBinX/i })).toBeInTheDocument();
    expect(screen.getByText(/AHMEDABAD AI/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('validates and rejects blank email submission', async () => {
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    });
  });

  it('validates and rejects invalid email format', async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(emailInput, 'invalid-email-format');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates and rejects empty password', async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(emailInput, 'test@ahmedabadcity.gov.in');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('successful authentication dispatches apiService.login and invokes onLoginSuccess', async () => {
    const mockUser = {
      id: 'admin-1',
      email: 'amc-admin@ahmedabadcity.gov.in',
      role: 'AMC Operations',
      full_name: 'AMC Chief Engineer'
    };

    vi.spyOn(apiService, 'login').mockResolvedValue({
      access_token: 'valid-jwt-token',
      user: mockUser
    });

    const onLoginSuccess = vi.fn();
    renderLoginPage({ onLoginSuccess });

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const submitBtn = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(emailInput, 'amc-admin@ahmedabadcity.gov.in');
    await userEvent.type(passwordInput, '8821');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith({
        email_or_username: 'amc-admin@ahmedabadcity.gov.in',
        password: '8821',
        role: expect.any(String)
      });
    });

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(mockUser);
    }, { timeout: 1500 });
  });

  it('displays error banner when backend returns authentication error', async () => {
    vi.spyOn(apiService, 'login').mockRejectedValue(new Error('Invalid email or password.'));

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const submitBtn = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(emailInput, 'wrong@ahmedabadcity.gov.in');
    await userEvent.type(passwordInput, 'wrongpass');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('biometric access button triggers biometric authorization flow', async () => {
    const mockUser = {
      id: 'admin-1',
      email: 'amc-admin@ahmedabadcity.gov.in',
      role: 'AMC Operations'
    };

    vi.spyOn(apiService, 'login').mockResolvedValue({
      access_token: 'biometric-jwt-token',
      user: mockUser
    });

    const onLoginSuccess = vi.fn();
    renderLoginPage({ onLoginSuccess });

    const biometricBtn = screen.getByRole('button', { name: /biometric access/i });
    fireEvent.click(biometricBtn);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith({
        email_or_username: 'amc-admin@ahmedabadcity.gov.in',
        password: '8821',
        role: 'AMC Operations'
      });
    });
  });
});
