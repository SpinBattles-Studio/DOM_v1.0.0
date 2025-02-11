// Storage service that works in both Electron and browser
const isElectron = () => window.electronAPI !== undefined;

// Default API keys (pre-configured for users)
const DEFAULT_SETTINGS = {
  apiKey: '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',
  provider: 'groq',
  model: 'meta-llama/llama-4-scout-17b-16e-instruct'
};

// Settings - Always use Electron storage when available
export async function saveSetting(key, value) {
  if (isElectron()) {
    return await window.electronAPI.saveSetting(key, value);
  } else {
    // In web mode, still try to use Electron if available
    localStorage.setItem(`setting_${key}`, value);
    return { success: true };
  }
}

export async function getSetting(key) {
  let value = null;
  
  if (isElectron()) {
    value = await window.electronAPI.getSetting(key);
  } else {
    value = localStorage.getItem(`setting_${key}`);
  }
  
  // Return default value if no user setting exists
  if (!value && DEFAULT_SETTINGS[key]) {
    return DEFAULT_SETTINGS[key];
  }
  
  return value;
}

// Decisions - Always use Electron storage when available
export async function saveDecision(decision) {
  // Always prefer Electron storage
  if (isElectron()) {
    return await window.electronAPI.saveDecision(decision);
  } else {
    // Fallback to localStorage only if Electron not available
    const decisions = await getDecisions();
    const newDecision = {
      id: Date.now(),
      title: decision.title,
      description: decision.description,
      questions: decision.questions,
      answers: decision.answers,
      results: decision.results,
      best_option: decision.bestOption,
      status: decision.status || 'completed',
      chart_data: decision.chartData || [],
      timeline: decision.timeline || [],
      metrics: decision.metrics || [],
      options: decision.options || [],
      deep_analysis: decision.deepAnalysis || null,
      created_at: new Date().toISOString()
    };
    decisions.unshift(newDecision);
    localStorage.setItem('decisions', JSON.stringify(decisions));
    return { id: newDecision.id };
  }
}

export async function getDecisions() {
  if (isElectron()) {
    return await window.electronAPI.getDecisions();
  } else {
    const data = localStorage.getItem('decisions');
    return data ? JSON.parse(data) : [];
  }
}

export async function getDecision(id) {
  if (isElectron()) {
    return await window.electronAPI.getDecision(id);
  } else {
    const decisions = await getDecisions();
    return decisions.find(d => d.id == id);
  }
}

export async function deleteDecision(id) {
  if (isElectron()) {
    return await window.electronAPI.deleteDecision(id);
  } else {
    const decisions = await getDecisions();
    const filtered = decisions.filter(d => d.id != id);
    localStorage.setItem('decisions', JSON.stringify(filtered));
    return { success: true };
  }
}
