// src/components/LoanAmortizationCalculator.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { translations } from "../utils/translations";
import { AmortizationRow, TableRowInput, Language, LoanType, RateType, RateAdjustment } from "../utils/globals";
import { validateLoanInputs } from "../utils/validation";
import AmortizationChart from "./AmortizationChart";

export default function LoanAmortizationCalculator() {
  // State declarations
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");
  const [insuranceRate, setInsuranceRate] = useState("");
  const [loanType, setLoanType] = useState<LoanType>("amortizing");
  const [interestOnlyMonths, setInterestOnlyMonths] = useState("24");
  const [rateType, setRateType] = useState<RateType>("fixed");
  const [rateAdjustments, setRateAdjustments] = useState<RateAdjustment[]>([]);
  const [tableRows, setTableRows] = useState<TableRowInput[]>([
    {
      rank: "",
      dueDate: "",
      payment: "",
      principal: "",
      interest: "",
      additionalCosts: "",
      remainingBalance: "",
    },
  ]);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationRow[]>([]);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "all">(12);

  const t = translations[language];

  // Pagination calculation
  const totalRows = amortizationSchedule.length;
  const totalPages = rowsPerPage === "all" ? 1 : Math.max(1, Math.ceil(totalRows / (rowsPerPage || 1)));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * (typeof rowsPerPage === "number" ? rowsPerPage : totalRows);
  const endIndex = typeof rowsPerPage === "number" ? Math.min(startIndex + rowsPerPage, totalRows) : totalRows;
  const displayedRows = amortizationSchedule.slice(startIndex, endIndex);

  // Real-time input validation errors
  const errors = useMemo(() => {
    return validateLoanInputs(
      {
        loanAmount,
        interestRate,
        loanTermMonths,
        insuranceRate,
        loanType,
        interestOnlyMonths,
        rateType,
        rateAdjustments,
      },
      t.validation
    );
  }, [loanAmount, interestRate, loanTermMonths, insuranceRate, loanType, interestOnlyMonths, rateType, rateAdjustments, t.validation]);

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("mortgageCalculatorState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setLoanAmount(parsedState.loanAmount || "");
        setInterestRate(parsedState.interestRate || "");
        setLoanTermMonths(parsedState.loanTermMonths || "");
        setInsuranceRate(parsedState.insuranceRate || "");
        setLoanType(parsedState.loanType || "amortizing");
        setInterestOnlyMonths(parsedState.interestOnlyMonths || "24");
        setRateType(parsedState.rateType || "fixed");
        setRateAdjustments(parsedState.rateAdjustments || []);
        setTableRows(
          parsedState.tableRows || [
            // ...
          ]
        );
        setAmortizationSchedule(parsedState.amortizationSchedule || []);
        setLanguage(parsedState.language || "en");
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        loanAmount,
        interestRate,
        loanTermMonths,
        insuranceRate,
        loanType,
        interestOnlyMonths,
        rateType,
        rateAdjustments,
        tableRows,
        amortizationSchedule,
        language,
      };
      localStorage.setItem("mortgageCalculatorState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [
    loanAmount,
    interestRate,
    loanTermMonths,
    insuranceRate,
    loanType,
    interestOnlyMonths,
    rateType,
    rateAdjustments,
    tableRows,
    amortizationSchedule,
    language,
  ]);

  // Rate adjustments management
  const addRateAdjustment = () => {
    if (rateAdjustments.length < 5) {
      setRateAdjustments([...rateAdjustments, { startMonth: "", rate: "" }]);
    }
  };

  const removeRateAdjustment = (index: number) => {
    setRateAdjustments(rateAdjustments.filter((_, i) => i !== index));
  };

  const updateRateAdjustment = (index: number, field: keyof RateAdjustment, value: string) => {
    const updated = [...rateAdjustments];
    updated[index][field] = value;
    setRateAdjustments(updated);
  };

  // Add a new table row
  const addTableRow = () => {
    if (tableRows.length < 5) {
      setTableRows([
        ...tableRows,
        {
          rank: "",
          dueDate: "",
          payment: "",
          principal: "",
          interest: "",
          additionalCosts: "",
          remainingBalance: "",
        },
      ]);
    }
  };

  // Add this function
  const removeTableRow = (index: number) => {
    if (tableRows.length > 1) {
      setTableRows(tableRows.filter((_, i) => i !== index));
    }
  };

  // Update a table row
  const updateTableRow = (index: number, field: keyof TableRowInput, value: string) => {
    const newRows = [...tableRows];
    newRows[index][field] = value;
    setTableRows(newRows);
  };

  // Calculate amortization schedule
  const calculateAmortization = () => {
    setError("");
    setTouched({
      loanAmount: true,
      interestRate: true,
      loanTermMonths: true,
      insuranceRate: true,
      interestOnlyMonths: true,
    });

    if (Object.keys(errors).length > 0) {
      setError(t.validation.fixErrorsToCalculate);
      return;
    }

    const initialLoanAmount = parseFloat(loanAmount);
    const baseInterestRate = parseFloat(interestRate);
    const totalLoanTermMonths = parseInt(loanTermMonths);
    const annualInsuranceRate = insuranceRate ? parseFloat(insuranceRate) : 0;
    const monthlyInsuranceRate = annualInsuranceRate / 100 / 12;

    const ioMonths = loanType === "interest_only" ? parseInt(interestOnlyMonths) : 0;

    // Sort variable rate adjustments by start month
    const validAdjustments =
      rateType === "variable"
        ? [...rateAdjustments]
            .filter((adj) => adj.startMonth && adj.rate && !isNaN(parseInt(adj.startMonth)) && !isNaN(parseFloat(adj.rate)))
            .sort((a, b) => parseInt(a.startMonth) - parseInt(b.startMonth))
        : [];

    const fullSchedule: AmortizationRow[] = [];
    let currentBalance = initialLoanAmount;
    let currentAnnualRate = baseInterestRate;
    let currentMonthlyPayment = 0;
    let lastProvidedRank = 0;
    let lastProvidedDueDate: Date | null = null;

    // Process and sort optional amortization table rows
    const filledTableRows = tableRows
      .filter(
        (row) =>
          row.rank &&
          row.dueDate &&
          row.payment &&
          row.principal &&
          row.interest &&
          row.additionalCosts &&
          row.remainingBalance &&
          !isNaN(parseFloat(row.remainingBalance)) &&
          !isNaN(parseInt(row.rank))
      )
      .sort((a, b) => parseInt(a.rank) - parseInt(b.rank));

    // Calculate initial monthly payment for amortizing loan
    const initialMonthlyRate = baseInterestRate / 100 / 12;
    const initialAmortizingTerm = loanType === "interest_only" ? totalLoanTermMonths - ioMonths : totalLoanTermMonths;

    if (initialAmortizingTerm > 0) {
      if (initialMonthlyRate === 0) {
        currentMonthlyPayment = initialLoanAmount / initialAmortizingTerm;
      } else {
        const denom = 1 - Math.pow(1 + initialMonthlyRate, -initialAmortizingTerm);
        currentMonthlyPayment = denom === 0 ? 0 : initialLoanAmount * (initialMonthlyRate / denom);
      }
    }

    // Iterate through each possible rank up to the total loan term
    for (let i = 1; i <= totalLoanTermMonths; i++) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(5);
      defaultDueDate.setMonth(defaultDueDate.getMonth() + i - 1);

      // Check if a rate adjustment starts at this month
      const matchingAdj = validAdjustments.find((adj) => parseInt(adj.startMonth) === i);
      let rateChangedThisMonth = false;
      if (matchingAdj) {
        currentAnnualRate = parseFloat(matchingAdj.rate);
        rateChangedThisMonth = true;
      }

      const activeMonthlyInterestRate = currentAnnualRate / 100 / 12;
      const isInterestOnlyPeriod = loanType === "interest_only" && i <= ioMonths;
      const justExitedIO = loanType === "interest_only" && i === ioMonths + 1;

      // Recalculate monthly amortizing payment if:
      // 1. Just exited interest-only period
      // 2. Rate changed during an amortizing period
      if ((justExitedIO || (rateChangedThisMonth && !isInterestOnlyPeriod)) && currentBalance > 0) {
        const remainingTerm = totalLoanTermMonths - i + 1;
        if (remainingTerm > 0) {
          if (activeMonthlyInterestRate === 0) {
            currentMonthlyPayment = currentBalance / remainingTerm;
          } else {
            const denom = 1 - Math.pow(1 + activeMonthlyInterestRate, -remainingTerm);
            currentMonthlyPayment = denom === 0 ? 0 : currentBalance * (activeMonthlyInterestRate / denom);
          }
        }
      }

      let rankToPush: AmortizationRow;
      const providedRow = filledTableRows.find((row) => parseInt(row.rank) === i);

      if (providedRow) {
        const providedBalance = parseFloat(providedRow.remainingBalance);
        const providedPayment = parseFloat(providedRow.payment);
        const providedPrincipal = parseFloat(providedRow.principal);
        const providedInterest = parseFloat(providedRow.interest);
        const providedAdditionalCosts = parseFloat(providedRow.additionalCosts);

        rankToPush = {
          rank: i,
          dueDate: providedRow.dueDate,
          payment: providedPayment,
          principal: providedPrincipal,
          interest: providedInterest,
          additionalCosts: providedAdditionalCosts,
          remainingBalance: providedBalance,
        };

        currentBalance = providedBalance;
        lastProvidedRank = i;
        lastProvidedDueDate = new Date(providedRow.dueDate);

        if (currentBalance <= 0) {
          fullSchedule.push(rankToPush);
          break;
        }

        const remainingPaymentsCount = totalLoanTermMonths - lastProvidedRank;
        if (remainingPaymentsCount > 0 && currentBalance > 0) {
          if (activeMonthlyInterestRate === 0) {
            currentMonthlyPayment = currentBalance / remainingPaymentsCount;
          } else {
            const denominator = 1 - Math.pow(1 + activeMonthlyInterestRate, -remainingPaymentsCount);
            currentMonthlyPayment = currentBalance * (activeMonthlyInterestRate / denominator);
          }
        }
      } else {
        if (currentBalance <= 0) {
          break;
        }

        const interestPayment = currentBalance * activeMonthlyInterestRate;
        const calculatedAdditionalCosts = isNaN(monthlyInsuranceRate)
          ? 0
          : currentBalance * monthlyInsuranceRate;

        let principalPayment = 0;
        let totalPayment = 0;

        if (isInterestOnlyPeriod) {
          // If interest-only covers full term and this is the final month, balloon repayment of entire remaining balance
          if (ioMonths >= totalLoanTermMonths && i === totalLoanTermMonths) {
            principalPayment = currentBalance;
            currentBalance = 0;
            totalPayment = principalPayment + interestPayment + calculatedAdditionalCosts;
          } else {
            principalPayment = 0;
            totalPayment = interestPayment + calculatedAdditionalCosts;
          }
        } else {
          // Standard amortizing month
          principalPayment = currentMonthlyPayment - interestPayment;
          if (principalPayment > currentBalance || i === totalLoanTermMonths) {
            principalPayment = currentBalance;
          }
          currentBalance -= principalPayment;
          totalPayment = principalPayment + interestPayment + calculatedAdditionalCosts;
        }

        const effectiveDueDate = new Date(lastProvidedDueDate || defaultDueDate);
        effectiveDueDate.setMonth(effectiveDueDate.getMonth() + (i - lastProvidedRank));

        rankToPush = {
          rank: i,
          dueDate: effectiveDueDate.toISOString().split("T")[0],
          payment: parseFloat(totalPayment.toFixed(2)),
          principal: parseFloat(principalPayment.toFixed(2)),
          interest: parseFloat(interestPayment.toFixed(2)),
          additionalCosts: parseFloat(calculatedAdditionalCosts.toFixed(2)),
          remainingBalance: parseFloat(Math.max(currentBalance, 0).toFixed(2)),
        };
      }

      fullSchedule.push(rankToPush);

      if (currentBalance <= 0 && providedRow === undefined) {
        break;
      }
    }

    setAmortizationSchedule(fullSchedule);
    setCurrentPage(1);
  };

  // Handle CSV download
  const handleDownload = () => {
    if (amortizationSchedule.length === 0) {
      setError(
        language === "en"
          ? "No amortization schedule to download. Please calculate first."
          : language === "es"
          ? "No hay tabla de amortización para descargar. Por favor, calcule primero."
          : "Aucun tableau d'amortissement à télécharger. Veuillez calculer d'abord."
      );
      return;
    }

    const headers = [
      t.tableHeaders.rank,
      t.tableHeaders.dueDate,
      t.tableHeaders.payment,
      t.tableHeaders.principal,
      t.tableHeaders.interest,
      t.tableHeaders.additionalCosts,
      t.tableHeaders.remainingBalance,
    ].join(",");

    const rows = amortizationSchedule.map((row) =>
      [
        row.rank,
        row.dueDate,
        row.payment.toFixed(2),
        row.principal.toFixed(2),
        row.interest.toFixed(2),
        row.additionalCosts.toFixed(2),
        row.remainingBalance.toFixed(2),
      ].join(",")
    );

    // Add inputs at the top of the CSV
    const inputsData = `
"${t.loanAmountLabel}",${loanAmount}
"${t.interestRateLabel}",${interestRate}
"${t.loanTermLabel}",${loanTermMonths}
"${t.insuranceRateLabel}",${insuranceRate}
"${t.loanTypeLabel}",${loanType === "interest_only" ? `${t.loanTypeInterestOnly} (${interestOnlyMonths} mos)` : t.loanTypeAmortizing}
"${t.rateTypeLabel}",${rateType === "variable" ? t.rateTypeVariable : t.rateTypeFixed}
`;

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(inputsData + "\n" + headers + "\n" + rows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "amortization_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* Header and Language Selector */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{t.title}</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Loan Details Form */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.loanAmountLabel}
          </label>
          <input
            id="loanAmount"
            data-testid="input-loan-amount"
            type="number"
            value={loanAmount}
            onChange={(e) => {
              setLoanAmount(e.target.value);
              setTouched((prev) => ({ ...prev, loanAmount: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, loanAmount: true }))}
            className={`mt-1 w-full rounded-md border bg-gray-50 p-3 text-base min-w-[100px] transition-colors dark:bg-gray-700 ${
              touched.loanAmount && errors.loanAmount
                ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            }`}
            placeholder={t.placeholders.loanAmount}
            aria-invalid={touched.loanAmount && !!errors.loanAmount}
          />
          {touched.loanAmount && errors.loanAmount && (
            <p className="mt-1 text-xs text-red-500 font-medium" role="alert" data-testid="error-loan-amount">
              {errors.loanAmount}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.interestRateLabel}
          </label>
          <input
            id="interestRate"
            data-testid="input-interest-rate"
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => {
              setInterestRate(e.target.value);
              setTouched((prev) => ({ ...prev, interestRate: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, interestRate: true }))}
            className={`mt-1 w-full rounded-md border bg-gray-50 p-3 text-base min-w-[100px] transition-colors dark:bg-gray-700 ${
              touched.interestRate && errors.interestRate
                ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            }`}
            placeholder={t.placeholders.interestRate}
            aria-invalid={touched.interestRate && !!errors.interestRate}
          />
          {touched.interestRate && errors.interestRate && (
            <p className="mt-1 text-xs text-red-500 font-medium" role="alert" data-testid="error-interest-rate">
              {errors.interestRate}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="loanTermMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.loanTermLabel}
          </label>
          <input
            id="loanTermMonths"
            data-testid="input-loan-term"
            type="number"
            value={loanTermMonths}
            onChange={(e) => {
              setLoanTermMonths(e.target.value);
              setTouched((prev) => ({ ...prev, loanTermMonths: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, loanTermMonths: true }))}
            className={`mt-1 w-full rounded-md border bg-gray-50 p-3 text-base min-w-[100px] transition-colors dark:bg-gray-700 ${
              touched.loanTermMonths && errors.loanTermMonths
                ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            }`}
            placeholder={t.placeholders.loanTerm}
            aria-invalid={touched.loanTermMonths && !!errors.loanTermMonths}
          />
          {touched.loanTermMonths && errors.loanTermMonths && (
            <p className="mt-1 text-xs text-red-500 font-medium" role="alert" data-testid="error-loan-term">
              {errors.loanTermMonths}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="insuranceRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.insuranceRateLabel}
          </label>
          <input
            id="insuranceRate"
            data-testid="input-insurance-rate"
            type="number"
            step="0.01"
            value={insuranceRate}
            onChange={(e) => {
              setInsuranceRate(e.target.value);
              setTouched((prev) => ({ ...prev, insuranceRate: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, insuranceRate: true }))}
            className={`mt-1 w-full rounded-md border bg-gray-50 p-3 text-base min-w-[100px] transition-colors dark:bg-gray-700 ${
              touched.insuranceRate && errors.insuranceRate
                ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            }`}
            placeholder={t.placeholders.insuranceRate}
            aria-invalid={touched.insuranceRate && !!errors.insuranceRate}
          />
          {touched.insuranceRate && errors.insuranceRate && (
            <p className="mt-1 text-xs text-red-500 font-medium" role="alert" data-testid="error-insurance-rate">
              {errors.insuranceRate}
            </p>
          )}
        </div>
      </div>

      {/* Loan Type & Structure Selector */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.loanTypeLabel}
          </label>
          <select
            id="loanType"
            data-testid="select-loan-type"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value as LoanType)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="amortizing">{t.loanTypeAmortizing}</option>
            <option value="interest_only">{t.loanTypeInterestOnly}</option>
          </select>
        </div>

        <div>
          <label htmlFor="rateType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.rateTypeLabel}
          </label>
          <select
            id="rateType"
            data-testid="select-rate-type"
            value={rateType}
            onChange={(e) => setRateType(e.target.value as RateType)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="fixed">{t.rateTypeFixed}</option>
            <option value="variable">{t.rateTypeVariable}</option>
          </select>
        </div>
      </div>

      {/* Interest-Only Configuration */}
      {loanType === "interest_only" && (
        <div className="mb-6 p-4 rounded-md border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20" data-testid="interest-only-config">
          <label htmlFor="interestOnlyMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.interestOnlyMonthsLabel}
          </label>
          <input
            id="interestOnlyMonths"
            data-testid="input-interest-only-months"
            type="number"
            value={interestOnlyMonths}
            onChange={(e) => {
              setInterestOnlyMonths(e.target.value);
              setTouched((prev) => ({ ...prev, interestOnlyMonths: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, interestOnlyMonths: true }))}
            className={`mt-1 w-full sm:w-1/2 rounded-md border bg-gray-50 p-3 text-base transition-colors dark:bg-gray-700 ${
              touched.interestOnlyMonths && errors.interestOnlyMonths
                ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            }`}
            placeholder="24"
            aria-invalid={touched.interestOnlyMonths && !!errors.interestOnlyMonths}
          />
          {touched.interestOnlyMonths && errors.interestOnlyMonths && (
            <p className="mt-1 text-xs text-red-500 font-medium" role="alert" data-testid="error-interest-only-months">
              {errors.interestOnlyMonths}
            </p>
          )}
        </div>
      )}

      {/* Variable Rate Schedule */}
      {rateType === "variable" && (
        <div className="mb-6 p-4 rounded-md border border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/20" data-testid="variable-rate-config">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{t.variableRateTitle}</h3>
            {rateAdjustments.length < 5 && (
              <button
                type="button"
                onClick={addRateAdjustment}
                data-testid="add-rate-adjustment-button"
                className="rounded-md bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700"
              >
                {t.addRateAdjustmentButton}
              </button>
            )}
          </div>
          {rateAdjustments.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No adjustments added yet. Click &quot;{t.addRateAdjustmentButton}&quot; to define rate changes.
            </p>
          ) : (
            <div className="space-y-3">
              {rateAdjustments.map((adj, index) => {
                const adjErr = errors.rateAdjustments?.[index];
                return (
                  <div key={index} className="flex flex-wrap items-end gap-3" data-testid={`rate-adjustment-row-${index}`}>
                    <div className="flex-1 min-w-[130px]">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        {t.startMonthLabel}
                      </label>
                      <input
                        type="number"
                        data-testid={`adj-start-month-${index}`}
                        value={adj.startMonth}
                        onChange={(e) => updateRateAdjustment(index, "startMonth", e.target.value)}
                        placeholder="13"
                        className={`mt-1 w-full rounded-md border bg-gray-50 p-2 text-sm dark:bg-gray-700 ${
                          adjErr?.startMonth ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                      {adjErr?.startMonth && (
                        <p className="mt-0.5 text-xs text-red-500" data-testid={`adj-error-start-month-${index}`}>
                          {adjErr.startMonth}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-w-[130px]">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                        {t.adjustedRateLabel}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        data-testid={`adj-rate-${index}`}
                        value={adj.rate}
                        onChange={(e) => updateRateAdjustment(index, "rate", e.target.value)}
                        placeholder="4.5"
                        className={`mt-1 w-full rounded-md border bg-gray-50 p-2 text-sm dark:bg-gray-700 ${
                          adjErr?.rate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                      {adjErr?.rate && (
                        <p className="mt-0.5 text-xs text-red-500" data-testid={`adj-error-rate-${index}`}>
                          {adjErr.rate}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRateAdjustment(index)}
                      data-testid={`remove-rate-adj-${index}`}
                      className="rounded-md bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600"
                    >
                      {t.removeRateAdjustmentButton}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Optional Amortization Table Rows */}
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">{t.optionalRowsTitle}</h3>
          {tableRows.map((row, index) => (
            <div key={index} className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.rank}</label>
                <input
                  type="number"
                  value={row.rank}
                  onChange={(e) => updateTableRow(index, "rank", e.target.value)}
                  placeholder={t.placeholders.rank}
                  className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                />
              </div>
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.dueDate}</label>
                <input
                  type="date"
                  value={row.dueDate}
                  onChange={(e) => updateTableRow(index, "dueDate", e.target.value)}
                  placeholder={t.placeholders.dueDate}
                  className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                />
              </div>
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.payment}</label>
                <input
                  type="number"
                  value={row.payment}
                  onChange={(e) => updateTableRow(index, "payment", e.target.value)}
                  placeholder={t.placeholders.payment}
                  className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                />
              </div>
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.principal}</label>
                <input
                  type="number"
                  value={row.principal}
                  onChange={(e) => updateTableRow(index, "principal", e.target.value)}
                  placeholder={t.placeholders.principal}
                  className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                />
              </div>
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.interest}</label>
                <input
                  type="number"
                  value={row.interest}
                  onChange={(e) => updateTableRow(index, "interest", e.target.value)}
                  placeholder={t.placeholders.interest}
                  className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                />
              </div>
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.additionalCosts}</label>
                <input
                  type="number"
                  value={row.additionalCosts}
                  onChange={(e) => updateTableRow(index, "additionalCosts", e.target.value)}
                  placeholder={t.placeholders.additionalCosts}
                  className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                />
              </div>
              <div className="flex flex-col min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.placeholders.remainingBalance}</label>
                <div className="flex items-end mt-1">
                  <input
                    type="number"
                    value={row.remainingBalance}
                    onChange={(e) => updateTableRow(index, "remainingBalance", e.target.value)}
                    placeholder={t.placeholders.remainingBalance}
                    className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 w-full"
                  />
                  {tableRows.length > 1 && (
                    <button
                      onClick={() => removeTableRow(index)}
                      className="ml-2 rounded-md bg-red-500 px-3 py-3 text-white hover:bg-red-600"
                      title={t.removeRowButton}
                    >
                      &minus;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tableRows.length < 3 && (
            <button
              onClick={addTableRow}
              className="mt-2 rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
            >
              {t.addRowButton}
            </button>
          )}
        </div>

      {/* Calculate Button */}
      <button
        onClick={calculateAmortization}
        data-testid="calculate-button"
        className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
      >
        {t.calculateButton}
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-center text-red-500 font-medium" role="alert" data-testid="error-summary">
          {error}
        </p>
      )}

      {/* Visual Chart */}
      {amortizationSchedule.length > 0 && (
        <AmortizationChart schedule={amortizationSchedule} translations={t.charts} />
      )}

      {/* Amortization Table */}
      {amortizationSchedule.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.amortizationScheduleTitle}</h3>

            {/* Rows per page selector */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>{t.pagination.rowsPerPage}</span>
              <select
                data-testid="select-rows-per-page"
                value={rowsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setRowsPerPage(val === "all" ? "all" : parseInt(val));
                  setCurrentPage(1);
                }}
                className="rounded border border-gray-300 bg-white p-1 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="60">60</option>
                <option value="120">120</option>
                <option value="all">{t.pagination.all}</option>
              </select>
            </div>
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900">
                <th className="border-b p-2">{t.tableHeaders.rank}</th>
                <th className="border-b p-2">{t.tableHeaders.dueDate}</th>
                <th className="border-b p-2">{t.tableHeaders.payment}</th>
                <th className="border-b p-2">{t.tableHeaders.principal}</th>
                <th className="border-b p-2">{t.tableHeaders.interest}</th>
                <th className="border-b p-2">{t.tableHeaders.additionalCosts}</th>
                <th className="border-b p-2">{t.tableHeaders.remainingBalance}</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row) => (
                <tr key={row.rank} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border-b p-2">{row.rank}</td>
                  <td className="border-b p-2">{row.dueDate}</td>
                  <td className="border-b p-2">{row.payment.toFixed(2)}</td>
                  <td className="border-b p-2">{row.principal.toFixed(2)}</td>
                  <td className="border-b p-2">{row.interest.toFixed(2)}</td>
                  <td className="border-b p-2">{row.additionalCosts.toFixed(2)}</td>
                  <td className="border-b p-2">{row.remainingBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300" data-testid="pagination-controls">
            <div data-testid="pagination-info">
              {t.pagination.showing
                .replace("{start}", totalRows > 0 ? (startIndex + 1).toString() : "0")
                .replace("{end}", endIndex.toString())
                .replace("{total}", totalRows.toString())}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-testid="pagination-first"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="rounded px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={t.pagination.first}
                >
                  &laquo;
                </button>
                <button
                  type="button"
                  data-testid="pagination-prev"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={t.pagination.previous}
                >
                  &lsaquo;
                </button>
                <span className="px-2" data-testid="pagination-page-indicator">
                  {t.pagination.pageOf
                    .replace("{current}", safeCurrentPage.toString())
                    .replace("{total}", totalPages.toString())}
                </span>
                <button
                  type="button"
                  data-testid="pagination-next"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={t.pagination.next}
                >
                  &rsaquo;
                </button>
                <button
                  type="button"
                  data-testid="pagination-last"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={t.pagination.last}
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="mt-4 rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          >
            {t.downloadButton}
          </button>
        </div>
      )}
    </div>
  );
}