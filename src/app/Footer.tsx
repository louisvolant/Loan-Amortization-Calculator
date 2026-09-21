// src/app/Footer.tsx
"use client";

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { footerLinks } from './links';

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
    <footer className="mt-12 border-t border-slate-200/80 bg-white/80 py-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 text-xs">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-slate-500 dark:text-slate-400">
        <span>&copy; {new Date().getFullYear()} LouisVolant.com. All rights reserved.</span>

        {footerLinks.map((link) => (
          <Fragment key={link.href}>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              href={link.href}
              className="font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          </Fragment>
        ))}

        <button
          onClick={toggleTheme}
          data-testid="theme-toggle"
          suppressHydrationWarning
          className="ml-1 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 font-medium text-slate-700 shadow-xs hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-all cursor-pointer"
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>
      </div>
    </footer>
  );
}