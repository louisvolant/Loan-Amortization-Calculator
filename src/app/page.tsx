// src/app/page.tsx
"use client";

import LoanAmortizationCalculator from "../components/LoanAmortizationCalculator";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LoanAmortizationCalculator />
    </div>
  );
}