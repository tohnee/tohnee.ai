import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Bot, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  'What is Tohnee-7B?',
  'Show me code',
  'Research overview',
  'Tell me a fun fact',
];

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const MAX_INPUT_LENGTH = 2000;

const Try = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: makeId(),
      role: 'assistant',
      content: 'Hello! I am Tohnee-7B. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const userMessage = input.trim();
      if (!userMessage || isLoading) return;

      const userMsg: Message = { id: makeId(), role: 'user', content: userMessage };
      const recentMessages = [...messages, userMsg].slice(-20);
      setInput('');
      setIsLoading(true);
      setError('');

      setMessages((prev) => [...prev, userMsg]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: recentMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errMsg =
            (data && typeof data.error === 'string' && data.error) ||
            `Request failed (${response.status})`;
          throw new Error(errMsg);
        }

        const content =
          typeof data.content === 'string' && data.content.length > 0
            ? data.content
            : 'Sorry, I could not generate a response.';

        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: 'assistant', content },
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect.';
        setError(errorMessage);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'assistant',
            content: `Error: ${errorMessage}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages],
  );

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const hasUserMessages = messages.some((m) => m.role === 'user');

  return (
    <div className="container-custom py-12 h-[calc(100vh-80px)] flex flex-col relative">
      <SEO
        title="Try Tohnee-7B"
        description="Try Tohnee-7B - a highly efficient 7B model for reasoning, coding, and autonomous agent workflows."
        path="/try"
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium tracking-tight">Try Tohnee-7B</h1>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Shield size={14} />
          <span>Server-side proxied</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2 text-xs text-gray-500">
        <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
        <span>
          Conversations are processed by Tohnee-7B via a server-side proxy. Your messages are sent
          to our model provider to generate responses. Do not share sensitive information.
        </span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-8 space-y-8 pr-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] as const }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant' ? 'bg-black text-white' : 'bg-gray-200'
                }`}
              >
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'assistant' ? 'bg-gray-50' : 'bg-black text-white'
                }`}
              >
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
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          placeholder="Message Tohnee-7B..."
          disabled={isLoading}
          rows={1}
          maxLength={MAX_INPUT_LENGTH}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
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
      {input.length > MAX_INPUT_LENGTH * 0.8 && (
        <p className="text-right text-xs text-gray-400 mt-1">
          {input.length}/{MAX_INPUT_LENGTH}
        </p>
      )}
    </div>
  );
};

export default Try;
