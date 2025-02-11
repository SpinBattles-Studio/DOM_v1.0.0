import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';
import { saveSetting, getSetting } from '../services/storageService';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('groq');
  const [openaiKey, setOpenaiKey] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const key = await getSetting('apiKey');
      const mdl = await getSetting('model');
      const prov = await getSetting('provider');
      const oaiKey = await getSetting('openaiKey');
      
      if (key) setApiKey(key);
      if (mdl) setModel(mdl);
      if (prov) setProvider(prov);
      if (oaiKey) setOpenaiKey(oaiKey);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Load settings error:', err);
    }
  };

  const handleSave = async () => {
    setError('');
    
    try {
      await saveSetting('apiKey', apiKey);
      await saveSetting('model', model);
      await saveSetting('provider', provider);
      await saveSetting('openaiKey', openaiKey);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Save settings error:', err);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white">Settings</h2>
          <div className="px-4 py-2 bg-slate-800/90 backdrop-blur-xl border border-cyan-400/40 rounded-lg shadow-lg shadow-cyan-500/20">
            <span className="text-sm text-slate-200 font-medium">
              {window.electronAPI ? '🖥️ Desktop Mode' : '🌐 Web Mode'}
            </span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 flex items-center justify-center">
                <Key className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">API Configuration</h3>
                <p className="text-sm text-slate-300">Configure your AI provider settings</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-white">AI Provider</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    // Set default model for provider
                    if (e.target.value === 'groq') {
                      setModel('openai/gpt-oss-120b');
                    } else {
                      setModel('gpt-4o');
                    }
                  }}
                  className="w-full bg-slate-700/50 border border-cyan-400/40 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white [&>option]:text-xl [&>option]:py-4 [&>option:checked]:bg-slate-800"
                >
                  <option value="groq">Groq (Fast & Free)</option>
                  <option value="openai">OpenAI (Premium)</option>
                </select>
              </div>

              {provider === 'groq' ? (
                <>
                  <div>
                    <label className="block mb-2 font-semibold text-white">Groq API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Groq API key (starts with gsk_)"
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Get your API key from console.groq.com
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-white">
                      Groq Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-slate-700/50 border border-cyan-400/40 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white [&>option]:text-xl [&>option]:py-4 [&>option:checked]:bg-slate-800"
                    >
                      <option value="openai/gpt-oss-120b">GPT-OSS 120B</option>
                      <option value="openai/gpt-oss-20b">GPT-OSS 20B</option>
                      <option value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout 17B</option>
                      <option value="qwen/qwen3-32b">Qwen 3 32B</option>
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-2 font-semibold text-white">OpenAI API Key</label>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="Enter your OpenAI API key (starts with sk-)"
                      autoComplete="off"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Get your API key from platform.openai.com
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-white">
                      OpenAI Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-slate-700/50 border border-cyan-400/40 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white [&>option]:text-xl [&>option]:py-4 [&>option:checked]:bg-slate-800"
                    >
                      <option value="gpt-5.2">GPT-5.2</option>
                      <option value="gpt-5-mini">GPT-5-Mini</option>
                      <option value="gpt-5-nano">GPT-5-Nano</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="glass-card p-4 bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="glass-card w-full px-8 py-4 text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:border-cyan-400/60 hover:shadow-cyan-500/30"
          >
            {saved ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Settings Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
