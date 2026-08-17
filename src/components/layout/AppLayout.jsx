import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import Footer from './Footer';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const location = useLocation();

  // Trigger re-animation on route change
  useEffect(() => {
    setPageKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic Route Content */}
        <main
          key={pageKey}
          className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-page-enter"
        >
          <Outlet />
        </main>

        {/* Shared Footer */}
        <Footer />
      </div>
    </div>
  );
}
