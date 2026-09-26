import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import Infrastructure from './pages/Infrastructure';
import ModelMetrics from './pages/ModelMetrics';
import About from './pages/About';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Home page has its own full-width layout */}
        <Route path="/" element={<Home />} />

        {/* Dashboard, Predictions, Infrastructure, Model Metrics, About share AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
          <Route path="/model-metrics" element={<ModelMetrics />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
