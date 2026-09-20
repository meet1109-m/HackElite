import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import RecyclingPurityGauge from '../components/Common/RecyclingPurityGauge';
import ProvenanceBadge from '../components/Common/ProvenanceBadge';
import { Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Layers, ShieldCheck, ArrowRight, Image } from 'lucide-react';

const PRESET_SAMPLES = [
  {
    id: 'plastic_bottles',
    name: 'Plastic PET Bottles & Packaging',
    category: 'plastic',
    targetStream: 'Plastic',
    thumbnail: '🥤',
    description: 'High concentration of clear PET beverage bottles with minimal contamination.',
    mockResult: {
      plastic: 78.4,
      paper: 6.2,
      organic: 4.8,
      metal: 5.1,
      glass: 1.5,
      other: 4.0,
      confidence: 0.94,
      purity_score: 78.4,
      contamination_level: 'Low Contamination'
    }
  },
  {
    id: 'organic_compost',
    name: 'Kitchen & Produce Organic Waste',
    category: 'organic',
    targetStream: 'Organic',
    thumbnail: '🥬',
    description: 'Decomposable food scraps, vegetable peels, and tea leaves from dining zone.',
    mockResult: {
      organic: 82.5,
      paper: 8.0,
      plastic: 4.5,
      metal: 1.2,
      glass: 0.8,
      other: 3.0,
      confidence: 0.91,
      purity_score: 82.5,
      contamination_level: 'Low Contamination'
    }
  },
  {
    id: 'mixed_contaminated',
    name: 'Contaminated Mixed Waste Stream',
    category: 'contaminated',
    targetStream: 'Plastic',
    thumbnail: '⚠️',
    description: 'Severely mixed stream with plastic, unseparated food scraps, and metals.',
    mockResult: {
      plastic: 42.0,
      organic: 34.0,
      paper: 12.0,
      metal: 7.0,
      glass: 3.0,
      other: 2.0,
      confidence: 0.86,
      purity_score: 42.0,
      contamination_level: 'Critical Contamination'
    }
  },
  {
    id: 'paper_cardboard',
    name: 'Office Paper & Corrugated Cardboard',
    category: 'paper',
    targetStream: 'Paper',
    thumbnail: '📦',
    description: 'High recovery grade dry office documents and clean flattened packing boxes.',
    mockResult: {
      paper: 74.0,
      plastic: 11.0,
      organic: 5.0,
      metal: 4.0,
      glass: 1.0,
      other: 5.0,
      confidence: 0.89,
      purity_score: 74.0,
      contamination_level: 'Moderate Contamination'
    }
  }
];

