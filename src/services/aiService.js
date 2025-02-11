import { getSetting } from './storageService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function getProvider() {
  const provider = await getSetting('provider');
  return provider || 'groq';
}

async function getApiKey() {
  const provider = await getProvider();
  if (provider === 'openai') {
    return await getSetting('openaiKey');
  }
  return await getSetting('apiKey');
}

async function getModel() {
  const model = await getSetting('model');
  return model || 'meta-llama/llama-4-scout-17b-16e-instruct';
}

export async function callGroqAPI(messages) {
  const provider = await getProvider();
  const apiKey = await getApiKey();
  const model = await getModel();
  const apiUrl = provider === 'openai' ? OPENAI_API_URL : GROQ_API_URL;

  console.log('Provider:', provider);
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length);
  console.log('Model:', model);
  console.log('API URL:', apiUrl);

  if (!apiKey) {
    throw new Error(`API key not configured. Please set your ${provider === 'openai' ? 'OpenAI' : 'Groq'} API key in Settings.`);
  }

  // Validate API key format
  if (provider === 'groq' && !apiKey.startsWith('gsk_')) {
    throw new Error('Invalid Groq API key format. Keys should start with "gsk_"');
  }
  if (provider === 'openai' && !apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. Keys should start with "sk-"');
  }

  try {
    const requestBody = {
      model: model,
      messages: messages
    };

    // GPT-5 models only support temperature = 1 (default)
    if (provider === 'openai' && model.includes('gpt-5')) {
      requestBody.temperature = 1;
    } else {
      requestBody.temperature = 0.8;
    }

    // OpenAI's newer models (GPT-5.x) use max_completion_tokens instead of max_tokens
    if (provider === 'openai' && (model.includes('gpt-5') || model.includes('gpt-4o'))) {
      requestBody.max_completion_tokens = 3000;
    } else {
      requestBody.max_tokens = 3000;
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    let responseStatus, data;

    // Always use fetch - webSecurity: false allows it in both dev and packaged app
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      if (response.status === 401) throw new Error(`Invalid API key. Please check your ${provider === 'openai' ? 'OpenAI' : 'Groq'} API key in Settings.`);
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    data = await response.json();

    console.log('API Response received successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Full error:', error.message);
    throw error;
  }
}

export async function generateQuestions(description) {
  const messages = [
    {
      role: 'system',
      content: 'You are an AI decision optimization assistant. Generate 3-5 clarifying questions to help optimize the user\'s decision. Return only the questions as a JSON array. Do not include any thinking process or explanations.'
    },
    {
      role: 'user',
      content: `Decision context: ${description}\n\nGenerate 3-5 questions to clarify this decision. Return as JSON array format: ["question1", "question2", ...]`
    }
  ];

  const response = await callGroqAPI(messages);
  
  // Remove <think> tags and content if present (for reasoning models like Qwen)
  let cleanedResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  // Remove any Q1, Q2, Q3 etc. prefixes that might appear
  cleanedResponse = cleanedResponse.replace(/Q\d+/g, '').trim();
  
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(cleanedResponse);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // If JSON parsing fails, try to extract JSON array from the text
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall back to splitting by newlines
        return cleanedResponse.split('\n').filter(q => q.trim() && q.includes('?'));
      }
    }
    // Last resort: split by newlines
    return cleanedResponse.split('\n').filter(q => q.trim() && q.includes('?'));
  }
}

