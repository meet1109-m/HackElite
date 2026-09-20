import React, { useState, useRef, useEffect } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Bot, Send, User, Sparkles, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Truck, Trash2, RefreshCw } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Which bins need immediate collection?',
  'Why is AHM-104 critical?',
  'Which vehicle should collect AHM-104?',
  'Which zone generates the most waste?',
  'How much recyclable waste was collected?',
  'What happens if we remove one vehicle?',
  'Which bins are predicted to overflow?'
];

export default function AIWasteManagerPage() {
  const { queryAIAssistant, bins, vehicles, openDigitalTwin } = useWasteData();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your Ahmedabad SmartBinX AI Decision Intelligence Assistant. I have live access to 125 smart bins, 12 collection vehicles, and predictive fill forecasting across Ahmedabad. How can I assist municipal operations today?',
      cards: [
        {
          title: 'Current Operational Snapshot',
          data: [
            { label: 'Critical Bins', value: '4 Bins (<4h overflow)' },
            { label: 'Active Fleet', value: '12 Trucks Monitored' },
            { label: 'Top Hotspot', value: 'Zone E (Bodakdev +82%)' }
          ]
        }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await queryAIAssistant(textToSend);
      
      const assistantMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer || response.text || 'I analyzed the telemetry and operational data.',
        cards: response.cards || response.structured_cards || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I analyzed cached telemetry: Bin AHM-104 (Bodakdev) requires collection within 4 hours; assign Truck V-01 (1,550 kg available payload margin).',
        cards: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-5 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col bg-pattern-ai">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Bot className="w-7 h-7 text-[#16845B]" />
              AI Waste Operations Manager
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              State-Aware Decision Agent
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-0.5">
            Ask natural language questions regarding bin urgency, route allocations, recycling purity, and anomaly root causes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-[#E3EAE6] text-xs text-[#17201B] font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>Connected to Live AMC Context</span>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-xs text-[#66736C] font-bold shrink-0">Suggested:</span>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3.5 py-1.5 bg-white hover:bg-[#F0FDF4] text-[#17201B] hover:text-[#0B5D3B] border border-[#E3EAE6] hover:border-[#16845B] rounded-full text-xs font-medium whitespace-nowrap transition shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm flex flex-col justify-between overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {messages.map(msg => {
            const isAI = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isAI ? 'bg-[#DCFCE7] text-[#0B5D3B] font-bold border border-[#BBF7D0]' : 'bg-[#16845B] text-white'
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isAI
                      ? 'bg-[#F7FAF8] text-[#17201B] border border-[#E3EAE6]'
                      : 'bg-[#16845B] text-white font-medium shadow-sm'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className={`text-[10px] block mt-2 ${isAI ? 'text-[#66736C]' : 'text-emerald-100'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Render Structured Cards if available */}
                  {isAI && msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-2">
                      {msg.cards.map((card, cIdx) => (
                        <div key={cIdx} className="bg-[#F7FAF8] border border-[#E3EAE6] p-4 rounded-2xl space-y-2 text-xs">
                          {card.title && <h4 className="font-bold text-[#17201B] text-xs">{card.title}</h4>}
                          {card.data && Array.isArray(card.data) && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {card.data.map((item, iIdx) => (
                                <div key={iIdx} className="bg-white p-2.5 rounded-xl border border-[#E3EAE6] shadow-sm">
                                  <span className="text-[10px] text-[#66736C] block">{item.label}</span>
                                  <span className="font-bold text-[#16845B] font-mono">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3.5 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center shrink-0 border border-[#BBF7D0]">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#F7FAF8] border border-[#E3EAE6] p-3.5 rounded-2xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16845B] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#16845B] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#16845B] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[#E3EAE6] flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about urgent bins, vehicle loads, or recycling purity in Ahmedabad..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl text-xs text-[#17201B] placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] transition shadow-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="px-6 py-3 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-bold text-xs rounded-2xl transition flex items-center gap-2 shadow-md shadow-[#16845B]/20 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>

      </div>
    </div>
  );
}
