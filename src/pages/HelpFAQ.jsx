import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function HelpFAQ() {
  const [openIndex, setOpenIndex] = useState(-1);

  // Force repaint on mount to fix scrollbar rendering issue
  React.useEffect(() => {
    // Hide body scrollbar for this page
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      // Restore on unmount
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const faqs = [
    {
      question: 'What is this tool and who is it for?',
      answer: 'This is an AI-powered decision optimization platform designed for professionals across all fields. Whether you\'re a business executive making strategic decisions, an investor evaluating opportunities, an entrepreneur planning product launches, or an individual managing personal life choices, this tool provides data-driven analysis and recommendations. It helps you make better decisions by analyzing multiple factors, identifying risks, and suggesting optimal paths forward.'
    },
    {
      question: 'How does the AI optimization work?',
      answer: 'Our AI analyzes your decision context by first understanding your situation through your description. It then generates 3-5 targeted questions to gather more specific information. Based on your answers, the AI evaluates multiple options and recommends the best solution with detailed analysis including strengths, considerations, implementation roadmap, and risk assessment.'
    },
    {
      question: 'What AI models are supported?',
      answer: 'We support two providers: Groq (free, fast models including GPT-OSS 120B, Llama 4 Scout, Qwen 3) and OpenAI (premium models including GPT-5.2, GPT-5-Mini, GPT-4o, GPT-4 Turbo). Groq models provide excellent results for most decisions and are completely free. OpenAI premium models offer the highest quality analysis with deeper insights, ideal for critical business decisions or complex scenarios requiring maximum accuracy.'
    },
    {
      question: 'Should I use Groq or OpenAI?',
      answer: 'Groq models are perfect for most use cases - they\'re fast, free, and generate accurate, high-quality recommendations. Use OpenAI premium models when you need the absolute best analysis for high-stakes decisions like major investments, business strategy, or critical career moves. Both providers deliver professional results; OpenAI simply offers an extra level of depth and nuance for complex situations.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, all your decision data is stored locally on your device. In Electron mode, data is saved to your file system. In web mode, data is stored in browser localStorage. Your API keys are stored locally and only used when making API calls. We never collect or transmit your data to external servers.'
    },
    {
      question: 'How do I get API keys?',
      answer: 'For Groq (free): Visit console.groq.com, sign up, and create an API key (starts with "gsk_"). For OpenAI (premium): Visit platform.openai.com, create an account, add payment method, and generate an API key (starts with "sk-"). Both keys are entered in Settings and stored securely on your device.'
    },
    {
      question: 'What types of decisions can I optimize?',
      answer: 'Any decision type: Business strategy, marketing campaigns, product development, investment choices, hiring decisions, career moves, technology stack selection, vendor selection, pricing strategy, market entry, partnership opportunities, resource allocation, personal life choices, and more. The AI adapts its analysis to your specific context and industry.'
    },
    {
      question: 'What is Deep Analysis?',
      answer: 'Deep Analysis provides comprehensive insights including: detailed reasoning for the recommendation, step-by-step implementation roadmap, risk analysis with mitigation strategies, success factors and KPIs, potential challenges with solutions, and long-term impact assessment. Click the "Deep Analysis" button on the results page to generate this detailed report.'
    }
  ];

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto overflow-x-hidden p-8 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-white">Help & FAQ</h2>
          <p className="text-slate-300 text-lg mb-8">Everything you need to know about AI-powered decision optimization</p>

          {/* About Section */}
          <div className="glass-card p-8 mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">About This Tool</h3>
            <div className="space-y-4 text-slate-200 leading-relaxed">
              <p>
                This AI-powered decision optimization platform helps professionals and individuals make better decisions across all areas of life and business. Whether you're managing investments, planning business strategy, making career choices, or handling personal decisions, our AI provides data-driven analysis and actionable recommendations.
              </p>
              <p>
                <span className="font-semibold text-white">Perfect for:</span> Business executives, investors, entrepreneurs, product managers, marketers, consultants, career professionals, and anyone facing important decisions.
              </p>
              <p>
                <span className="font-semibold text-white">Two AI Options:</span> Use Groq's free models for fast, accurate analysis on most decisions. Upgrade to OpenAI premium models (GPT-5.2, GPT-4o) for the highest quality insights on critical, high-stakes decisions. Both deliver professional results - OpenAI simply offers deeper analysis for complex scenarios.
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/5 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                  >
                    <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openIndex === index && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpFAQ;
