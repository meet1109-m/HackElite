import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  Truck, 
  Trash2, 
  Recycle, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Activity, 
  Cpu, 
  Play, 
  AlertCircle,
  HelpCircle,
  X,
  MapPin,
  User,
  Users,
  BarChart3,
  Leaf,
  Layers,
  Check
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const { showToast } = useWasteData();
  const [loginMode, setLoginMode] = useState('user'); // 'user' | 'admin'
  const [selectedRole, setSelectedRole] = useState('AMC Operations');
  const [operatorId, setOperatorId] = useState('user@ahmedabadcity.gov.in');
  const [pin, setPin] = useState('smart2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Auth state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const roles = [
    { id: 'AMC Operations', label: 'AMC Operations', desc: 'Command & Zonal Grid', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'Fleet Dispatch', label: 'Fleet Dispatch', desc: 'Route & Driver Control', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'Sustainability', label: 'Circularity / ESG', desc: 'MRF & Landfill Analytics', icon: <Recycle className="w-3.5 h-3.5" /> }
  ];

  const handleLoginModeChange = (mode) => {
    setLoginMode(mode);
    setValidationError('');
    if (mode === 'admin') {
      setOperatorId('amc-admin@ahmedabadcity.gov.in');
      setPin('8821');
    } else {
      setOperatorId('user@ahmedabadcity.gov.in');
      setPin('smart2026');
    }
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

  const handleFormSubmit = (e) => {
    e?.preventDefault?.();
    setValidationError('');

    if (!operatorId.trim()) {
      setValidationError('Please enter your email or operator ID.');
      return;
    }

    if (!pin.trim()) {
      setValidationError('Please enter your password or security PIN.');
      return;
    }

    // Trigger authentication simulation
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      showToast(`✓ Authentication Verified. Welcome to SmartBinX Ahmedabad AI.`, 'success');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else if (onNavigate) {
          onNavigate('command-center');
        }
      }, 650);
    }, 800);
  };

  const handleRunAIDemo = () => {
    setLoginMode('admin');
    setSelectedRole('AMC Operations');
    setOperatorId('amc-admin@ahmedabadcity.gov.in');
    setPin('8821');
    setValidationError('');
    setIsAuthenticating(true);

    showToast('🚀 Launching SmartBinX Ahmedabad AI Live Environment...', 'info');

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else if (onNavigate) {
          onNavigate('command-center');
        }
      }, 550);
    }, 750);
  };

  const handleBiometricAuth = () => {
    setIsBiometricScanning(true);
    setValidationError('');

    setTimeout(() => {
      setIsBiometricScanning(false);
      setAuthSuccess(true);
      showToast('✓ Biometric RFID Token Verified. Operator authorized.', 'success');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else if (onNavigate) {
          onNavigate('command-center');
        }
      }, 650);
    }, 1000);
  };

  return (
    <div className="login-page min-h-screen relative flex items-center justify-center p-3 sm:p-6 lg:p-10 select-none overflow-x-hidden font-sans">
      
      {/* 1. VIEWPORT FIXED BACKGROUND IMAGE DISPLAYED AT 100% HIGH CLARITY */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/city-riverfront-bg.jpg')`,
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Subtle Ambient Glass Lighting Layer to bring out contrast */}
      <div className="fixed inset-0 bg-gradient-to-tr from-[#0D5C3A]/15 via-transparent to-black/20 z-0 pointer-events-none" />

      {/* 2. MAIN SPLIT-VIEW CONTAINER MATCHING THE REFERENCE DESIGN */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-white/60 backdrop-blur-md bg-white/20">
        
        {/* ================= LEFT-HAND SIDE HERO SECTION ================= */}
        <div className="lg:col-span-6 xl:col-span-7 p-5 sm:p-8 lg:p-9 flex flex-col justify-between relative overflow-hidden text-[#17201B]">
          
          {/* Subtle translucent underlay to enhance readability without blurring the background scene */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40 pointer-events-none" />

          {/* Content Wrapper */}
          <div className="relative z-10 space-y-6 sm:space-y-8">
            
            {/* Top Brand & Logo */}
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-11 h-11 rounded-2xl bg-[#0D5C3A] flex items-center justify-center shadow-lg shadow-[#0D5C3A]/30 text-white">
                <Leaf className="w-6 h-6 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D5C3A] font-mono">
                    SmartBinX
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0D5C3A] border border-[#BBF7D0]">
                    Ahmedabad AI
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#17201B]/80 mt-0.5">
                  Cleaner Ahmedabad, Greener Tomorrow
                </p>
              </div>
            </div>

            {/* Main Hero Headline and Subtitle */}
            <div className="space-y-3 pt-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#17201B] tracking-tight leading-[1.15] drop-shadow-sm">
                Smart Waste Management for a <span className="text-[#0D5C3A]">Cleaner Tomorrow</span>
              </h2>
              <p className="text-sm sm:text-base font-medium text-[#17201B]/85 max-w-xl leading-relaxed">
                AI-powered insights for a sustainable, healthier, and cleaner Ahmedabad.
              </p>
            </div>

            {/* 4 Frosted Acrylic Glass Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
              
              {/* Feature 1: Smarter Collection */}
              <div 
                className="p-3 sm:p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.03] flex flex-col items-center text-center group"
                style={{
                  background: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 24px -6px rgba(13, 92, 58, 0.08)'
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-2 text-[#0D5C3A] group-hover:bg-[#16845B] group-hover:text-white transition-colors">
                  <Leaf className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xs font-bold text-[#17201B] group-hover:text-[#0D5C3A] transition-colors leading-tight">
                  Smarter Collection
                </span>
              </div>

              {/* Feature 2: Data-Driven Decisions */}
              <div 
                className="p-3 sm:p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.03] flex flex-col items-center text-center group"
                style={{
                  background: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 24px -6px rgba(13, 92, 58, 0.08)'
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-2 text-[#0D5C3A] group-hover:bg-[#16845B] group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#17201B] group-hover:text-[#0D5C3A] transition-colors leading-tight">
                  Data-Driven Decisions
                </span>
              </div>

              {/* Feature 3: Higher Recycling */}
              <div 
                className="p-3 sm:p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.03] flex flex-col items-center text-center group"
                style={{
                  background: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 24px -6px rgba(13, 92, 58, 0.08)'
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-2 text-[#0D5C3A] group-hover:bg-[#16845B] group-hover:text-white transition-colors">
                  <Recycle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#17201B] group-hover:text-[#0D5C3A] transition-colors leading-tight">
                  Higher Recycling
                </span>
              </div>

              {/* Feature 4: Cleaner Ahmedabad */}
              <div 
                className="p-3 sm:p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.03] flex flex-col items-center text-center group"
                style={{
                  background: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 8px 24px -6px rgba(13, 92, 58, 0.08)'
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center mb-2 text-[#0D5C3A] group-hover:bg-[#16845B] group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#17201B] group-hover:text-[#0D5C3A] transition-colors leading-tight">
                  Cleaner Ahmedabad
                </span>
              </div>

            </div>
          </div>

          {/* Mission Quote Footer */}
          <div className="relative z-10 pt-8 sm:pt-12 text-center lg:text-left">
            <p className="text-xs sm:text-sm font-semibold italic text-[#17201B]/90">
              "A cleaner city is a healthier, happier home for everyone."
            </p>
            <p className="text-xs font-bold text-[#0D5C3A] mt-0.5">
              — Our Mission
            </p>
          </div>
        </div>


        {/* ================= RIGHT-HAND SIDE LOGIN CARD ================= */}
        <div className="lg:col-span-6 xl:col-span-5 p-5 sm:p-6 lg:p-8 flex flex-col justify-between relative bg-white/85 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/80 shadow-inner">
          
          <div className="space-y-5">
            
            {/* Top Location Pill */}
            <div className="flex justify-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#E3EAE6] text-[11px] font-bold text-[#17201B] shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>Ahmedabad, Gujarat</span>
              </div>
            </div>

            {/* Header: Welcome Back */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#17201B] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs font-medium text-[#66736C]">
                Login to your SmartBinX account
              </p>
            </div>

            {/* Tabs: User Login | Admin Login */}
            <div className="flex items-center justify-center border-b border-[#E3EAE6] pb-1">
              <div className="grid grid-cols-2 w-full max-w-xs gap-2">
                <button
                  type="button"
                  onClick={() => handleLoginModeChange('user')}
                  className={`pb-2 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                    loginMode === 'user' 
                      ? 'text-[#0D5C3A]' 
                      : 'text-[#66736C] hover:text-[#17201B]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>User Login</span>
                  {loginMode === 'user' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D5C3A] rounded-full animate-fade-in" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleLoginModeChange('admin')}
                  className={`pb-2 text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                    loginMode === 'admin' 
                      ? 'text-[#0D5C3A]' 
                      : 'text-[#66736C] hover:text-[#17201B]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                  {loginMode === 'admin' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D5C3A] rounded-full animate-fade-in" />
                  )}
                </button>
              </div>
            </div>

            {/* Operational Role Selector (Active when Admin Mode is selected) */}
            {loginMode === 'admin' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-black text-[#66736C] uppercase tracking-wider block">
                  Select Authority Role
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        selectedRole === r.id
                          ? 'bg-[#F0FDF4] border-[#16845B] ring-2 ring-[#16845B]/20 shadow-sm'
                          : 'bg-white/70 border-[#E3EAE6] hover:border-[#CBD8D2]'
                      }`}
                    >
                      <span className={`mb-0.5 ${selectedRole === r.id ? 'text-[#16845B]' : 'text-[#66736C]'}`}>
                        {r.icon}
                      </span>
                      <span className={`text-[10px] font-bold truncate w-full ${selectedRole === r.id ? 'text-[#0D5C3A]' : 'text-[#66736C]'}`}>
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-1">
              
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#17201B] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A39D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => {
                      setOperatorId(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/90 border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] font-medium placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] focus:bg-white focus:ring-2 focus:ring-[#16845B]/15 transition shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#17201B] block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A39D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/90 border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] font-medium placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] focus:bg-white focus:ring-2 focus:ring-[#16845B]/15 transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A39D] hover:text-[#17201B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#66736C] font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#0D5C3A] cursor-pointer w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#0D5C3A] hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B] font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#D64545]" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Authentication Success Message */}
              {authSuccess && (
                <div className="p-2.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#0D5C3A] font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
                  <span>Access Granted. Loading Command Center...</span>
                </div>
              )}

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isAuthenticating || isBiometricScanning || authSuccess}
                className="w-full py-3 bg-[#0D5C3A] hover:bg-[#0B4F32] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#0D5C3A]/25 flex items-center justify-center gap-2 disabled:opacity-60 transform active:scale-[0.99]"
              >
                {isAuthenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Credentials...</span>
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

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#E3EAE6] w-full" />
              <span className="bg-white/90 px-3 text-[11px] font-semibold text-[#94A39D] absolute uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Social SSO Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Google SSO Button */}
              <button
                type="button"
                onClick={() => {
                  setOperatorId('google.user@ahmedabadcity.gov.in');
                  setPin('googleAuth88');
                  handleFormSubmit();
                }}
                className="py-2.5 px-3 bg-white hover:bg-[#F9FAF9] border border-[#E3EAE6] rounded-xl text-xs font-bold text-[#17201B] transition flex items-center justify-center gap-2 shadow-sm hover:border-[#CBD8D2]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Continue with Google</span>
              </button>

              {/* Microsoft SSO Button */}
              <button
                type="button"
                onClick={() => {
                  setOperatorId('msft.user@ahmedabadcity.gov.in');
                  setPin('msftAuth99');
                  handleFormSubmit();
                }}
                className="py-2.5 px-3 bg-white hover:bg-[#F9FAF9] border border-[#E3EAE6] rounded-xl text-xs font-bold text-[#17201B] transition flex items-center justify-center gap-2 shadow-sm hover:border-[#CBD8D2]"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span className="truncate">Continue with Microsoft</span>
              </button>
            </div>

            {/* Quick Demo & Biometric Access Strip */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRunAIDemo}
                className="py-2 px-2.5 bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#BBF7D0] text-[#0D5C3A] font-extrabold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-[#0D5C3A]" />
                <span>Run AI Demo</span>
              </button>

              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isBiometricScanning}
                className="py-2 px-2.5 bg-white/90 hover:bg-[#F1F6F3] border border-[#E3EAE6] text-[#17201B] font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Fingerprint className={`w-3.5 h-3.5 text-[#0D5C3A] ${isBiometricScanning ? 'animate-pulse' : ''}`} />
                <span>{isBiometricScanning ? 'Scanning RFID...' : 'Biometric Access'}</span>
              </button>
            </div>

            {/* Sign Up prompt */}
            <div className="text-center text-xs text-[#66736C]">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setShowSignUpModal(true)}
                className="text-[#0D5C3A] font-bold hover:underline"
              >
                Sign Up
              </button>
            </div>

            {/* Slogan */}
            <p className="text-[11px] font-medium text-center text-[#66736C]">
              Together for a Cleaner, Greener Ahmedabad ♡
            </p>
          </div>

          {/* Heritage Cityline Vector Illustration at the bottom of the card */}
          <div className="pt-3 mt-2 border-t border-[#E3EAE6]/60 flex flex-col items-center">
            <svg 
              className="w-full h-8 text-[#0D5C3A]/40 stroke-current fill-none stroke-[1.2]" 
              viewBox="0 0 400 50" 
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Teen Darwaza & Sidi Saiyyed arches outline */}
              <path d="M5,45 L15,45 L15,30 L20,30 L20,20 L30,20 L30,30 L35,30 L35,45 L45,45" />
              <path d="M45,45 L45,25 Q55,10 65,25 L65,45" />
              <path d="M65,45 L70,45 L70,15 L78,15 L78,45" />
              
              {/* Sabarmati Riverfront Bridge Arches */}
              <path d="M85,45 L85,35 Q105,20 125,35 L125,45 Q145,20 165,35 L165,45 Q185,20 205,35 L205,45" />
              <path d="M85,35 L205,35" strokeDasharray="3 3" />

              {/* Heritage Tomb Domes & Atal Bridge curves */}
              <path d="M215,45 L215,25 Q230,12 245,25 L245,45" />
              <path d="M230,12 L230,5" />
              <path d="M250,45 L255,45 L255,18 L265,18 L265,45" />
              <path d="M270,45 Q290,15 310,45" />
              <path d="M315,45 L320,45 L320,8 L328,8 L328,45" />
              <path d="M335,45 L345,45 L345,22 Q360,14 375,22 L375,45 L395,45" />

              {/* Ground Baseline */}
              <line x1="0" y1="45" x2="400" y2="45" />
            </svg>
          </div>

        </div>

      </div>

      {/* Return to Public Portal Button */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          onClick={() => onNavigate?.('landing')}
          className="text-[#0D5C3A] hover:text-[#0B4F32] font-bold text-xs transition flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/80 shadow-md hover:shadow-lg"
        >
          <span>← Return to Public Portal</span>
        </button>
      </div>

      {/* Forgot PIN / Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full border border-white/80 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0D5C3A]" />
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
                handleFormSubmit();
              }}
              className="w-full py-2.5 bg-[#0D5C3A] hover:bg-[#0B4F32] text-white text-xs font-bold rounded-xl transition shadow-sm"
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
                <Leaf className="w-5 h-5 text-[#0D5C3A]" />
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
            <div className="p-3 bg-[#DCFCE7]/70 rounded-2xl border border-[#BBF7D0] text-xs space-y-1 text-[#0D5C3A] font-semibold">
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
                handleFormSubmit();
              }}
              className="w-full py-2.5 bg-[#0D5C3A] hover:bg-[#0B4F32] text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Create Free Citizen Account & Enter
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
