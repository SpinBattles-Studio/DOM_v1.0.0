import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { generateQuestions } from '../services/aiService';
import { saveDecision } from '../services/storageService';

function DecisionInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const draftDescription = location.state?.draftDescription || '';
  
  const [description, setDescription] = useState(draftDescription);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input');
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    { name: 'Career Decision', text: 'I am considering a career change. My current role is [role] and I am thinking about moving to [new role/industry]. What factors should I consider?' },
    { name: 'Business Strategy', text: 'I need to decide on the best growth strategy for my business. Current situation: [describe]. What approach should I take?' },
    { name: 'Investment Choice', text: 'I am evaluating an investment opportunity in [area]. Budget: [amount]. What should I analyze before deciding?' },
    { name: 'Product Launch', text: 'I am planning to launch a new product/service: [describe]. What key decisions do I need to make for a successful launch?' },
    { name: 'Hiring Decision', text: 'I need to hire for [position]. I have [number] candidates with different strengths. What criteria should guide my decision?' },
    { name: 'Marketing Campaign', text: 'I am planning a marketing campaign for [product/service]. Budget: [amount]. What channels and strategies should I prioritize?' },
    { name: 'Technology Stack', text: 'I need to choose a technology stack for [project]. Requirements: [list]. What factors should influence my decision?' }
  ];

  const handleSaveDraft = async () => {
    if (!description.trim()) {
      toast.error('Please enter a decision description first');
      return;
    }

    try {
      const draft = {
        title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
        description: description,
        questions: [],
        answers: {},
        results: { strengths: [], considerations: [] },
        bestOption: '',
        status: 'draft',
        chartData: [],
        timeline: [],
        metrics: [],
        options: []
      };

      await saveDecision(draft);
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const handleTemplateSelect = (template) => {
    setDescription(template.text);
    setShowTemplates(false);
  };

  const handleGenerateQuestions = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const generatedQuestions = await generateQuestions(description);
      setQuestions(generatedQuestions);
      setStep('questions');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.message || 'Error generating questions. Please check your API key in Settings.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleSubmit = () => {
    navigate('/results', { state: { description, questions, answers } });
  };

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i]?.trim());

  return (
    <div className="min-h-screen p-8 flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        {step === 'input' && (
          <div className="glass-card p-10">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white">Describe Your Decision Context</h2>
              <p className="text-slate-200 mt-2 text-lg">
                Describe your decision context. AI will generate questions to optimize it.
              </p>
            </div>
            
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I need to increase sales for my online store. What should I focus on to achieve the best results?"
                className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-xl p-6 text-white text-lg placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all resize-none"
              />
            </div>

            {/* Toolbar at bottom */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  className="glass-card px-4 py-2 text-white font-medium transition-all hover:border-cyan-400/60 hover:shadow-md hover:shadow-cyan-500/35"
                >
                  Save Draft
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="glass-card px-4 py-2 text-white font-medium transition-all hover:border-cyan-400/60 hover:shadow-md hover:shadow-cyan-500/35"
                  >
                    Templates
                  </button>

                  {showTemplates && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/50" 
                        onClick={() => setShowTemplates(false)}
                      ></div>
                      <div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800/95 backdrop-blur-xl p-2 z-50 shadow-2xl max-h-96 overflow-y-auto border border-cyan-400/30 rounded-xl">
                        {templates.map((template, i) => (
                          <button
                            key={i}
                            onClick={() => handleTemplateSelect(template)}
                            className="w-full text-left px-4 py-3 hover:bg-cyan-500/20 rounded-lg text-white transition-all border border-transparent hover:border-cyan-400/40"
                          >
                            <div className="font-semibold text-base mb-1 text-slate-200">{template.name}</div>
                            <div className="text-sm text-slate-400 line-clamp-2">{template.text.substring(0, 100)}...</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateQuestions}
                disabled={loading || !description.trim()}
                className="glass-card px-6 py-2 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2 transition-all enabled:border-cyan-400/50 enabled:shadow-md enabled:shadow-cyan-500/30 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div className="space-y-6">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">Answer AI-Generated Questions</h2>
              
              <div className="space-y-5">
                {questions.map((q, index) => (
                  <div key={index} className="glass-card-light p-6 hover:border-cyan-400/50 hover:shadow-cyan-500/20 transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white text-sm font-bold">Q{index + 1}</span>
                      </div>
                      <p className="text-white pt-2 text-lg font-medium">{q}</p>
                    </div>
                    <textarea
                      value={answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-28 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="glass-card px-8 py-4 text-white font-semibold text-lg transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="glass-card flex-1 px-8 py-4 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
              >
                Get Optimization Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DecisionInput;
