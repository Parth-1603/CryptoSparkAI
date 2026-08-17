import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-10 border-t border-outline-variant bg-surface-container-lowest mt-auto">
      <div className="mb-6 md:mb-0">
        <h3 className="font-title-md text-title-md font-bold text-on-surface">CryptoSpark AI</h3>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          © 2024 CryptoSpark AI. Institutional Grade Digital Asset Analytics.
        </p>
      </div>

      <div className="flex gap-8">
        <Link to="/about" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
          About
        </Link>
        <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
          Terms
        </a>
        <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
          Privacy
        </a>
        <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
          API Docs
        </a>
        <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
          Support
        </a>
      </div>
    </footer>
  );
}
