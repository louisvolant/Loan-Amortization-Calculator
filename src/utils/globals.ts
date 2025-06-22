// src/utils/globals.d.ts

export interface AmortizationRow {
  rank: number;
  dueDate: string; // ISO date string (e.g., "2025-07-01")
  payment: number;
  principal: number;
  interest: number;
  additionalCosts: number;
  remainingBalance: number;
}

export interface TableRowInput {
  rank: string;
  dueDate: string; // Input as YYYY-MM-DD
  payment: string;
  principal: string;
  interest: string;
  additionalCosts: string;
  remainingBalance: string;
}

export type Language = "en" | "es" | "fr";

export interface Translations {
  [key: string]: {
    title: string;
    loanAmountLabel: string;
    interestRateLabel: string;
    loanTermLabel: string;
    optionalRowsTitle: string;
    addRowButton: string;
    calculateButton: string;
    amortizationScheduleTitle: string;
    downloadButton: string;
    insuranceRateLabel: string;
    tableHeaders: {
      rank: string;
      dueDate: string;
      payment: string;
      principal: string;
      interest: string;
      additionalCosts: string;
      remainingBalance: string;
    };
    placeholders: {
      rank: string;
      dueDate: string;
      payment: string;
      principal: string;
      interest: string;
      additionalCosts: string;
      remainingBalance: string;
      loanAmount: string;
      interestRate: string;
      loanTerm: string;
      insuranceRate: string;
    };
  };
}