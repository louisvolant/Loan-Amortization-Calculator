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
export type LoanType = "amortizing" | "interest_only";
export type RateType = "fixed" | "variable";

export interface RateAdjustment {
  startMonth: string;
  rate: string;
}

export interface Translations {
  [key: string]: {
    title: string;
    loanAmountLabel: string;
    interestRateLabel: string;
    loanTermLabel: string;
    insuranceRateLabel: string;
    loanTypeLabel: string;
    loanTypeAmortizing: string;
    loanTypeInterestOnly: string;
    interestOnlyMonthsLabel: string;
    rateTypeLabel: string;
    rateTypeFixed: string;
    rateTypeVariable: string;
    variableRateTitle: string;
    addRateAdjustmentButton: string;
    removeRateAdjustmentButton: string;
    startMonthLabel: string;
    adjustedRateLabel: string;
    balloonPaymentLabel: string;
    optionalRowsTitle: string;
    addRowButton: string;
    removeRowButton: string;
    calculateButton: string;
    amortizationScheduleTitle: string;
    downloadButton: string;
    pagination: {
      rowsPerPage: string;
      all: string;
      pageOf: string;
      showing: string;
      first: string;
      previous: string;
      next: string;
      last: string;
    };
    validation: {
      loanAmountRequired: string;
      loanAmountPositive: string;
      loanAmountMax: string;
      interestRateRequired: string;
      interestRateRange: string;
      loanTermRequired: string;
      loanTermPositiveInt: string;
      loanTermMax: string;
      insuranceRateRange: string;
      interestOnlyMonthsRequired: string;
      interestOnlyMonthsRange: string;
      rateAdjustmentStartMonthRange: string;
      rateAdjustmentRateRange: string;
      fixErrorsToCalculate: string;
    };
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