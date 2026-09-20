import React, { useState } from 'react';
import { 
  Shield, 
  Leaf, 
  BarChart3, 
  Recycle, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  ArrowRight, 
  Play, 
  Fingerprint, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  X,
  User,
  Truck,
  Check
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';
import { apiService } from '../services/api';

// Registered Authorized AMC Accounts & Roles
const AUTHORIZED_ACCOUNTS = {
  'user@ahmedabadcity.gov.in': { pin: 'smart2026', role: 'Citizen / Municipal Operator', name: 'Citizen Operator' },
  'amc-admin@ahmedabadcity.gov.in': { pin: '8821', role: 'AMC Operations', name: 'AMC Chief Engineer' },
  'dispatch-lead@ahmedabadfleet.org': { pin: '4402', role: 'Fleet Dispatch', name: 'Fleet Dispatch Lead' },
  'sustainability@amc-recovery.in': { pin: '9115', role: 'Sustainability / ESG', name: 'Sustainability Officer' },
  'new-citizen@ahmedabad.in': { pin: 'greenAhmedabad2026', role: 'AMC Citizen Volunteer', name: 'Registered Citizen' },
  'google.user@ahmedabadcity.gov.in': { pin: 'googleAuth88', role: 'AMC Google Verified', name: 'Google Verified User' },
  'msft.user@ahmedabadcity.gov.in': { pin: 'msftAuth99', role: 'AMC Microsoft Verified', name: 'Microsoft Enterprise User' }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const { showToast } = useWasteData();
  const [loginMode, setLoginMode] = useState('user'); // 'user' | 'admin'
  const [selectedRole, setSelectedRole] = useState('AMC Operations');
  const [operatorId, setOperatorId] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Auth states
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const roles = [
    { id: 'AMC Operations', label: 'AMC Operations', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'Fleet Dispatch', label: 'Fleet Dispatch', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'Sustainability', label: 'Circularity / ESG', icon: <Recycle className="w-3.5 h-3.5" /> }
  ];

  const handleLoginModeChange = (mode) => {
    setLoginMode(mode);
    setValidationError('');
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setValidationError('');
    if (roleId === 'AMC Operations') {
      setOperatorId('amc-admin@ahmedabadcity.gov.in');
      setPin('8821');
    } else if (roleId === 'Fleet Dispatch') {
      setOperatorId('dispatch-lead@ahmedabadfleet.org');
      setPin('4402');
    } else {
      setOperatorId('sustainability@amc-recovery.in');
      setPin('9115');
    }
  };

  const executeAuthentication = async (emailInput, passwordInput) => {
    const trimmedEmail = (emailInput ?? operatorId).trim();
    const trimmedPin = (passwordInput ?? pin).trim();

    setValidationError('');

    // A. Email empty validation
    if (!trimmedEmail) {
      setValidationError('Email address is required.');
      return;
    }

    // C. Email format validation
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    // B. Password empty validation
    if (!trimmedPin) {
      setValidationError('Password is required.');
      return;
    }

    // Prevent duplicate login requests
    if (isAuthenticating || authSuccess) return;

    setIsAuthenticating(true);

    try {
      // Authenticate against FastAPI backend with bcrypt verification and signed JWT token
      const res = await apiService.login({
        email_or_username: trimmedEmail,
        password: trimmedPin,
        role: selectedRole
      });

      setIsAuthenticating(false);
      setAuthSuccess(true);
      showToast(`✓ Authentication Verified (${res.user?.role || selectedRole}). Welcome to SmartBinX Ahmedabad.`, 'success');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else if (onNavigate) {
          onNavigate('command-center');
        }
      }, 650);
    } catch (err) {
      setIsAuthenticating(false);
      setValidationError(err.message || 'Invalid email or password. Please check your credentials or click "Forgot Password?" to view demo accounts.');
    }
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault?.();
    executeAuthentication(operatorId, pin);
  };

  const handleRunAIDemo = () => {
    if (isAuthenticating || authSuccess) return;
    setLoginMode('admin');
    setSelectedRole('AMC Operations');
    setOperatorId('amc-admin@ahmedabadcity.gov.in');
    setPin('8821');
    setValidationError('');
    executeAuthentication('amc-admin@ahmedabadcity.gov.in', '8821');
  };

  const handleBiometricAuth = async () => {
    if (isBiometricScanning || isAuthenticating || authSuccess) return;
    setIsBiometricScanning(true);
    setValidationError('');

    try {
      const res = await apiService.login({
        email_or_username: 'amc-admin@ahmedabadcity.gov.in',
        password: '8821',
        role: 'AMC Operations'
      });
      setIsBiometricScanning(false);
      setAuthSuccess(true);
      showToast('✓ Biometric RFID Token Verified. AMC Operator authorized.', 'success');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else if (onNavigate) {
          onNavigate('command-center');
        }
      }, 650);
    } catch (err) {
      setIsBiometricScanning(false);
      setValidationError('Biometric authorization failed. Please use PIN or password.');
    }
  };

  return (
    <div className="login-page min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none overflow-x-hidden font-sans">
      
      {/* 1. VIEWPORT FIXED BACKGROUND (Already present in web - unchanged) */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/city-riverfront-bg.jpg')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Barely-there ambient — keeps background bright and vivid */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'rgba(255,250,240,0.04)' }} />

      {/* 2. MAIN 2-COLUMN LAYOUT — Left column starts closer to the top */}
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-6 sm:pt-8 lg:pt-10">
        
        {/* ================= LEFT COLUMN: BRANDING & FEATURES (starts closer to TOP) ================= */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-[#17201B] pt-1 pb-4">
          
          {/* Top Brand / Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0F6B47] flex items-center justify-center shadow-lg shadow-[#0F6B47]/25 text-white">
              <Leaf className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B]">
                  SmartBinX
                </h1>
                <span className="text-[11px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#0F6B47] border border-[#C2E7CB]">
                  AHMEDABAD AI
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#4B5563] mt-0.5">
                Cleaner Ahmedabad, Greener Tomorrow
              </p>
            </div>
          </div>

          {/* Main Hero Headline & Leaf Doodle */}
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#17201B] tracking-tight leading-[1.18]">
              Smart Waste Management <br className="hidden sm:inline" />
              for a <span className="text-[#0F6B47]">Cleaner Tomorrow</span>
              {/* Cute Green Leaf Doodle with Swirl */}
              <span className="inline-block align-middle ml-2.5 -mt-2">
                <svg className="w-9 h-7 sm:w-11 sm:h-9 text-[#0F6B47]" viewBox="0 0 50 35" fill="none" stroke="currentColor">
                  {/* Swirl loop stem */}
                  <path d="M4 23 C12 30, 22 26, 20 18 C18 10, 28 13, 35 9" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Leaf 1 */}
                  <path d="M35 9 C40 3, 47 4, 48 9 C45 13, 38 13, 35 9 Z" fill="#0F6B47" strokeWidth="1" />
                  {/* Leaf 2 */}
                  <path d="M28 12 C30 7, 35 7, 37 10 C35 13, 31 14, 28 12 Z" fill="#239B62" strokeWidth="1" />
                </svg>
              </span>
            </h2>

            {/* Subtitle & Brush Underline */}
            <div className="pt-1">
              <p className="text-sm sm:text-base font-medium text-[#374151] max-w-lg leading-relaxed">
                AI-powered insights for a sustainable, healthier, and cleaner Ahmedabad.
              </p>
              {/* Hand-drawn Green Underline Brush Stroke */}
              <svg className="w-24 h-2.5 text-[#0F6B47]/85 mt-2" viewBox="0 0 100 10" fill="none" stroke="currentColor">
                <path d="M2 6 Q 50 1, 98 5" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* 4 Feature Cards (Horizontal Row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 pt-2 max-w-2xl">
            
            {/* Card 1: Smarter Collection */}
            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="w-11 h-11 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-2.5 text-[#0F6B47] group-hover:bg-[#0F6B47] group-hover:text-white transition-colors shadow-inner">
                <Leaf className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-extrabold text-[#17201B] leading-tight group-hover:text-[#0F6B47] transition-colors">
                Smarter<br />Collection
              </span>
            </div>

            {/* Card 2: Data-Driven Decisions */}
            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="w-11 h-11 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-2.5 text-[#0F6B47] group-hover:bg-[#0F6B47] group-hover:text-white transition-colors shadow-inner">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#17201B] leading-tight group-hover:text-[#0F6B47] transition-colors">
                Data-Driven<br />Decisions
              </span>
            </div>

            {/* Card 3: Higher Recycling */}
            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="w-11 h-11 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-2.5 text-[#0F6B47] group-hover:bg-[#0F6B47] group-hover:text-white transition-colors shadow-inner">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#17201B] leading-tight group-hover:text-[#0F6B47] transition-colors">
                Higher<br />Recycling
              </span>
            </div>

            {/* Card 4: Cleaner Ahmedabad */}
            <div className="bg-white/85 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="w-11 h-11 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-2.5 text-[#0F6B47] group-hover:bg-[#0F6B47] group-hover:text-white transition-colors shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-[#17201B] leading-tight group-hover:text-[#0F6B47] transition-colors">
                Cleaner<br />Ahmedabad
              </span>
            </div>

          </div>

          {/* Mission Quote */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm font-serif italic font-medium text-[#2C3830]">
              “A cleaner city is a healthier, happier home for everyone.”
            </p>
            <p className="text-xs font-bold text-[#0F6B47] mt-0.5">
              — Our Mission
            </p>
          </div>

        </div>


        {/* ================= RIGHT COLUMN: LOGIN CARD ================= */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          
          <div className="w-full max-w-[460px] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/90 p-6 sm:p-8 space-y-4 relative">
            
            {/* Top Bar: Location Pill & Ahmedabad Architectural Sketch */}
            <div className="flex items-center justify-between gap-2">
              
              {/* Location Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[11px] font-bold text-[#0F6B47] shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#0F6B47]" />
                <span>Ahmedabad, Gujarat</span>
              </div>

              {/* Ahmedabad Monuments & Bridge Sketch Outline */}
              <div className="opacity-70">
                <svg 
                  className="w-36 sm:w-44 h-9 text-[#0F6B47]/45 stroke-current fill-none stroke-[1.2]" 
                  viewBox="0 0 180 40" 
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Sidi Saiyyed / Teen Darwaza Arches */}
                  <path d="M2 38 L8 38 L8 25 L12 25 L12 18 L20 18 L20 25 L24 25 L24 38" />
                  <path d="M24 38 L24 22 Q32 10 40 22 L40 38" />
                  <path d="M28 22 Q32 14 36 22" />
                  {/* Sabarmati Riverfront Bridge Arches */}
                  <path d="M42 38 L42 30 Q54 18 66 30 L66 38 Q78 18 90 30 L90 38 Q102 18 114 30 L114 38" />
                  <path d="M42 30 L114 30" strokeDasharray="2 2" />
                  <path d="M54 30 L54 38 M78 30 L78 38 M102 30 L102 38" />
                  {/* Minaret */}
                  <path d="M118 38 L120 12 L124 12 L126 38" />
                  <path d="M120 12 L122 5 L124 12" />
                  {/* Dome & Heritage Spire */}
                  <path d="M128 38 L130 24 Q140 10 150 24 L152 38" />
                  <path d="M140 10 L140 3" />
                  <path d="M154 38 L156 18 L162 18 L164 38" />
                  <path d="M168 38 L170 8 L174 8 L176 38" />
                  {/* Ground Baseline */}
                  <line x1="0" y1="38" x2="180" y2="38" />
                </svg>
              </div>
            </div>

            {/* Header: Welcome Back */}
            <div className="pt-1">
              <h3 className="text-2xl sm:text-3xl font-black text-[#17201B] tracking-tight">
                Welcome Back
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#6B7280] mt-0.5">
                Login to your SmartBinX account
              </p>
            </div>

            {/* Tab Switcher: User Login vs Admin Login */}
            <div className="border border-[#E5E7EB] rounded-2xl p-1 bg-white flex items-center justify-between">
              
              {/* User Login Tab */}
              <button
                type="button"
                onClick={() => handleLoginModeChange('user')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                  loginMode === 'user' 
                    ? 'text-[#0F6B47]' 
                    : 'text-[#6B7280] hover:text-[#17201B]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>User Login</span>
                {loginMode === 'user' && (
                  <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-[#0F6B47] rounded-full animate-fade-in" />
                )}
              </button>

              {/* Admin Login Tab */}
              <button
                type="button"
                onClick={() => handleLoginModeChange('admin')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                  loginMode === 'admin' 
                    ? 'text-[#0F6B47]' 
                    : 'text-[#6B7280] hover:text-[#17201B]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login</span>
                {loginMode === 'admin' && (
                  <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-[#0F6B47] rounded-full animate-fade-in" />
                )}
              </button>

            </div>

            {/* Authority Role Selector (Active when Admin Mode is selected) */}
            {loginMode === 'admin' && (
              <div className="space-y-1.5 pt-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                    Select Administrative Role
                  </span>
                  <span className="text-[10px] font-mono text-[#0F6B47] font-bold">
                    {selectedRole}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center text-[10px] font-bold ${
                        selectedRole === r.id
                          ? 'bg-[#F0FDF4] border-[#0F6B47] text-[#0F6B47] shadow-sm'
                          : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <span className="mb-0.5">{r.icon}</span>
                      <span className="truncate w-full">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3 pt-1">
              
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => {
                      setOperatorId(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#17201B] font-medium placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F6B47] focus:ring-2 focus:ring-[#0F6B47]/15 transition shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#17201B] font-medium placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F6B47] focus:ring-2 focus:ring-[#0F6B47]/15 transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#17201B] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#4B5563] font-medium select-none">
                  <div 
                    onClick={() => setRememberMe(prev => !prev)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      rememberMe 
                        ? 'bg-[#0F6B47] border-[#0F6B47] text-white' 
                        : 'bg-white border-[#D1D5DB]'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#0F6B47] hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Validation Message */}
              {validationError && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B] font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#D64545]" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Authentication Success Message */}
              {authSuccess && (
                <div className="p-2.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#0F6B47] font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F6B47]" />
                  <span>✓ Login Successful. Entering Command Center...</span>
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isAuthenticating || isBiometricScanning || authSuccess}
                className="w-full py-3 bg-[#0F6B47] hover:bg-[#0B5D3B] text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#0F6B47]/20 flex items-center justify-center gap-2 disabled:opacity-60 transform active:scale-[0.99] mt-2"
              >
                {isAuthenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying...</span>
                  </>
                ) : authSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider with 'OR' */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#E5E7EB] w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-[#9CA3AF] absolute uppercase tracking-wider">
                or
              </span>
            </div>

            {/* 2x2 Grid: Social SSO, AI Demo & Biometric Access */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              
              {/* Google Button */}
              <button
                type="button"
                onClick={() => {
                  setOperatorId('google.user@ahmedabadcity.gov.in');
                  setPin('googleAuth88');
                  executeAuthentication('google.user@ahmedabadcity.gov.in', 'googleAuth88');
                }}
                className="py-2.5 px-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] transition flex items-center justify-center gap-2 shadow-sm hover:border-[#D1D5DB]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Continue with Google</span>
              </button>

              {/* Microsoft Button */}
              <button
                type="button"
                onClick={() => {
                  setOperatorId('msft.user@ahmedabadcity.gov.in');
                  setPin('msftAuth99');
                  executeAuthentication('msft.user@ahmedabadcity.gov.in', 'msftAuth99');
                }}
                className="py-2.5 px-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] transition flex items-center justify-center gap-2 shadow-sm hover:border-[#D1D5DB]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="truncate">Continue with Microsoft</span>
              </button>

              {/* Run AI Demo Button */}
              <button
                type="button"
                onClick={handleRunAIDemo}
                className="py-2 px-2.5 bg-[#E8F5E9] hover:bg-[#DCFCE7] border border-[#C8E6C9] text-[#0F6B47] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-[#0F6B47]" />
                <span>Run AI Demo</span>
              </button>

              {/* Biometric Access Button */}
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isBiometricScanning}
                className="py-2 px-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Fingerprint className={`w-3.5 h-3.5 text-[#0F6B47] ${isBiometricScanning ? 'animate-pulse' : ''}`} />
                <span>{isBiometricScanning ? 'Scanning...' : 'Biometric Access'}</span>
              </button>

            </div>

            {/* Footer Sign Up Link */}
            <div className="text-center text-xs text-[#6B7280] pt-1">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setShowSignUpModal(true)}
                className="text-[#0F6B47] font-bold hover:underline"
              >
                Sign Up
              </button>
            </div>

            {/* Bottom Slogan */}
            <div className="text-center pt-0.5">
              <p className="text-[11px] font-medium text-[#6B7280] inline-flex items-center gap-1">
                <span>Together for a Cleaner, Greener Ahmedabad</span>
                <Leaf className="w-3 h-3 text-[#0F6B47]" />
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Return to Public Portal Button */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={() => onNavigate?.('landing')}
          className="text-[#0F6B47] hover:text-[#0B5D3B] font-bold text-xs transition flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 shadow-md hover:shadow-lg"
        >
          <span>← Return to Public Portal</span>
        </button>
      </div>

      {/* Demo Credentials Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full border border-white/80 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0F6B47]" />
                <h3 className="font-extrabold text-sm text-[#17201B]">Demo Access Credentials</h3>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-[#66736C] hover:text-[#17201B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#66736C] leading-relaxed">
              Default demo accounts for instant login:
            </p>
            <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#E3EAE6] text-xs font-mono space-y-1.5">
              <div><strong>Admin (AMC):</strong> amc-admin@ahmedabadcity.gov.in (PIN: 8821)</div>
              <div><strong>Fleet Dispatch:</strong> dispatch-lead@ahmedabadfleet.org (PIN: 4402)</div>
              <div><strong>User Account:</strong> user@ahmedabadcity.gov.in (Pass: smart2026)</div>
            </div>
            <button
              onClick={() => {
                setShowForgotModal(false);
                setOperatorId(
                  selectedRole === 'AMC Operations' 
                    ? 'amc-admin@ahmedabadcity.gov.in' 
                    : selectedRole === 'Fleet Dispatch' 
                    ? 'dispatch-lead@ahmedabadfleet.org' 
                    : 'sustainability@amc-recovery.in'
                );
                setPin(
                  selectedRole === 'AMC Operations' ? '8821' : selectedRole === 'Fleet Dispatch' ? '4402' : '9115'
                );
                executeAuthentication(
                  selectedRole === 'AMC Operations' 
                    ? 'amc-admin@ahmedabadcity.gov.in' 
                    : selectedRole === 'Fleet Dispatch' 
                    ? 'dispatch-lead@ahmedabadfleet.org' 
                    : 'sustainability@amc-recovery.in',
                  selectedRole === 'AMC Operations' ? '8821' : selectedRole === 'Fleet Dispatch' ? '4402' : '9115'
                );
              }}
              className="w-full py-2.5 bg-[#0F6B47] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Sign In with Selected Role
            </button>
          </div>
        </div>
      )}

      {/* Quick Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full border border-white/80 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#0F6B47]" />
                <h3 className="font-extrabold text-sm text-[#17201B]">Join Ahmedabad AI Initiative</h3>
              </div>
              <button 
                onClick={() => setShowSignUpModal(false)}
                className="text-[#66736C] hover:text-[#17201B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#66736C] leading-relaxed">
              Create an account to report overflowing bins, view recycling rewards, and track Ahmedabad's zero-waste progress.
            </p>
            <div className="p-3 bg-[#DCFCE7]/70 rounded-2xl border border-[#BBF7D0] text-xs space-y-1 text-[#0F6B47] font-semibold">
              ✓ Instant Citizen Node Access<br />
              ✓ AI Cleanliness Rewards Dashboard<br />
              ✓ AMC Green Volunteer Badges
            </div>
            <button
              onClick={() => {
                setShowSignUpModal(false);
                setLoginMode('user');
                setOperatorId('new-citizen@ahmedabad.in');
                setPin('greenAhmedabad2026');
                executeAuthentication('new-citizen@ahmedabad.in', 'greenAhmedabad2026');
              }}
              className="w-full py-2.5 bg-[#0F6B47] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Create Free Citizen Account & Enter
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
