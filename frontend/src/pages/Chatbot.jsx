import { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/chatbotService';
import { FiSend, FiUser, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { AiOutlineRobot } from 'react-icons/ai';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial greeting
    const greeting = {
      role: 'assistant',
      content: "👋 Hi! I'm your AI financial assistant. I can analyze your financial data and give you personalized advice. What would you like to know? ",
      timestamp: new Date(),
    };
    setMessages([greeting]);
    loadContext();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContext = async () => {
    const ctx = await chatbotService.getFinancialContext();
    setContext(ctx);
  };

  const scrollToBottom = () => {
    messagesEndRef. current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role:   'user',
      content:   messageText,
      timestamp:  new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(messageText);

      const assistantMessage = {
        role:   'assistant',
        content:  response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role:   'assistant',
        content:   "Sorry, I'm having trouble responding.  Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const cleanSuggestion = suggestion.replace(/[^\w\s? ]/gi, '').trim();
    handleSend(cleanSuggestion);
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setShowClearConfirm(false);
    setMessages([{ role: 'assistant', content: "Chat cleared! How can I help you today?", timestamp: new Date() }]);
  };

  const suggestions = chatbotService.getSuggestedQuestions(context);

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AiOutlineRobot className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
              AI Assistant
            </h1>
            <p className="text-gray-600 mt-1 text-sm hidden sm:block">Get personalized financial advice</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearChat} className="flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <AiOutlineRobot className="w-6 h-6 text-white" />
                </div>
              )}

              <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <AiOutlineRobot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && ! loading && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 mb-3">Suggested questions: </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your finances..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button type="submit" variant="primary" disabled={! input.trim() || loading} className="flex items-center gap-2 px-6">
              {loading ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiSend className="w-5 h-5" />}
              Send
            </Button>
          </form>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Chat"
        message="Are you sure you want to clear the chat history?"
        confirmText="Clear"
        confirmVariant="danger"
        onConfirm={confirmClearChat}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default Chatbot;