import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, MessageSquare, CheckCircle } from 'lucide-react';

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <img 
        src={`./Image/Hero.jpg?v=${Date.now()}`}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 50%' }}
      />
      
      {/* Mobile: darker overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70 md:bg-gradient-to-r md:from-slate-900/40 md:via-transparent md:to-transparent"></div>

      <div className="relative z-10 h-full flex items-center px-6 md:px-20">
        <div className="max-w-lg w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 md:mb-6">
            Decision<br />
            Optimization<br />
            Management
          </h1>
          
          <p className="text-sm md:text-base text-white/90 mb-6 md:mb-8 leading-relaxed">
            Get expert-level analysis, risk assessment, and actionable<br className="hidden md:block" />
            recommendations in minutes.
          </p>

          <button
            onClick={() => navigate('/input')}
            className="px-6 md:px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 hover:scale-105 mb-8 md:mb-16 w-full md:w-auto"
          >
            Get Started
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                <Edit3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xs">
                <div className="text-slate-300">Describe your</div>
                <div className="text-white font-semibold">decision</div>
              </div>
            </div>

            <div className="text-cyan-400/50 text-lg md:text-xl hidden md:block">→</div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xs">
                <div className="text-slate-300">Answer key</div>
                <div className="text-white font-semibold">questions</div>
              </div>
            </div>

            <div className="text-cyan-400/50 text-lg md:text-xl hidden md:block">→</div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xs">
                <div className="text-slate-300">Receive expert</div>
                <div className="text-white font-semibold">analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;

