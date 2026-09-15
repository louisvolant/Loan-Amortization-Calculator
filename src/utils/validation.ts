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
  fixErrorsToCalculate: string;
}

export interface FormValidationErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTermMonths?: string;
  insuranceRate?: string;
  tableRows?: Record<number, Record<string, string>>;
}

export function validateLoanInputs(
  inputs: {
    loanAmount: string;
    interestRate: string;
    loanTermMonths: string;
    insuranceRate: string;
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
  if (!trimmedTerm) {
    errors.loanTermMonths = messages.loanTermRequired;
  } else {
    const numTerm = Number(trimmedTerm);
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

  return errors;
}
