import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const AskSupplySense = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm SupplySense AI. Ask me anything about your supply chain - inventory levels, supplier performance, demand forecasts, or recommendations.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const exampleQueries = [
    "Which suppliers are highest risk?",
    "Which products need restocking?",
    "What's our biggest supply chain risk?",
    "Critical shortage alerts?"
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

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/query', {
        question: inputValue,
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I couldn't process your request. Please try again. Make sure Ollama is running locally.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (query) => {
    setInputValue(query);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 mb-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-2xl shadow-md">
            🤖
          </div>
          <div>
            <h1 className="gradient-text-primary text-2xl font-bold">Ask SupplySense</h1>
            <p className="text-slate-500 text-sm">AI-powered supply chain insights</p>
          </div>
        </div>
      </div>

      {/* Example Queries */}
      {messages.length === 1 && (
        <div className="card-modern mb-6">
          <p className="text-slate-700 text-sm font-semibold mb-4">💡 Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleQuery(query)}
                className="text-left p-3 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 text-primary-900 rounded-lg hover:shadow-md hover:border-primary-300 transition-all duration-200 font-medium text-sm"
              >
                <span className="truncate">"{query}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-md shadow-primary-300'
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-primary-100 opacity-75' : 'text-slate-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-900 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-sm">💭 SupplySense is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="💬 Ask about inventory, suppliers, forecasts..."
          disabled={loading}
          className="input-modern flex-1"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="btn-primary flex-shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default AskSupplySense;
