import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit3, BarChart3, MessageSquare, Settings, Info, Sparkles } from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Edit3, label: 'New Decision', path: '/input' },
    { icon: BarChart3, label: 'My Decisions', path: '/decisions' },
    { icon: MessageSquare, label: 'Q&A Chat', path: '/chat' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Info, label: 'Help', path: '/help' }
  ];

  return (
    <div className="w-20 bg-slate-900/50 backdrop-blur-sm border-r border-white/10 flex flex-col items-center pt-[calc(50vh-205px)] gap-6">
      <button
        onClick={() => navigate('/')}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform"
        title="Home"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
              isActive 
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/10 shadow-transparent'
            }`}
            title={item.label}
          >
            <Icon className="w-6 h-6" />
          </button>
        );
      })}
    </div>
  );
}

export default Sidebar;
