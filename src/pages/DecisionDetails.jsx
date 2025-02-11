import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getDecision, deleteDecision } from '../services/storageService';

function DecisionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState(null);
  const [deepAnalysis, setDeepAnalysis] = useState(null);

  useEffect(() => {
    loadDecision();
  }, [id]);

  const loadDecision = async () => {
    try {
      const data = await getDecision(id);
      console.log('Loaded decision:', data);
      setDecision(data);
      
      // Load deep analysis if it exists
      if (data.deep_analysis) {
        const analysis = typeof data.deep_analysis === 'string' ? data.deep_analysis : data.deep_analysis;
        setDeepAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error loading decision:', error);
      toast.error('Failed to load decision');
      navigate('/decisions');
    }
  };

  const handleDelete = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="text-lg">Delete this decision?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteDecision(id);
              toast.success('Decision deleted');
              navigate('/decisions');
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

  if (!decision) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-300">Loading...</div>
      </div>
    );
  }

  const questions = decision.questions ? (typeof decision.questions === 'string' ? JSON.parse(decision.questions) : decision.questions) : [];
  const answers = decision.answers ? (typeof decision.answers === 'string' ? JSON.parse(decision.answers) : decision.answers) : {};
  const results = decision.results ? (typeof decision.results === 'string' ? JSON.parse(decision.results) : decision.results) : {};
  const chartData = decision.chart_data ? (typeof decision.chart_data === 'string' ? JSON.parse(decision.chart_data) : decision.chart_data) : [
    { name: 'Impact', value: 70 },
    { name: 'Feasibility', value: 85 },
    { name: 'Risk', value: 45 }
  ];
  const timeline = decision.timeline ? (typeof decision.timeline === 'string' ? JSON.parse(decision.timeline) : decision.timeline) : [];
  const metrics = decision.metrics ? (typeof decision.metrics === 'string' ? JSON.parse(decision.metrics) : decision.metrics) : [];
  const options = decision.options ? (typeof decision.options === 'string' ? JSON.parse(decision.options) : decision.options) : [];

  const calculateSuccessProbability = () => {
    if (!chartData) return 0;
    
    const impact = chartData.find(d => d.name === 'Impact')?.value || 0;
    const feasibility = chartData.find(d => d.name === 'Feasibility')?.value || 0;
    const risk = chartData.find(d => d.name === 'Risk')?.value || 0;
    
    const probability = Math.round((impact * 0.4) + (feasibility * 0.4) + ((100 - risk) * 0.2));
    return Math.max(0, Math.min(100, probability));
  };

  const successProbability = calculateSuccessProbability();
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center mb-8 relative">
          <button 
            onClick={() => navigate('/decisions')} 
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Decisions
          </button>
          <h2 className="text-4xl font-bold text-white fixed left-1/2 transform -translate-x-1/2">Optimization Results</h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col">
            <div className="glass-card p-8 flex-1 flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="text-sm text-slate-400 mb-1">Top Recommended</div>
                  <h3 className="text-3xl font-bold text-white mb-3">{decision.title}</h3>
                  <p className="text-slate-200 text-lg leading-relaxed">{decision.best_option}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="glass-card-light p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-green-400 text-lg">Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {results.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-slate-200 flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card-light p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold text-yellow-400 text-lg">Considerations</h4>
                  </div>
                  <ul className="space-y-2">
                    {results.considerations?.map((c, i) => (
                      <li key={i} className="text-sm text-slate-200 flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {metrics && metrics.length > 0 && (
                <div className="mt-6 glass-card-light p-5">
                  <h4 className="font-semibold text-white mb-4">
                    Key Metrics
                  </h4>
                  <div className="space-y-2">
                    {metrics.map((metric, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                        <span className="text-slate-300">{metric.name}</span>
                        <span className="font-semibold text-white">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="glass-card p-6 flex-1">
              <h4 className="text-xl font-bold text-white mb-4">Decision Analysis</h4>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-white">{successProbability}%</div>
                <div className="text-sm text-slate-300 mt-1">Success Probability</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={(data, index, e) => {
                      const currentColor = COLORS[index];
                      const brighterColor = currentColor === '#3b82f6' ? '#60a5fa' : 
                                           currentColor === '#60a5fa' ? '#93c5fd' : '#bfdbfe';
                      e.target.setAttribute('fill', brighterColor);
                      e.target.style.cursor = 'pointer';
                    }}
                    onMouseLeave={(data, index, e) => {
                      e.target.setAttribute('fill', COLORS[index]);
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      border: '1px solid rgba(34, 211, 238, 0.4)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#fff',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 10px 40px rgba(34, 211, 238, 0.2)'
                    }}
                    labelStyle={{ color: '#93c5fd' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {chartData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-white font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 flex-1">
              <h4 className="text-lg font-bold text-white mb-4">Implementation Timeline</h4>
              <div className="-ml-10">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={timeline}>
                    <XAxis dataKey="phase" stroke="#93c5fd" style={{fontSize: '12px'}} />
                    <YAxis stroke="#93c5fd" style={{fontSize: '12px'}} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                        border: '1px solid rgba(34, 211, 238, 0.4)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#fff',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 10px 40px rgba(34, 211, 238, 0.2)'
                      }}
                      labelStyle={{ color: '#93c5fd' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={false}
                    />
                    <Bar 
                      dataKey="progress" 
                      fill="#3b82f6" 
                      radius={[8, 8, 0, 0]}
                      onMouseEnter={(data, index, e) => {
                        e.target.setAttribute('fill', '#60a5fa');
                      }}
                      onMouseLeave={(data, index, e) => {
                        e.target.setAttribute('fill', '#3b82f6');
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {timeline && timeline.length > 0 && (
                <div className="mt-4 space-y-2">
                  {timeline.map((item, i) => (
                    <div key={i} className="text-xs text-slate-300">
                      <span className="font-semibold">{item.phase}:</span> {item.task}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {options && options.length > 0 && (
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Alternative Options</h3>
            <div className="grid grid-cols-2 gap-6">
              {options.slice(0, 2).map((option, i) => (
                <div key={i} className="glass-card-light p-6">
                  <h4 className="text-xl font-bold text-white mb-3">{option.title}</h4>
                  <p className="text-slate-300 mb-4">{option.description}</p>
                  <div className="text-sm text-slate-400">
                    <span className="font-semibold">Key benefit:</span> {option.strengths?.[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {deepAnalysis && (
          <div className="glass-card p-8 mt-6">
            <h3 className="text-2xl font-bold text-white mb-6">Deep Analysis</h3>
            <div className="space-y-8">
              {(() => {
                const sectionTitles = [
                  'Detailed Reasoning',
                  'Implementation Roadmap',
                  'Risk Analysis',
                  'Success Factors',
                  'Challenges',
                  'Long-term Impact'
                ];
                
                const sections = [];
                let currentSection = null;
                
                deepAnalysis.split('\n').forEach(line => {
                  const trimmed = line.trim();
                  if (!trimmed) return;
                  
                  const matchedTitle = sectionTitles.find(title => 
                    trimmed.toLowerCase().includes(title.toLowerCase())
                  );
                  
                  if (matchedTitle) {
                    if (currentSection && currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    if (!sections.find(s => s.title === matchedTitle)) {
                      currentSection = { title: matchedTitle, content: [] };
                    } else {
                      currentSection = null;
                    }
                  } else if (currentSection) {
                    const cleanedLine = trimmed.replace(/^\d+\.\s*/, '');
                    if (cleanedLine && cleanedLine !== currentSection.title) {
                      currentSection.content.push(cleanedLine);
                    }
                  }
                });
                
                if (currentSection && currentSection.content.length > 0) {
                  sections.push(currentSection);
                }
                
                return sections.filter(s => s.content.length > 0).map((section, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 py-3">
                    <h4 className="text-xl font-bold text-slate-400 mb-4">
                      {index + 1}. {section.title}
                    </h4>
                    <div className="space-y-3 text-slate-200">
                      {section.content.map((line, lineIndex) => {
                        if (line.startsWith('*') || line.startsWith('•')) {
                          return (
                            <div key={lineIndex} className="flex items-start gap-3 ml-4">
                              <span className="text-slate-500 mt-1.5">•</span>
                              <span className="flex-1 leading-relaxed">{line.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        return (
                          <p key={lineIndex} className="leading-relaxed text-base">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="glass-card p-8 mt-6">
            <h3 className="text-2xl font-bold text-white mb-6">Questions & Answers</h3>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="glass-card-light p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">Q{i + 1}</span>
                    </div>
                    <p className="text-white font-medium pt-1">{q}</p>
                  </div>
                  <div className="ml-11 text-slate-300">{answers[i]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 pt-4 max-w-4xl mx-auto mt-6">
          <button
            onClick={() => navigate('/input')}
            className="glass-card flex-1 px-8 py-3 text-white font-semibold transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
          >
            New Decision
          </button>
          <button
            onClick={handleDelete}
            className="glass-card flex-1 px-8 py-3 text-white font-semibold transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="glass-card flex-1 px-8 py-3 text-white font-semibold transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
          >
            Continue Discussion
          </button>
        </div>
      </div>
    </div>
  );
}

export default DecisionDetails;
