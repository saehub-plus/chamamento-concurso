
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Index from './pages/Index';
import Candidates from './pages/Candidates';
import Convocations from './pages/Convocations';
import Documents from './pages/Documents';
import { Toaster } from '@/components/ui/toaster';
import { CompetitionProvider } from './context/CompetitionContext';

function App() {
  return (
    <Router>
      <CompetitionProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/joinville" element={<Index />} />
          <Route path="/joinville/candidates" element={<Candidates />} />
          <Route path="/joinville/convocations" element={<Convocations />} />
          <Route path="/joinville/documents" element={<Documents />} />
          
          <Route path="/florianopolis-concurso" element={<Index />} />
          <Route path="/florianopolis-concurso/candidates" element={<Candidates />} />
          <Route path="/florianopolis-concurso/convocations" element={<Convocations />} />
          <Route path="/florianopolis-concurso/documents" element={<Documents />} />
          
          <Route path="/florianopolis-processo" element={<Index />} />
          <Route path="/florianopolis-processo/candidates" element={<Candidates />} />
          <Route path="/florianopolis-processo/convocations" element={<Convocations />} />
          <Route path="/florianopolis-processo/documents" element={<Documents />} />
        </Routes>
        <Toaster />
      </CompetitionProvider>
    </Router>
  );
}

export default App;
