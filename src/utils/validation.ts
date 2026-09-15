// src/utils/validation.ts

export interface ValidationMessages {
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
}

export interface FormValidationErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTermMonths?: string;
  insuranceRate?: string;
  interestOnlyMonths?: string;
  rateAdjustments?: Record<number, { startMonth?: string; rate?: string }>;
  tableRows?: Record<number, Record<string, string>>;
}

export function validateLoanInputs(
  inputs: {
    loanAmount: string;
    interestRate: string;
    loanTermMonths: string;
    insuranceRate: string;
    loanType?: "amortizing" | "interest_only";
    interestOnlyMonths?: string;
    rateType?: "fixed" | "variable";
    rateAdjustments?: { startMonth: string; rate: string }[];
  },
  messages: ValidationMessages
): FormValidationErrors {
  const errors: FormValidationErrors = {};

  // Validate loan amount
  const trimmedAmount = inputs.loanAmount.trim();
  if (!trimmedAmount) {
    errors.loanAmount = messages.loanAmountRequired;
  } else {
    const numAmount = Number(trimmedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.loanAmount = messages.loanAmountPositive;
    } else if (numAmount > 100000000) {
      errors.loanAmount = messages.loanAmountMax;
    }
  }

  // Validate interest rate
  const trimmedRate = inputs.interestRate.trim();
  if (!trimmedRate) {
    errors.interestRate = messages.interestRateRequired;
  } else {
    const numRate = Number(trimmedRate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      errors.interestRate = messages.interestRateRange;
    }
  }

  // Validate loan term in months
  const trimmedTerm = inputs.loanTermMonths.trim();
  const numTerm = Number(trimmedTerm);
  if (!trimmedTerm) {
    errors.loanTermMonths = messages.loanTermRequired;
  } else {
    if (isNaN(numTerm) || !Number.isInteger(numTerm) || numTerm <= 0) {
      errors.loanTermMonths = messages.loanTermPositiveInt;
    } else if (numTerm > 1200) {
      errors.loanTermMonths = messages.loanTermMax;
    }
  }

  // Validate insurance rate (optional)
  const trimmedInsurance = inputs.insuranceRate.trim();
  if (trimmedInsurance) {
    const numInsurance = Number(trimmedInsurance);
    if (isNaN(numInsurance) || numInsurance < 0 || numInsurance > 100) {
      errors.insuranceRate = messages.insuranceRateRange;
    }
  }

  // Validate interest-only period if loan type is interest_only
  if (inputs.loanType === "interest_only") {
    const trimmedIOMonths = (inputs.interestOnlyMonths || "").trim();
    if (!trimmedIOMonths) {
      errors.interestOnlyMonths = messages.interestOnlyMonthsRequired;
    } else {
      const numIO = Number(trimmedIOMonths);
      const maxTerm = !isNaN(numTerm) && numTerm > 0 ? numTerm : 1200;
      if (isNaN(numIO) || !Number.isInteger(numIO) || numIO <= 0 || numIO > maxTerm) {
        errors.interestOnlyMonths = messages.interestOnlyMonthsRange;
      }
    }
  }

  // Validate variable rate adjustments
  if (inputs.rateType === "variable" && inputs.rateAdjustments) {
    inputs.rateAdjustments.forEach((adj, idx) => {
      const adjErrors: { startMonth?: string; rate?: string } = {};
      const startMonthNum = Number(adj.startMonth);
      const maxTerm = !isNaN(numTerm) && numTerm > 0 ? numTerm : 1200;
      if (
        !adj.startMonth.trim() ||
        isNaN(startMonthNum) ||
        !Number.isInteger(startMonthNum) ||
        startMonthNum < 2 ||
        startMonthNum > maxTerm
      ) {
        adjErrors.startMonth = messages.rateAdjustmentStartMonthRange;
      }

      const rateNum = Number(adj.rate);
      if (!adj.rate.trim() || isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
        adjErrors.rate = messages.rateAdjustmentRateRange;
      }

      if (adjErrors.startMonth || adjErrors.rate) {
        if (!errors.rateAdjustments) errors.rateAdjustments = {};
        errors.rateAdjustments[idx] = adjErrors;
      }
    });
  }

  return errors;
}
