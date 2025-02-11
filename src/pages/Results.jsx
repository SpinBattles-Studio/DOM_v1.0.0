import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, MessageSquare, Save, FileText } from 'lucide-react';
import { generateOptimization } from '../services/aiService';
import { saveDecision } from '../services/storageService';
import { callGroqAPI } from '../services/aiService';
import { ResultsSkeleton } from '../components/SkeletonLoader';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [decisionData, setDecisionData] = useState(null);
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [loadingDeepAnalysis, setLoadingDeepAnalysis] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      const { description, questions, answers } = location.state || {};
      if (!description) {
        navigate('/input');
        return;
      }

      setDecisionData({ description, questions, answers });

      try {
        const optimization = await generateOptimization(description, questions, answers);
        setResults(optimization);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error generating optimization. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleSaveDecision = async () => {
    if (!decisionData || !results) return;

    try {
      const decision = {
        title: results.bestOption?.title || 'Decision',
        description: decisionData.description,
        questions: decisionData.questions,
        answers: decisionData.answers,
        results: {
          strengths: results.bestOption?.strengths || [],
          considerations: results.bestOption?.considerations || []
        },
        bestOption: results.bestOption?.description || '',
        status: 'completed',
        chartData: results.chartData || [],
        timeline: results.timeline || [],
        metrics: results.metrics || [],
        options: results.options || [],
        deepAnalysis: deepAnalysis || null
      };

      await saveDecision(decision);
      setSaved(true);
    } catch (error) {
      console.error('Error saving decision:', error);
      toast.error('Failed to save decision');
    }
  };

  const handleDeepAnalysis = async () => {
    if (!decisionData || !results) return;
    
    // Toggle visibility if already loaded
    if (deepAnalysis) {
      setDeepAnalysis(null);
      return;
    }
    
    setLoadingDeepAnalysis(true);
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert decision analyst. Provide comprehensive analysis in exactly 6 well-structured sections. Each section must have substantial content with multiple paragraphs and bullet points. Use plain text without markdown symbols.'
        },
        {
          role: 'user',
          content: `Provide deep analysis for this decision:

Decision: ${decisionData.description}
Recommended Option: ${results.bestOption?.title}

Structure your response in EXACTLY these 6 sections with detailed content:

1. Detailed Reasoning
Explain in 2-3 paragraphs why this is the best choice, connecting it to the user's specific situation and strengths.

2. Implementation Roadmap
Provide a step-by-step plan with 5-7 concrete action items, each with timeframes.

3. Risk Analysis & Mitigation
List 3-4 major risks with specific mitigation strategies for each.

4. Success Factors & KPIs
Describe 3-4 key success factors and 4-5 measurable KPIs to track progress.

5. Challenges & Solutions
Identify 3-4 potential challenges with practical solutions for each.

6. Long-term Impact
Discuss career growth, financial prospects, skill development, and life satisfaction in 2-3 paragraphs.

IMPORTANT: 
- Write in clear paragraphs, not just bullet points
- Each section should have substantial content (not just a title)
- Use bullet points (start with *) only for lists within sections
- Do NOT use markdown symbols like ###, **, or #
- Separate sections with blank lines`
        }
      ];

      const response = await callGroqAPI(messages);
      // Clean up markdown symbols
      const cleanedResponse = response
        .replace(/###/g, '')
        .replace(/\*\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .trim();
      setDeepAnalysis(cleanedResponse);
    } catch (error) {
      console.error('Deep analysis error:', error);
      toast.error('Failed to generate deep analysis. Please try again.');
    } finally {
      setLoadingDeepAnalysis(false);
    }
  };

  if (loading) {
    return <ResultsSkeleton />;
  }

  // Calculate success probability from metrics
  const calculateSuccessProbability = () => {
    if (!results?.chartData) return 0;
    
    const impact = results.chartData.find(d => d.name === 'Impact')?.value || 0;
    const feasibility = results.chartData.find(d => d.name === 'Feasibility')?.value || 0;
    const risk = results.chartData.find(d => d.name === 'Risk')?.value || 0;
    
    // Formula: (Impact * 0.4 + Feasibility * 0.4 - Risk * 0.2)
    // Higher impact and feasibility increase success, higher risk decreases it
    const probability = Math.round((impact * 0.4) + (feasibility * 0.4) + ((100 - risk) * 0.2));
    return Math.max(0, Math.min(100, probability)); // Clamp between 0-100
  };

  const successProbability = calculateSuccessProbability();

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white">Optimization Results</h2>
          <button
            onClick={handleDeepAnalysis}
            disabled={loadingDeepAnalysis}
            className="px-6 py-3 disabled:bg-none disabled:bg-slate-800/90 disabled:backdrop-blur-xl disabled:border disabled:border-cyan-400/40 disabled:shadow-2xl disabled:shadow-cyan-500/20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 flex items-center gap-2"
          >
            {loadingDeepAnalysis ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : deepAnalysis ? (
              'Hide Deep Analysis'
            ) : (
              'Deep Analysis'
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main recommendation card */}
          <div className="col-span-2 flex flex-col">
            <div className="glass-card p-8 flex-1 flex flex-col">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="text-sm text-slate-400 mb-1">Top Recommended</div>
                <h3 className="text-3xl font-bold text-white mb-3">{results?.bestOption?.title}</h3>
                <p className="text-slate-200 text-lg leading-relaxed">{results?.bestOption?.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="glass-card-light p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-green-400 text-lg">Strengths</h4>
                </div>
                <ul className="space-y-2">
                  {results?.bestOption?.strengths?.map((s, i) => (
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
                  {results?.bestOption?.considerations?.map((c, i) => (
                    <li key={i} className="text-sm text-slate-200 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Metrics table */}
            {results?.metrics && (
              <div className="mt-6 glass-card-light p-5">
                <h4 className="font-semibold text-white mb-4">
                  Key Metrics
                </h4>
                <div className="space-y-2">
                  {results.metrics.map((metric, i) => (
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

          {/* Charts column */}
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
                    data={results?.chartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={(data, index, e) => {
                      const currentColor = COLORS[index % COLORS.length];
                      const brighterColor = currentColor === '#3b82f6' ? '#60a5fa' : 
                                           currentColor === '#60a5fa' ? '#93c5fd' : 
                                           currentColor === '#93c5fd' ? '#bfdbfe' : '#dbeafe';
                      e.target.setAttribute('fill', brighterColor);
                      e.target.style.cursor = 'pointer';
                    }}
                    onMouseLeave={(data, index, e) => {
                      e.target.setAttribute('fill', COLORS[index % COLORS.length]);
                    }}
                  >
                    {(results?.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                {(results?.chartData || []).map((item, i) => (
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
                  <BarChart data={results?.timeline || []}>
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
              {results?.timeline && (
                <div className="mt-4 space-y-2">
                  {results.timeline.map((item, i) => (
                    <div key={i} className="text-xs text-slate-300">
                      <span className="font-semibold">{item.phase}:</span> {item.task}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deep Analysis Section */}
        {deepAnalysis && (
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Deep Analysis</h3>
            <div className="space-y-8">
              {(() => {
                // Define the 6 main sections we expect
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
                
                // Parse the text and group by main sections
                deepAnalysis.split('\n').forEach(line => {
                  const trimmed = line.trim();
                  if (!trimmed) return;
                  
                  // Check if this line contains a main section title
                  const matchedTitle = sectionTitles.find(title => 
                    trimmed.toLowerCase().includes(title.toLowerCase())
                  );
                  
                  if (matchedTitle) {
                    // If we have a current section with content, save it
                    if (currentSection && currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    // Start new section only if we don't already have one with this title
                    if (!sections.find(s => s.title === matchedTitle)) {
                      currentSection = { title: matchedTitle, content: [] };
                    } else {
                      currentSection = null; // Skip duplicate
                    }
                  } else if (currentSection) {
                    // Remove leading numbers like "1. ", "2. ", etc.
                    const cleanedLine = trimmed.replace(/^\d+\.\s*/, '');
                    if (cleanedLine && cleanedLine !== currentSection.title) {
                      currentSection.content.push(cleanedLine);
                    }
                  }
                });
                
                // Add the last section if it has content
                if (currentSection && currentSection.content.length > 0) {
                  sections.push(currentSection);
                }
                
                // Filter out sections with no content
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

        {/* Alternative options */}
        {results?.options && results.options.length > 0 && (
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Alternative Options</h3>
            <div className="grid grid-cols-2 gap-6">
              {results.options.slice(0, 2).map((option, i) => (
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

        <div className="flex justify-center gap-4 pt-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/input')}
            className="glass-card flex-1 px-8 py-3 text-white font-semibold transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
          >
            New Decision
          </button>
          <button
            onClick={handleSaveDecision}
            disabled={saved}
            className="glass-card flex-1 px-8 py-3 disabled:cursor-not-allowed text-white font-semibold transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Saved!
              </>
            ) : (
              'Save Decision'
            )}
          </button>
          <button
            onClick={() => navigate('/chat', { 
              state: { 
                decision: decisionData?.description,
                recommendation: results?.bestOption?.title,
                context: `I just analyzed a decision about: ${decisionData?.description}. The recommended option is: ${results?.bestOption?.title}. ${results?.bestOption?.description}`
              }
            })}
            className="glass-card flex-1 px-8 py-3 text-white font-semibold transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
          >
            Continue Discussion
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