export default function WasteVisionPage() {
  const { classifyWasteImage } = useWasteData();
  const [selectedSample, setSelectedSample] = useState(PRESET_SAMPLES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(PRESET_SAMPLES[0].mockResult);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'camera'
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const applyClassificationResult = (res) => {
    if (!res) return;
    const comp = res.composition || {};
    const plastic = res.plastic ?? comp.plastic ?? 0;
    const organic = res.organic ?? comp.organic ?? 0;
    const paper = res.paper ?? comp.paper ?? 0;
    const metal = res.metal ?? comp.metal ?? 0;
    const glass = res.glass ?? comp.glass ?? 0;
    const other = res.other ?? comp.other ?? 0;
    const rawConf = res.confidence ?? ((res.confidence_pct || 88) / 100);
    const confidence = rawConf > 1 ? rawConf / 100 : rawConf;
    const purity = res.purity_score ?? res.recycling_purity_score ?? 72;
    const contam = res.contamination_level || (purity >= 75 ? 'Low Contamination' : (purity >= 50 ? 'Moderate Contamination' : 'Critical Contamination'));

    setAnalysisResult({
      plastic,
      organic,
      paper,
      metal,
      glass,
      other,
      confidence,
      purity_score: purity,
      contamination_level: contam,
      dominant_material: res.dominant_material || 'Plastic',
      source: res.source || 'AI Detected from Image',
      contamination_warning: res.contamination_warning || null
    });
  };

  const handleSelectSample = async (sample) => {
    setSelectedSample(sample);
    setUploadedImagePreview(null);
    setUploadedFile(null);
    setAnalyzing(true);
    try {
      const res = await classifyWasteImage(null, sample.targetStream, sample.id);
      if (res) {
        applyClassificationResult(res);
      } else {
        setAnalysisResult(sample.mockResult);
      }
    } catch {
      setAnalysisResult(sample.mockResult);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadedImagePreview(reader.result);
      setAnalyzing(true);
      try {
        // Run real PyTorch MobileNetV2 inference via backend /api/waste/classify multipart endpoint
        const res = await classifyWasteImage(file);
        if (res) {
          applyClassificationResult(res);
        }
      } catch (err) {
        console.error('[WasteVision] PyTorch image classification failed:', err);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      let res;
      if (activeTab === 'upload' && uploadedFile) {
        // Run PyTorch MobileNetV2 inference on the user's uploaded file
        res = await classifyWasteImage(uploadedFile);
      } else if (activeTab === 'camera') {
        // Run inference on simulated IoT optical sensor feed (Node AHM-104)
        res = await classifyWasteImage(null, 'Organic', 'AHM-104');
      } else {
        // Run inference on chosen preset sample
        res = await classifyWasteImage(null, selectedSample?.targetStream || 'Plastic', selectedSample?.id);
      }

      if (res) {
        applyClassificationResult(res);
      }
    } catch (err) {
      console.error('[WasteVision] Classification failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const materials = [
    { name: 'Plastic', key: 'plastic', color: 'bg-[#16845B]', text: 'text-[#16845B]' },
    { name: 'Organic', key: 'organic', color: 'bg-[#0D9488]', text: 'text-[#0D9488]' },
    { name: 'Paper & Cardboard', key: 'paper', color: 'bg-[#2878C8]', text: 'text-[#2878C8]' },
    { name: 'Metal', key: 'metal', color: 'bg-[#66736C]', text: 'text-[#66736C]' },
    { name: 'Glass', key: 'glass', color: 'bg-[#0284C7]', text: 'text-[#0284C7]' },
    { name: 'Other Non-Recyclable', key: 'other', color: 'bg-[#D64545]', text: 'text-[#D64545]' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto bg-pattern-vision min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Camera className="w-7 h-7 text-[#16845B]" />
              Waste Vision AI Lab
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              Computer Vision & Recycling Purity Model
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Hybrid Multi-Stream Computer Vision classifier to audit waste composition, identify contamination, and compute purity indices.
          </p>
        </div>

        <ProvenanceBadge source="AI Detected from Image" confidence={Math.round(analysisResult.confidence * 100)} />
      </div>

      {/* Main Grid: Input / Camera on Left, AI Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Selection & Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-5">
            {/* Mode Tabs */}
            <div className="flex bg-[#F1F6F3] p-1 rounded-2xl border border-[#E3EAE6]">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'presets' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
              >
                Inspection Presets
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'upload' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
              >
                Upload Photo
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'camera' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
              >
                Live Camera Feed
              </button>
            </div>

            {/* Presets Selector */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_SAMPLES.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedSample.id === sample.id
                        ? 'bg-[#F0FDF4] border-[#16845B] ring-2 ring-[#16845B]/20 shadow-sm'
                        : 'bg-[#F7FAF8] border-[#E3EAE6] hover:border-[#CBD8D2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-2xl">{sample.thumbnail}</span>
                      <span className="text-xs font-bold text-[#17201B] line-clamp-1">{sample.name}</span>
                    </div>
                    <span className="text-[11px] text-[#66736C] line-clamp-2">{sample.description}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                {uploadedImagePreview ? (
                  <div className="relative aspect-video bg-[#F7FAF8] rounded-2xl overflow-hidden border border-[#E3EAE6] flex items-center justify-center">
                    <img src={uploadedImagePreview} alt="Uploaded Waste Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setUploadedFile(null);
                      }}
                      className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-[#D64545] font-bold text-xs rounded-lg shadow-md border border-[#E3EAE6]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                    className="border-2 border-dashed border-[#CBD8D2] hover:border-[#16845B] rounded-2xl p-8 text-center transition bg-[#F7FAF8]"
                  >
                    <Upload className="w-10 h-10 text-[#66736C] mx-auto mb-3" />
                    <p className="text-sm font-bold text-[#17201B] mb-1">Drag and drop waste inspection photo</p>
                    <p className="text-xs text-[#66736C] mb-4">Supports JPEG, PNG, WEBP (Max 10MB)</p>
                    <label className="inline-block px-5 py-2.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm">
                      Browse Files
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Live Camera Simulation */}
            {activeTab === 'camera' && (
              <div className="bg-[#F7FAF8] rounded-2xl p-6 border border-[#E3EAE6] text-center space-y-3">
                <div className="relative aspect-video bg-[#E5ECE8] rounded-xl flex items-center justify-center overflow-hidden border border-[#CBD8D2]">
                  <div className="absolute inset-4 border-2 border-[#16845B]/60 rounded-xl animate-pulse pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-[#0B5D3B] font-mono font-bold bg-white/90 px-3 py-1 rounded-full shadow-sm">
                      AI INFERENCE READY
                    </span>
                  </div>
                  <Camera className="w-12 h-12 text-[#66736C]" />
                </div>
                <p className="text-xs text-[#66736C]">Simulated IoT Camera Feed (Sabarmati Promenade Node 104)</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full py-4 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#16845B]/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Classifying Waste Fractions...' : 'Analyze Waste'}
            </button>
          </div>

          {/* Principle Disclaimer Box */}
          <div className="bg-white border border-[#E3EAE6] rounded-2xl p-4 text-xs text-[#66736C] flex items-start gap-3 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#16845B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#17201B] block mb-0.5">Hybrid Waste Intelligence Guarantee</span>
              Vision classification yields <strong className="text-[#0B5D3B]">AI Detected from Image</strong> tags. Bins without optical cameras use temporal estimation labeled as <strong className="text-[#2878C8]">AI Estimated</strong>.
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Material Composition & Recycling Purity Score */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#17201B]">AI Waste Classification Results</h3>
                <p className="text-xs text-[#66736C]">Breakdown across 6 standardized municipal fractions</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] px-3 py-1 rounded-full">
                Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Recycling Purity Gauge & Contamination Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
              <RecyclingPurityGauge score={analysisResult.purity_score} />
              
              <div className="space-y-2">
                <span className="text-[10px] text-[#66736C] uppercase tracking-wider block font-bold">Stream Purity Audit</span>
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  analysisResult.purity_score >= 75
                    ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#0B5D3B]'
                    : analysisResult.purity_score >= 50
                    ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                    : 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]'
                }`}>
                  {analysisResult.purity_score >= 75 ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#E89A27]" />
                  )}
                  <span>{analysisResult.contamination_level}</span>
                </div>
                <p className="text-[11px] text-[#66736C] leading-relaxed">
                  {analysisResult.purity_score >= 75
                    ? 'High grade material stream suitable for direct baling and mechanical recovery processing.'
                    : 'Non-target contamination detected. Pre-sorting required at depot before recycling.'}
                </p>
              </div>
            </div>

            {/* Material Bars Breakdown */}
            <div className="space-y-3.5">
              {materials.map(mat => {
                const val = analysisResult[mat.key] || 0;
                return (
                  <div key={mat.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#17201B] font-semibold flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${mat.color}`}></span>
                        {mat.name}
                      </span>
                      <span className={`font-mono font-bold ${mat.text}`}>{val.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#E3EAE6] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${mat.color} rounded-full transition-all duration-700`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Operational AI Recommendation */}
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-1 text-xs">
              <span className="font-extrabold text-[#0B5D3B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#16845B]" />
                AI Sorting & Recovery Directive
              </span>
              <p className="text-[#17201B] leading-relaxed">
                {analysisResult.purity_score >= 75
                  ? `Direct routing to Ahmedabad MRF Unit 2 for ${selectedSample?.targetStream || 'Plastic'} stream consolidation.`
                  : 'Assign secondary manual optical sorting pass at Central AMC Sorting Hub before baling.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
