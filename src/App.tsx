import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Candidates from './pages/Candidates';
import Convocations from './pages/Convocations';
import Documents from './pages/Documents';
import { Toaster } from '@/components/ui/toaster';
import { PredictionCardEnhanced } from '@/components/PredictionCardEnhanced';
import { HeaderWrapper } from '@/components/HeaderWrapper';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/convocations" element={<Convocations />} />
        <Route path="/documents" element={<Documents />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
