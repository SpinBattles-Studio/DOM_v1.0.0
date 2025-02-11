import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { callGroqAPI } from '../services/aiService';

function QAChat() {
  const location = useLocation();
  const contextFromResults = location.state?.context;
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: contextFromResults 
        ? `I have the context from your recent decision analysis. ${contextFromResults}\n\nWhat would you like to discuss further?`
        : 'Hello! I\'m here to help you with any questions about your optimization results. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const exampleQuestions = [
    'What are the main risks of this approach?',
    'How can I measure success for this decision?',
    'What are the most effective customer retention strategies?',
    'What if my target audience changes over time?'
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = [
        {
          role: 'system',
          content: contextFromResults 
            ? `You are a helpful AI assistant discussing a decision analysis. Context: ${contextFromResults}. Use this context to provide relevant answers.`
            : 'You are a helpful AI assistant for decision optimization discussions.'
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: input }
      ];

      // Call AI with full conversation context
      const response = await callGroqAPI(conversationHistory);
      
      const aiMessage = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key in Settings and try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-white">Q&A Chat</h2>
        
        <div className="grid grid-cols-3 gap-6" style={{height: '700px'}}>
          {/* Chat area */}
          <div className="col-span-2 glass-card p-6 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-base leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="text-base leading-relaxed prose prose-invert prose-sm max-w-none
                        prose-headings:text-cyan-300 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-3
                        prose-p:text-slate-200 prose-p:mb-2
                        prose-ul:text-slate-200 prose-ul:ml-4 prose-ul:space-y-1
                        prose-ol:text-slate-200 prose-ol:ml-4 prose-ol:space-y-1
                        prose-li:text-slate-200
                        prose-strong:text-white prose-strong:font-semibold
                        prose-table:w-full prose-table:border-collapse
                        prose-th:bg-slate-700 prose-th:text-cyan-300 prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-slate-600
                        prose-td:p-2 prose-td:border prose-td:border-slate-600 prose-td:text-slate-200
                        prose-code:text-cyan-300 prose-code:bg-slate-700 prose-code:px-1 prose-code:rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask a question about your decision..."
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-cyan-400/70 disabled:to-blue-500/70 disabled:cursor-not-allowed rounded-xl transition-all shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Example questions sidebar */}
          <div className="flex flex-col gap-4 h-full">
            <div className="glass-card p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4">Example Questions</h3>
              <div className="space-y-3 flex-1">
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-slate-300 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Ask specific questions for better answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Reference your decision context</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Request clarification when needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 mt-1">•</span>
                  <span>Continue from your analysis results page</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QAChat;
