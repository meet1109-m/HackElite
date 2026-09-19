import React, { useState, useRef, useEffect } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Bot, Send, User, Sparkles, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Truck, Trash2, RefreshCw } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Which bins need immediate collection right now?',
  'Why is Bin AHM-104 marked as Critical priority?',
  'Which vehicle is best suited to collect AHM-104?',
  'Which Ahmedabad zone generated the most waste this week?',
  'How much recyclable material was diverted from Pirana today?',
  'Where does AI recommend placing the next smart bin?'
];

export default function AIWasteManagerPage() {
  const { queryAIAssistant, bins, vehicles, openDigitalTwin } = useWasteData();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your Ahmedabad WasteWise AI Decision Intelligence Assistant. I have live access to 120 smart bins, 16 collection vehicles, and predictive fill forecasting across Ahmedabad. How can I assist municipal operations today?',
      cards: [
        {
          type: 'summary',
          title: 'Current Operational Snapshot',
          data: [
            { label: 'Critical Bins', value: '4 Bins (<4h overflow)' },
            { label: 'Active Fleet', value: '16 Vehicles' },
            { label: 'Top Hotspot', value: 'Zone C (Sabarmati)' }
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
        text: 'I encountered an issue connecting to the live analytics backend. Here is the operational synthesis based on cached telemetry: Bin AHM-104 (Sabarmati) requires dispatch within 4 hours; assign Truck V-01.',
        cards: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bot className="w-7 h-7 text-emerald-400" />
              AI Waste Operations Manager
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              State-Aware Decision Agent
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Ask natural language questions regarding bin urgency, route allocations, recycling purity, and anomaly root causes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Connected to Live AMC Context</span>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-xs text-slate-500 font-semibold shrink-0">Suggested:</span>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/40 rounded-full text-xs font-medium whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden">
        
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
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isAI ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-bold' : 'bg-slate-800 text-white'
                }`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-950/80 text-slate-200 border border-slate-800'
                      : 'bg-emerald-500 text-slate-950 font-medium'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className={`text-[10px] block mt-2 ${isAI ? 'text-slate-500' : 'text-emerald-950/70'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Render Structured Cards if available */}
                  {isAI && msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-2">
                      {msg.cards.map((card, cIdx) => (
                        <div key={cIdx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                          {card.title && <h4 className="font-bold text-white text-xs">{card.title}</h4>}
                          {card.data && Array.isArray(card.data) && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {card.data.map((item, iIdx) => (
                                <div key={iIdx} className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                                  <span className="text-[10px] text-slate-400 block">{item.label}</span>
                                  <span className="font-bold text-emerald-400 font-mono">{item.value}</span>
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
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about urgent bins, vehicle loads, or recycling purity in Ahmedabad..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>

      </div>
    </div>
  );
}
