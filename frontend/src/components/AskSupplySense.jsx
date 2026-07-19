import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, Sparkles, LoaderCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AskSupplySense = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm SupplySense AI. Ask anything about inventory, suppliers, forecasts, or risk exposure.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const exampleQueries = [
    'Which suppliers are highest risk?',
    'Which products need restocking?',
    "What's our biggest supply chain risk?",
    'Critical shortage alerts?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/query`, {
        question: inputValue,
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I couldn't process that request. Please try again and confirm the local API is reachable.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (query) => {
    setInputValue(query);
  };

  return (
    <div className="flex h-[calc(100vh-130px)] flex-col gap-4">
      <div className="panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb]/15 text-[#60a5fa]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#f8fbff]">Ask SupplySense</h3>
            <p className="text-sm text-[#8b949e]">AI assistant for planning, risk, and procurement context</p>
          </div>
        </div>
      </div>

      {messages.length === 1 && (
        <div className="panel p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#8b949e]">
            <Sparkles className="h-4 w-4 text-[#f59e0b]" />
            Try a prompt
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleQuery(query)}
                className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-3 text-left text-sm text-[#e6edf3] transition hover:border-[#2563eb]/40"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="panel flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex animate-fade-in ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user' ? 'bg-[#2563eb] text-white' : 'border border-[#30363d] bg-[#0d1117] text-[#e6edf3]'}`}>
                <p className="text-sm leading-6">{message.text}</p>
                <p className={`mt-2 text-[11px] ${message.sender === 'user' ? 'text-blue-100/80' : 'text-[#8b949e]'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="rounded-2xl border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-[#8b949e]">
                <div className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#60a5fa]" />
                  SupplySense is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="panel flex items-center gap-3 p-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about inventory, suppliers, forecasts..."
          disabled={loading}
          className="input-modern flex-1"
        />
        <button type="submit" disabled={loading || !inputValue.trim()} className="btn-primary">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default AskSupplySense;
