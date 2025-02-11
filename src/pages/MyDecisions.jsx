import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, TrendingUp, Search, Trash2 } from 'lucide-react';
import { getDecisions, deleteDecision } from '../services/storageService';

function MyDecisions() {
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    const data = await getDecisions();
    setDecisions(data);
  };

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'draft' && d.status === 'draft') ||
                         (filter === 'completed' && d.status === 'completed');
    return matchesSearch && matchesFilter;
  });

  const handleDecisionClick = (decision) => {
    if (decision.status === 'draft') {
      // Go back to input page with pre-filled data
      navigate('/input', { state: { draftDescription: decision.description } });
    } else {
      // Go to details page
      navigate(`/decisions/${decision.id}`);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent card click
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="text-lg">Delete this decision?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteDecision(id);
              loadDecisions();
              toast.success('Decision deleted');
            }}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white">My Decisions</h2>
          <button
            onClick={() => navigate('/input')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold transition-all shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60"
          >
            New Decision
          </button>
        </div>

        {/* Filters and search */}
        <div className="glass-card p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search decisions..."
                className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'completed' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'draft' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Drafts
              </button>
            </div>
          </div>
        </div>

        {/* Decisions grid */}
        <div className="grid gap-5">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              onClick={() => handleDecisionClick(decision)}
              className="glass-card p-6 cursor-pointer hover:bg-white/15 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-slate-400 transition-colors flex-1">
                      {decision.title}
                    </h3>
                    {decision.status === 'draft' && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-full flex-shrink-0">
                        Draft
                      </span>
                    )}
                    {decision.status === 'completed' && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full flex-shrink-0">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mb-4 line-clamp-2">{decision.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(decision.created_at).toLocaleDateString()}</span>
                    </div>
                    {decision.status === 'completed' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Optimized</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 ml-6">
                  {decision.status === 'completed' && decision.best_option && (
                    <div className="px-4 py-2 bg-cyan-500/20 rounded-lg max-w-xs">
                      <div className="text-xs text-slate-400 mb-1">Best Option</div>
                      <div className="text-sm text-white font-semibold line-clamp-2">{decision.best_option}</div>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => handleDelete(e, decision.id)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredDecisions.length === 0 && (
            <div className="glass-card p-16 text-center">
              <h3 className="text-3xl font-bold text-slate-300 mb-3">No Decisions Yet</h3>
              <p className="text-slate-400 text-lg mb-8">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first decision'}
              </p>
              <button
                onClick={() => navigate('/input')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold transition-all shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60"
              >
                Create Decision
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyDecisions;
