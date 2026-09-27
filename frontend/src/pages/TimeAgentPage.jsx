import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  Send, Bot, User, Sparkles, CheckCircle2, 
  HelpCircle, Mic, AlertCircle, Clock, Calendar, 
  Check, X, RefreshCw, MessageSquare, Terminal 
} from 'lucide-react';

export function TimeAgentPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello Supervisor Ravi Kumar! I am your AI Time Agent. You can report on-site activity starts, progress, or completions naturally by text or voice.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const { showNotification, currentUser } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setLoading(true);

    try {
      const res = await api.sendTimeAgentMessage({
        message: textToSend,
        supervisor: currentUser.name
      });

      if (res.success) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.clarificationPrompt || 'I have extracted the site activity event and mapped it to the baseline schedule.',
          data: res,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: 'I could not process that update. Please try rephrasing with the activity name and time.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      showNotification('Time Agent error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmActivity = async (payload) => {
    setLoading(true);
    try {
      const res = await api.sendTimeAgentMessage({
        action: 'confirm',
        pendingData: payload,
        supervisor: currentUser.name
      });

      if (res.success) {
        showNotification('Activity confirmed and logged to project ledger!', 'success');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'bot',
            text: `✅ Confirmed! Logged "${payload.extracted.activity}" (${payload.suggestion?.suggestedActivityId || 'L6 Activity'}) into the project progress database.`,
            isConfirmed: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      showNotification('Confirmation failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulateVoiceRecording = () => {
    setIsRecording(true);
    showNotification('Listening to microphone on site...', 'info');
    setTimeout(() => {
      setIsRecording(false);
      handleSendMessage('Line 24 spool erection started today at 9:30 AM.');
    }, 1800);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Time Agent Header */}
      <div className="p-4 bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Time Agent — Supervisor Conversational Assistant
              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Online
              </span>
            </h2>
            <p className="text-xs text-blue-200">
              Low-friction natural language data capture for actual L5/L6 start/end events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={simulateVoiceRecording}
            disabled={isRecording || loading}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isRecording 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {isRecording ? 'Listening...' : 'Simulate Voice'}
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Try speaking:
        </span>
        <button
          onClick={() => handleSendMessage('Line 24 spool erection started today at 9:30 AM.')}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap transition-colors"
        >
          "Line 24 spool erection started today at 9:30 AM"
        </button>
        <button
          onClick={() => handleSendMessage('Electrical cable tray installation started today at 10 AM.')}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap transition-colors"
        >
          "Electrical cable tray installation started today at 10 AM"
        </button>
        <button
          onClick={() => handleSendMessage('Cable tray installation finished yesterday.')}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap transition-colors"
        >
          "Cable tray installation finished yesterday" (Ambiguity test)
        </button>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}
            >
              <p className="leading-relaxed font-medium">{msg.text}</p>

              {/* Structured Extracted Card */}
              {msg.data?.extracted && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Extracted Site Parameters
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-700">
                      {msg.data.extracted.discipline}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Activity:</span>
                      <span className="font-semibold text-slate-800">{msg.data.extracted.activity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Line / Tag:</span>
                      <span className="font-semibold text-slate-800">{msg.data.extracted.line}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Event Type:</span>
                      <span className="font-semibold text-slate-800">{msg.data.extracted.actionType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Reported Timestamp:</span>
                      <span className="font-mono text-slate-800">{msg.data.extracted.displayDate || msg.data.extracted.timestamp}</span>
                    </div>
                  </div>

                  {/* Suggested Schedule Link */}
                  {msg.data.suggestion && msg.data.suggestion.suggestedActivityId && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500">Suggested Schedule Activity:</span>
                        <span className="font-bold text-emerald-600">
                          {Math.round((msg.data.suggestion.finalConfidence || 0) * 100)}% Confidence
                        </span>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-900 font-bold text-xs flex items-center gap-1.5">
                        <span className="font-mono px-1.5 py-0.5 bg-blue-200/60 rounded text-[10px]">
                          {msg.data.suggestion.suggestedActivityId}
                        </span>
                        {msg.data.suggestion.activityName}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!msg.isConfirmed && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleConfirmActivity(msg.data)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm & Log
                      </button>
                      <button
                        onClick={() => setInputText(`Line 24 spool erection started at 09:30 AM on 2026-09-25`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )}

              <span className={`text-[10px] mt-1.5 block ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a progress update (e.g. 'Line 24 spool erection started today at 9:30 AM')..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 font-medium"
          />

          <button
            type="button"
            onClick={simulateVoiceRecording}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors"
            title="Simulate Voice"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
