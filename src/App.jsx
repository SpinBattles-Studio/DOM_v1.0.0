import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Hero from './pages/Hero';
import DecisionInput from './pages/DecisionInput';
import Results from './pages/Results';
import QAChat from './pages/QAChat';
import MyDecisions from './pages/MyDecisions';
import DecisionDetails from './pages/DecisionDetails';
import Settings from './pages/Settings';
import HelpFAQ from './pages/HelpFAQ';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(34, 211, 238, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(34, 211, 238, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#22d3ee',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hero />} />
          <Route path="input" element={<DecisionInput />} />
          <Route path="results" element={<Results />} />
          <Route path="chat" element={<QAChat />} />
          <Route path="decisions" element={<MyDecisions />} />
          <Route path="decisions/:id" element={<DecisionDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpFAQ />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
