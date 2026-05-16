import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Settings, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

const suggestions = [
  'What is Tohnee-7B?',
  'Show me code',
  'Research overview',
  'Tell me a fun fact',
];

const Try = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am Tohnee-7B (Powered by MiniMax). How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('minimax_api_key') || '');
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 24 * 4) + 'px';
    }
  }, [input]);

  const saveConfig = () => {
    localStorage.setItem('minimax_api_key', apiKey);
    setShowConfig(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setShowConfig(true);
      setError('Please enter your MiniMax API Key first.');
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.minimax.chat/v1/text/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-Text-01',
          messages: [
            { role: 'system', content: 'You are Tohnee-7B, a helpful AI assistant created by Tohnee AI Research Lab. You are helpful, creative, and concise.' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.base_resp?.status_msg || errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to MiniMax API.';
      setError(errorMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage} Please check your API key.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const hasUserMessages = messages.some(m => m.role === 'user');

  return (
    <div className="container-custom py-12 h-[calc(100vh-80px)] flex flex-col relative">
      <SEO title="Try Tohnee-7B" description="Try Tohnee-7B — a highly efficient 7B model for reasoning, coding, and autonomous agent workflows." path="/try" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium tracking-tight">Try Tohnee-7B</h1>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 text-gray-500 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
          title="Configure API Key"
        >
          <Settings size={20} />
        </button>
      </div>

      {showConfig && (
        <div className="absolute top-24 right-8 z-10 w-80 bg-white border border-gray-200 shadow-xl rounded-xl p-6">
          <h3 className="font-medium mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">MiniMax API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <p className="text-xs text-gray-500">
              Your API key is stored locally in your browser.
            </p>
            <button
              onClick={saveConfig}
              className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-8 space-y-8 pr-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] as const }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-black text-white' : 'bg-gray-200'
              }`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'assistant' ? 'bg-gray-50' : 'bg-black text-white'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] as const }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full block"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: [0.25, 0.1, 0, 1] as const,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {!hasUserMessages && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.1, 0, 1] as const }}
            className="flex flex-col items-center gap-4 pt-8"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Sparkles size={14} />
              <span>Try asking about</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-lg">
              {suggestions.map((text) => (
                <button
                  key={text}
                  onClick={() => handleSuggestionClick(text)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-500 hover:text-black hover:border-gray-400 transition-colors bg-white"
                >
                  {text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Tohnee-7B..."
          disabled={isLoading}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm disabled:opacity-50 disabled:bg-gray-50 resize-none overflow-y-auto"
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3 p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          disabled={!input.trim() || isLoading}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default Try;
