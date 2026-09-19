import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const { showToast } = useWasteData();
  const [selectedRole, setSelectedRole] = useState('AMC Operations');
  const [operatorId, setOperatorId] = useState('amc-admin@ahmedabadcity.gov.in');
  const [pin, setPin] = useState('8821');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Auth state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const roles = [
    { id: 'AMC Operations', label: 'AMC Operations', desc: 'Central Command & Zonal Control', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'Fleet Dispatch', label: 'Fleet Dispatch', desc: 'Real-time Route & Driver Allocation', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'Sustainability', label: 'Circularity / ESG', desc: 'MRF & Landfill Diversion Analytics', icon: <Recycle className="w-3.5 h-3.5" /> }
  ];

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
      setValidationError('Please enter your operator ID or official email.');
      return;
    }

    if (!pin.trim()) {
      setValidationError('Please enter your security PIN or password.');
      return;
    }

    // Trigger authentication simulation
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      showToast(`✓ Authentication Verified. Welcome, ${selectedRole} Officer.`, 'success');

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else if (onNavigate) {
          onNavigate('command-center');
        }
      }, 700);
    }, 900);
  };

  const handleRunAIDemo = () => {
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
      }, 600);
    }, 800);
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
      }, 700);
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center bg-[#F7FAF8] overflow-hidden p-4 sm:p-8">
      {/* Background Animated Elements: Sabarmati Wave, Grid & Glowing Nodes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle grid mesh */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(#CBD8D2 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Thematic Sabarmati River subtle ribbon curve */}
        <svg 
          className="absolute top-0 right-0 w-full h-full opacity-35" 
          viewBox="0 0 1440 900" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <path 
            d="M-100 200 C 300 450, 700 150, 1100 500 C 1300 680, 1500 400, 1600 600" 
            stroke="#2878C8" 
            strokeWidth="38" 
            strokeLinecap="round"
            opacity="0.12" 
          />
          <path 
            d="M-100 200 C 300 450, 700 150, 1100 500 C 1300 680, 1500 400, 1600 600" 
            stroke="#16845B" 
            strokeWidth="3" 
            strokeDasharray="12 12"
            opacity="0.4" 
            className="animate-pulse"
          />
          {/* Moving Route Vehicle indicator */}
          <circle cx="580" cy="310" r="8" fill="#16845B" className="animate-ping" />
          <circle cx="580" cy="310" r="5" fill="#16845B" />
          <circle cx="940" cy="380" r="6" fill="#2878C8" />
          <circle cx="1180" cy="560" r="7" fill="#E89A27" />
        </svg>

        {/* Floating Gradient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#DCFCE7] rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#E0F2FE] rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: Ahmedabad Smart Waste Identity & Capabilities */}
        <div className="lg:col-span-6 space-y-6 lg:pr-6">
          {/* Logo & City Badge */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#BBF7D0] shadow-sm text-xs font-bold text-[#0B5D3B]">
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
              <span>Ahmedabad Municipal Corporation • AI Operations</span>
            </div>

            <div className="flex items-center gap-3">
              <img 
                src="/smartbinx-logo.png" 
                alt="SmartBinX Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <span className="font-mono font-black text-2xl tracking-tight text-[#17201B] block">SmartBinX</span>
                <span className="text-[11px] text-[#66736C] font-semibold">Ahmedabad Waste Intelligence & Circularity</span>
              </div>
            </div>
          </div>

          {/* Large Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17201B] tracking-tight leading-[1.15]">
              Ahmedabad's Waste. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16845B] via-[#0D9488] to-[#2878C8]">
                Managed Intelligently.
              </span>
            </h1>
            <p className="text-sm text-[#66736C] leading-relaxed font-normal">
              AI-powered waste intelligence for predictive overflow prevention, dynamic vehicle routing, and high-purity circular material recovery across 12 AMC zones.
            </p>
          </div>

          {/* 4 Capability Indicators */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E3EAE6] shadow-sm flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              </div>
              <span className="text-xs font-bold text-[#17201B]">Predict Overflow</span>
            </div>

            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E3EAE6] shadow-sm flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              </div>
              <span className="text-xs font-bold text-[#17201B]">Optimize Collection</span>
            </div>

            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E3EAE6] shadow-sm flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              </div>
              <span className="text-xs font-bold text-[#17201B]">Recover More</span>
            </div>

            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E3EAE6] shadow-sm flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              </div>
              <span className="text-xs font-bold text-[#17201B]">Reduce Waste Trips</span>
            </div>
          </div>

          {/* Floating Live Telemetry Badge */}
          <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E3EAE6] shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#16845B] animate-pulse" />
              <div>
                <span className="font-bold text-[#17201B] block">Ahmedabad IoT Smart Grid</span>
                <span className="text-[11px] text-[#66736C]">120 Nodes Active • 63.9% Diversion Rate</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#DCFCE7] text-[#0B5D3B] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
              SYS ONLINE
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Premium Creative Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white/95 backdrop-blur-xl border border-[#E3EAE6] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
            
            {/* Top Card Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-[#17201B] tracking-tight">
                  Welcome to SmartBinX
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#F1F6F3] text-[#17201B] font-bold border border-[#E3EAE6]">
                  PORTAL v1.0
                </span>
              </div>
              <p className="text-xs text-[#66736C] mt-1 font-medium">
                Access the Ahmedabad AI Waste Operations Center
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#66736C] uppercase tracking-wider block">
                Select Operational Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
                      selectedRole === r.id
                        ? 'bg-[#F0FDF4] border-[#16845B] ring-2 ring-[#16845B]/20 shadow-sm'
                        : 'bg-[#F7FAF8] border-[#E3EAE6] hover:border-[#CBD8D2]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={selectedRole === r.id ? 'text-[#16845B]' : 'text-[#66736C]'}>
                        {r.icon}
                      </span>
                      <span className={`text-xs font-bold ${selectedRole === r.id ? 'text-[#17201B]' : 'text-[#66736C]'}`}>
                        {r.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94A39D] hidden sm:block truncate w-full">
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Operator ID / Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17201B] flex items-center justify-between">
                  <span>Official Operator ID / Email</span>
                  <span className="text-[10px] text-[#66736C] font-normal">AMC Secured</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#66736C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => {
                      setOperatorId(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="e.g. amc-admin@ahmedabadcity.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] font-medium placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] focus:bg-white transition shadow-sm"
                  />
                </div>
              </div>

              {/* Password / Security PIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#17201B]">Security PIN / Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-[#16845B] hover:text-[#0B5D3B] font-bold"
                  >
                    Forgot PIN?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#66736C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Enter operator PIN"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] font-mono font-medium placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] focus:bg-white transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66736C] hover:text-[#17201B]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#66736C] select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#16845B] cursor-pointer"
                  />
                  <span>Remember this terminal</span>
                </label>
                <span className="text-[11px] text-[#94A39D] font-mono">256-Bit SSL</span>
              </div>

              {/* Validation error message */}
              {validationError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B] font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#D64545]" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Authentication Success Message */}
              {authSuccess && (
                <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#0B5D3B] font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
                  <span>Authentication verified. Launching Command Center...</span>
                </div>
              )}

              {/* Primary CTA: Enter Command Center */}
              <button
                type="submit"
                disabled={isAuthenticating || isBiometricScanning || authSuccess}
                className="w-full py-3 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#16845B]/20 flex items-center justify-center gap-2 disabled:opacity-60 transform active:scale-[0.99]"
              >
                {isAuthenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Authenticating AMC Operator...</span>
                  </>
                ) : authSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Access Granted • Entering...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo & Biometric Access Strip */}
            <div className="pt-2 border-t border-[#E3EAE6] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Secondary CTA: Run AI Demo */}
                <button
                  type="button"
                  onClick={handleRunAIDemo}
                  className="py-2.5 px-3 bg-gradient-to-r from-[#DCFCE7] to-[#CCFBF1] hover:from-[#BBF7D0] hover:to-[#99F6E4] border border-[#BBF7D0] text-[#065F46] font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-[#065F46]" />
                  <span>Run AI Demo</span>
                  <span className="text-[10px] font-normal opacity-80">(Auto-fill)</span>
                </button>

                {/* Quick Biometric Access */}
                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  disabled={isBiometricScanning}
                  className="py-2.5 px-3 bg-[#F7FAF8] hover:bg-[#F1F6F3] border border-[#E3EAE6] text-[#17201B] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Fingerprint className={`w-4 h-4 text-[#16845B] ${isBiometricScanning ? 'animate-pulse' : ''}`} />
                  <span>{isBiometricScanning ? 'Scanning...' : 'Biometric Access'}</span>
                </button>
              </div>

              <p className="text-center text-[10px] text-[#94A39D]">
                Ahmedabad Municipal Smart Waste Intelligence • Demo Platform
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Forgot PIN / Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3EAE6] shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#16845B]" />
                <h3 className="font-extrabold text-sm text-[#17201B]">Operator PIN Recovery</h3>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-[#66736C] hover:text-[#17201B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#66736C] leading-relaxed">
              For security in this demonstration sandbox, standard credentials for <strong>{selectedRole}</strong> are automatically populated:
            </p>
            <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#E3EAE6] text-xs font-mono space-y-1">
              <div><strong>ID:</strong> {operatorId}</div>
              <div><strong>PIN:</strong> {pin}</div>
            </div>
            <button
              onClick={() => {
                setShowForgotModal(false);
                handleFormSubmit();
              }}
              className="w-full py-2.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl transition"
            >
              Sign In with Preset Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
