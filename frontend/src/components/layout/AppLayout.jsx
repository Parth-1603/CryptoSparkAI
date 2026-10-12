import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import Footer from './Footer';
import Chatbot from '../shared/Chatbot';
import { PageProgressBar } from '../shared/LoadingState';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsNavigating(true);
    setPageKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = setTimeout(() => setIsNavigating(false), 350);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <PageProgressBar isLoading={isNavigating} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <TopNav onMenuToggle={() => setSidebarOpen(o => !o)} />

        <main
          key={pageKey}
          className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-fade-in-up"
        >
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Global chatbot widget */}
      <Chatbot />
    </div>
  );
}
