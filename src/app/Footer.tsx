// src/app/Footer.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { externalLinks } from './links';

export default function Footer() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.toggle('dark', true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
    }
  };

  return (
    <footer className="mt-12 border-t border-slate-200/80 bg-white/80 py-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 text-sm">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {externalLinks.map((link, index) => (
            <span key={link.href} className="inline-flex items-center">
              <Link
                href={link.href}
                className="font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
              {index < externalLinks.length - 1 && <span className="ml-2 text-slate-300 dark:text-slate-700">&bull;</span>}
            </span>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          data-testid="theme-toggle"
          suppressHydrationWarning
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 font-medium text-slate-700 shadow-xs hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-all cursor-pointer"
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} LouisVolant.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
}