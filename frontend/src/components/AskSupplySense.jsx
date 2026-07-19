import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, MessageCircle, Loader } from 'lucide-react';

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
    "Which suppliers are highest risk this week?",
    "Which products need urgent restocking?",
    "What is our biggest supply chain risk right now?",
    "Which warehouse has the most critical shortage?"
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

    // Add user message
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
    <div className="p-6 flex flex-col h-[calc(100vh-120px)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
        <MessageCircle className="w-6 h-6 text-supply-accent" />
        <h1 className="text-white font-bold text-2xl">Ask SupplySense</h1>
      </div>

      {/* Example Queries */}
      {messages.length === 1 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleQuery(query)}
                className="text-left p-3 bg-supply-bg border border-gray-600 rounded-lg hover:border-supply-accent transition-colors text-sm text-gray-300 hover:text-white"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-supply-accent text-white'
                  : 'bg-supply-card border border-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-supply-card border border-gray-700 text-gray-100 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <p className="text-sm">SupplySense is thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me about inventory, suppliers, forecasts..."
          disabled={loading}
          className="flex-1 bg-supply-card border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-supply-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="bg-supply-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
};

export default AskSupplySense;