export async function generateOptimization(description, questions, answers) {
  const answersText = Object.entries(answers)
    .map(([index, answer]) => `Q: ${questions[index]}\nA: ${answer}`)
    .join('\n\n');

  const messages = [
    {
      role: 'system',
      content: 'You are an AI decision optimization assistant. Analyze the decision context and provide detailed optimization data. Return only valid JSON without any thinking process or explanations. IMPORTANT: The bestOption must be DIFFERENT from all items in the options array. Write COMPREHENSIVE descriptions with multiple sentences.'
    },
    {
      role: 'user',
      content: `Decision: ${description}\n\n${answersText}\n\nProvide comprehensive optimization analysis. Return as JSON with this exact structure:
{
  "options": [
    {
      "title": "Alternative option 1 (DIFFERENT from bestOption)",
      "description": "Write a detailed 2-3 sentence description (minimum 120 characters). Explain what this option involves, why it's a viable alternative, and what specific benefits it offers.",
      "strengths": ["strength1", "strength2"],
      "considerations": ["consideration1", "consideration2"]
    },
    {
      "title": "Alternative option 2 (DIFFERENT from bestOption and option 1)",
      "description": "Write a detailed 2-3 sentence description (minimum 120 characters). Explain what this option involves, why it's a viable alternative, and what specific benefits it offers.",
      "strengths": ["strength1", "strength2"],
      "considerations": ["consideration1", "consideration2"]
    }
  ],
  "bestOption": {
    "title": "Best option (UNIQUE, not in options array)",
    "description": "Write a comprehensive 3-4 sentence description (minimum 200 characters). You MUST explain: (1) What exactly this option entails and what the person would be doing, (2) Why this is the best choice based on their specific situation and strengths, (3) How it addresses their needs and what outcomes they can expect. Be detailed, specific, and persuasive without being overly long.",
    "strengths": ["strength1", "strength2", "strength3"],
    "considerations": ["consideration1", "consideration2"]
  },
  "chartData": [
    {"name": "Impact", "value": 70},
    {"name": "Feasibility", "value": 80},
    {"name": "Risk", "value": 35}
  ],
  "timeline": [
    {"phase": "Week 1", "progress": 15, "task": "Initial planning and setup - Define objectives and gather resources"},
    {"phase": "Week 2-4", "progress": 45, "task": "Core development - Build foundation and key components"},
    {"phase": "Week 5-8", "progress": 75, "task": "Implementation and testing - Deploy and validate results"},
    {"phase": "Final", "progress": 100, "task": "Completion and review - Finalize and measure success"}
  ],
  "metrics": [
    {"name": "Expected ROI", "value": "25-50%"},
    {"name": "Time to Results", "value": "2-3 months"},
    {"name": "Resource Cost", "value": "Medium"}
  ]
}

CRITICAL REQUIREMENTS:
- bestOption description MUST be 3-4 sentences minimum (200+ characters)
- Alternative descriptions MUST be 2-3 sentences minimum (120+ characters)
- DO NOT write short, generic descriptions - be specific and detailed
- Explain WHY each option fits the user's unique situation
- Include concrete details about what the person would actually do
- ROI must be realistic (15-80%, NOT 200%)
- bestOption title must be completely different from options array
- All recommendations must be distinct alternatives`
    }
  ];

  const response = await callGroqAPI(messages);
  
  // Remove <think> tags and content if present
  let cleanedResponse = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  
  try {
    const parsed = JSON.parse(cleanedResponse);
    
    // Validate no duplicates between bestOption and options
    if (parsed.options && parsed.bestOption) {
      const optionTitles = parsed.options.map(o => o.title.toLowerCase());
      const bestTitle = parsed.bestOption.title.toLowerCase();
      
      if (optionTitles.includes(bestTitle)) {
        console.warn('Duplicate found, filtering...');
        parsed.options = parsed.options.filter(o => o.title.toLowerCase() !== bestTitle);
      }
    }
    
    return parsed;
  } catch {
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Parse error:', e);
      }
    }
    
    return {
      bestOption: {
        title: 'Optimization Result',
        description: cleanedResponse,
        strengths: ['AI-generated recommendation'],
        considerations: ['Review carefully']
      },
      options: [],
      chartData: [
        { name: 'Impact', value: 70 },
        { name: 'Feasibility', value: 85 },
        { name: 'Risk', value: 45 }
      ],
      timeline: [
        { phase: 'Week 1', progress: 20, task: 'Planning' },
        { phase: 'Week 2-4', progress: 50, task: 'Execution' },
        { phase: 'Week 5-8', progress: 80, task: 'Review' },
        { phase: 'Final', progress: 100, task: 'Complete' }
      ],
      metrics: [
        { name: 'Expected ROI', value: '30-40%' },
        { name: 'Time to Results', value: '8 weeks' },
        { name: 'Resource Cost', value: 'Medium' }
      ]
    };
  }
}
