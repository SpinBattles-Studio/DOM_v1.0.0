# Decision Optimization Management

AI-powered decision optimization desktop application for Windows, macOS, and Linux.

## Features

- 🤖 AI-driven decision analysis with GPT-OSS 120B
- 💬 Interactive question generation (3-5 targeted questions)
- 📊 Visual optimization results with charts and graphs
- 💾 Local decision history tracking with SQLite
- 🎨 Modern glass-morphism UI design
- 🔒 Secure local data storage
- 🌐 Cross-platform support (Windows, macOS, Linux)

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Desktop**: Electron
- **Database**: JSON file storage (local)
- **AI Provider**: Groq API
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Groq API key (get free at console.groq.com)

## Installation

1. **Install dependencies:**
```bash
npm install
```

Note: Installation may take several minutes. Warnings about deprecated packages are normal and won't affect functionality.

2. **Run in development mode:**
```bash
npm run dev
```

This will start both the React dev server (port 5173) and Electron app.

3. **Build for production:**
```bash
npm run build
npm run package
```

The packaged app will be in the `release` folder.

## First Time Setup

1. Launch the application
2. Click the Settings icon in the sidebar
3. Enter your Groq API key (get from console.groq.com)
4. Select your preferred AI model (GPT-OSS 120B is default)
5. Save settings

## Usage Guide

### 1. Create a New Decision

- Click "Get Started" on the hero page or "New Decision" in sidebar
- Describe your decision context in detail
- Click "Generate Questions"
- Answer the 3-5 AI-generated questions
- Click "Get Optimization Results"

### 2. View Results

- Review the top recommended option
- See strengths and considerations
- Analyze charts showing projected impact
- View alternative options

### 3. Continue Discussion

- Click "Ask Another Question" or "Continue Discussion"
- Use the Q&A Chat to get more insights
- Ask about risks, implementation, metrics, etc.

### 4. Manage Decisions

- View all past decisions in "My Decisions"
- Search and filter by category
- Click any decision to view full details
- Delete decisions you no longer need

## Supported AI Models

- **GPT-OSS 120B** (Default) - Best balance of quality and speed
- GPT-OSS 20B - Faster, lighter model
- Llama 3.3 70B - High quality alternative
- Llama 4 Scout 17B - Fast and efficient
- Qwen 3 32B - Good performance

## Project Structure

```
├── electron/           # Electron main process
│   ├── main.js        # Main process entry
│   └── preload.js     # Preload script for IPC
├── src/
│   ├── components/    # React components
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── pages/         # Page components
│   │   ├── Hero.jsx
│   │   ├── DecisionInput.jsx
│   │   ├── Results.jsx
│   │   ├── QAChat.jsx
│   │   ├── MyDecisions.jsx
│   │   ├── DecisionDetails.jsx
│   │   ├── Settings.jsx
│   │   └── HelpFAQ.jsx
│   ├── services/      # API services
│   │   └── aiService.js
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Development

- React dev server runs on `http://localhost:5173`
- Hot reload enabled for fast development
- Electron DevTools available in development mode

## Troubleshooting

**API Key Error:**
- Make sure you've entered a valid Groq API key in Settings
- Check your API key at console.groq.com

**Questions Not Generating:**
- Verify your internet connection
- Check API key is correct
- Try a different AI model in Settings

**Database Issues:**
- Data is stored in a JSON file in the app's user data folder
- To reset all data, delete the `data.json` file from the user data directory

## License

ISC

## Support

For issues or questions, visit the Help & FAQ page in the app.
