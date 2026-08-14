// src/app/Footer.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { externalLinks } from './links';

export default function Footer() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <footer className="bg-gray-200 dark:bg-gray-800 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
        <div className="mb-4">
          {externalLinks.map((link, index) => (
            <span key={link.href}>
              <Link href={link.href} className="mx-2 hover:text-gray-800 dark:hover:text-gray-100">
                {link.label}
              </Link>
              {index < externalLinks.length - 1 && <span>|</span>}
            </span>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="py-2 px-4 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>

        <div className="mt-4">
          © {new Date().getFullYear()} LouisVolant.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
}