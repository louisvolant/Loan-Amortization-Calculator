// src/components/LoanAmortizationCalculator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { translations } from "../utils/translations";
import { AmortizationRow, TableRowInput, Language } from "../utils/globals";

export default function LoanAmortizationCalculator() {
  // State declarations
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");
  const [insuranceRate, setInsuranceRate] = useState("");
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

  // Load state from localStorage
   useEffect(() => {
     try {
       const savedState = localStorage.getItem("mortgageCalculatorState");
       if (savedState) {
         const parsedState = JSON.parse(savedState);
         setLoanAmount(parsedState.loanAmount || "");
         setInterestRate(parsedState.interestRate || "");
         setLoanTermMonths(parsedState.loanTermMonths || "");
         setInsuranceRate(parsedState.insuranceRate || ""); // Load insurance rate
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
         insuranceRate, // Save insurance rate
         tableRows,
         amortizationSchedule,
         language,
       };
       localStorage.setItem("mortgageCalculatorState", JSON.stringify(stateToSave));
     } catch (error) {
       console.error("Error saving to localStorage:", error);
     }
   }, [loanAmount, interestRate, loanTermMonths, insuranceRate, tableRows, amortizationSchedule, language]);

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

  // Update a table row
  const updateTableRow = (index: number, field: keyof TableRowInput, value: string) => {
    const newRows = [...tableRows];
    newRows[index][field] = value;
    setTableRows(newRows);
  };

  // Calculate amortization schedule
const calculateAmortization = () => {
  setError("");
  const initialLoanAmount = parseFloat(loanAmount);
  const annualInterestRate = parseFloat(interestRate);
  const totalLoanTermMonths = parseInt(loanTermMonths);
  const annualInsuranceRate = parseFloat(insuranceRate); // Get the insurance rate

  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const monthlyInsuranceRate = annualInsuranceRate / 100 / 12; // Monthly insurance rate

  // Basic input validation
  if (isNaN(initialLoanAmount) || initialLoanAmount <= 0 ||
      isNaN(annualInterestRate) || annualInterestRate <= 0 ||
      isNaN(totalLoanTermMonths) || totalLoanTermMonths <= 0) {
    setError(
      language === "en"
        ? "Please provide valid loan amount, annual interest rate, and loan term (in months)."
        : language === "es"
        ? "Por favor, proporcione un monto de préstamo válido, tasa de interés anual y plazo del préstamo (en meses)."
        : "Veuillez fournir un montant de prêt valide, un taux d'intérêt annuel et une durée de prêt (en mois)."
    );
    return;
  }

  // Pre-calculate what the "fixed principal portion" would be if it were a linear amortization.
  // This is a common pattern in French loans where the principal repayment increases slightly
  // to keep the total payment relatively stable or decreasing.
  // However, given your PDF shows decreasing total payment, let's assume
  // a fixed or increasing principal part that leads to a decreasing total payment.
  // A simpler model is to assume the *calculated* Principal portion will lead to a specific remaining balance.
  // We'll iterate and calculate month by month.

  const fullSchedule: AmortizationRow[] = [];
  let currentBalance = initialLoanAmount;
  let currentEffectiveTermRemaining = totalLoanTermMonths; // This will adjust if payments are skipped/extra
  let lastProvidedRank = 0;
  let lastProvidedDueDate: Date | null = null;
  let lastProvidedPayment: number | null = null; // To carry forward if applicable
  let lastProvidedPrincipal: number | null = null;
  let lastProvidedInterest: number | null = null;
  let lastProvidedAdditionalCosts: number | null = null; // To carry forward the *last known* additional cost

  // Process and sort optional amortization table rows
  const filledTableRows = tableRows.filter(
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
  ).sort((a, b) => parseInt(a.rank) - parseInt(b.rank));

  // Determine initial payment based on the first period of the original loan
  // This assumes a standard annuity loan for the principal and interest part
  // if no optional rows are provided. If optional rows are provided, they override.
  let currentMonthlyPayment = initialLoanAmount * (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -totalLoanTermMonths)));
  if (!isFinite(currentMonthlyPayment)) {
    // Handle cases where monthlyInterestRate is 0 or totalLoanTermMonths is problematic
    // For example, if monthlyInterestRate is 0, then principal payment should be loanAmount / totalLoanTermMonths
    if (monthlyInterestRate === 0 && totalLoanTermMonths > 0) {
        currentMonthlyPayment = initialLoanAmount / totalLoanTermMonths;
    } else {
        // Fallback or error for other problematic cases
        setError("Error: Cannot calculate initial monthly payment. Check interest rate and loan term.");
        return;
    }
  }


  // To handle the decreasing 'Accessoires', we'll use a dynamic `currentAdditionalCosts`
  // Initialize currentAdditionalCosts based on the initial loan amount
  let currentAdditionalCosts = initialLoanAmount * monthlyInsuranceRate; // Calculate initial insurance based on full loan amount

  // Iterate through each possible rank up to the total loan term
  for (let i = 1; i <= totalLoanTermMonths; i++) {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(5); // Assuming payments are due on the 5th based on your PDF
    defaultDueDate.setMonth(defaultDueDate.getMonth() + i - 1);

    let rankToPush: AmortizationRow;

    // Check if this rank is present in the provided table rows
    const providedRow = filledTableRows.find(row => parseInt(row.rank) === i);

    if (providedRow) {
      // Use the provided values for this rank
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

      // Update current state for next calculations
      currentBalance = providedBalance;
      lastProvidedRank = i;
      lastProvidedDueDate = new Date(providedRow.dueDate);
      lastProvidedPayment = providedPayment;
      lastProvidedPrincipal = providedPrincipal;
      lastProvidedInterest = providedInterest;
      lastProvidedAdditionalCosts = providedAdditionalCosts; // Carry forward provided additional costs

      // If this provided row clears the loan, stop.
      if (currentBalance <= 0) {
        fullSchedule.push(rankToPush);
        break;
      }

      // If we just processed a provided row, we need to potentially recalculate
      // the base principal/interest payment for the *remaining* loan duration
      // if the remaining balance dramatically changed due to a lump sum.
      // This is the tricky part: how does the bank re-amortize after a lump sum?
      // Common scenarios:
      // 1. Keep original payment, reduce term (requires re-calculating remaining term)
      // 2. Keep original term, reduce payment (requires re-calculating new payment)
      // Your PDF implies a fixed interest rate with changing principal/interest parts.
      // Let's assume that after an override, the *remaining balance* is simply
      // re-amortized over the *remaining original term* with a *recalculated fixed monthly principal+interest payment*.
      // The additional costs will continue to be calculated based on the new currentBalance.
      const remainingPaymentsCount = totalLoanTermMonths - lastProvidedRank;
      if (remainingPaymentsCount > 0 && currentBalance > 0) {
          const denominator = (1 - Math.pow(1 + monthlyInterestRate, -remainingPaymentsCount));
          if (denominator === 0) { // Handle division by zero for monthlyInterestRate = 0
            currentMonthlyPayment = currentBalance / remainingPaymentsCount;
          } else {
            currentMonthlyPayment = currentBalance * (monthlyInterestRate / denominator);
          }
      } else if (currentBalance <= 0) {
          currentMonthlyPayment = 0; // Loan fully paid
      }

    } else {
      // This is a calculated row
      if (currentBalance <= 0) {
        break; // Loan is fully paid off
      }

      const interestPayment = currentBalance * monthlyInterestRate;

      // Calculate additional costs based on the current remaining balance
      // If no insurance rate is provided, or if the optional row specified 0, it stays 0.
      let calculatedAdditionalCosts = isNaN(monthlyInsuranceRate) ? 0 : currentBalance * monthlyInsuranceRate;
      // If a last provided additional cost exists, use it if it seems consistent,
      // otherwise rely on calculated. For simplicity, let's assume it's recalculated
      // based on the currentBalance or fixed after an optional row sets it.
      // For now, let's use the currentBalance * monthlyInsuranceRate as the standard.
      // You can refine this if insurance has a truly fixed component or a different calculation.

      // Determine the principal + interest portion of the payment for this period.
      // This is the most ambiguous part given your loan's "decreasing payment" characteristic.
      // If the loan has a fixed "amortized principal" portion, that's what's needed.
      // If it's an annuity loan whose payments are recalculated on remaining term:
      // We'll use the `currentMonthlyPayment` which was either the `originalLoanPrincipalInterestPayment`
      // or the recalculated one after an optional row.
      let principalInterestPayment = currentMonthlyPayment; // The base payment for P+I

      let principalPayment = principalInterestPayment - interestPayment;

      // Ensure principal payment does not over-amortize the loan
      if (principalPayment > currentBalance) {
        principalPayment = currentBalance;
      }

      // Update balance
      currentBalance -= principalPayment;

      // Calculate total payment for this row
      const totalPayment = principalPayment + interestPayment + calculatedAdditionalCosts;

      const effectiveDueDate = new Date(lastProvidedDueDate || defaultDueDate);
      effectiveDueDate.setMonth(effectiveDueDate.getMonth() + (i - lastProvidedRank)); // Adjust month correctly

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

    // If current balance reaches 0 or less, stop
    if (currentBalance <= 0 && providedRow === undefined) { // Stop if paid off *by calculation*, not necessarily by provided row
      break;
    }
  }

  setAmortizationSchedule(fullSchedule);
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
`; // Added insuranceRate to CSV export

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(inputsData + "\n" + headers + "\n" + rows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "amortization_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const t = translations[language];

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
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.loanAmountLabel}
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            placeholder={t.placeholders.loanAmount}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.interestRateLabel}
          </label>
          <input
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            placeholder={t.placeholders.interestRate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.loanTermLabel}
          </label>
          <input
            type="number"
            value={loanTermMonths}
            onChange={(e) => setLoanTermMonths(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            placeholder={t.placeholders.loanTerm}
          />
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.insuranceRateLabel}
            </label>
            <input
              type="number"
              step="0.01"
              value={insuranceRate}
              onChange={(e) => setInsuranceRate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
              placeholder={t.placeholders.insuranceRate}
            />
          </div>
      </div>

      {/* Optional Amortization Table Rows */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">{t.optionalRowsTitle}</h3>{t.optionalRowsTitle}</h3>
        {tableRows.map((row, index) => (
          <div key={index} className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            <input
              type="number"
              value={row.rank}
              onChange={(e) => updateTableRow(index, "rank", e.target.value)}
              placeholder={t.placeholders.rank}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            />
            <input
              type="date"
              value={row.dueDate}
              onChange={(e) => updateTableRow(index, "dueDate", e.target.value)}
              placeholder={t.placeholders.dueDate}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[150px]"
            />
            <input
              type="number"
              value={row.payment}
              onChange={(e) => updateTableRow(index, "payment", e.target.value)}
              placeholder={t.placeholders.payment}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            />
            <input
              type="number"
              value={row.principal}
              onChange={(e) => updateTableRow(index, "principal", e.target.value)}
              placeholder={t.placeholders.principal}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            />
            <input
              type="number"
              value={row.interest}
              onChange={(e) => updateTableRow(index, "interest", e.target.value)}
              placeholder={t.placeholders.interest}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            />
            <input
              type="number"
              value={row.additionalCosts}
              onChange={(e) => updateTableRow(index, "additionalCosts", e.target.value)}
              placeholder={t.placeholders.additionalCosts}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            />
            <input
              type="number"
              value={row.remainingBalance}
              onChange={(e) => updateTableRow(index, "remainingBalance", e.target.value)}
              placeholder={t.placeholders.remainingBalance}
              className="rounded-md border border-gray-300 bg-gray-50 p-3 text-base dark:border-gray-600 dark:bg-gray-700 min-w-[100px]"
            />
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
        className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      >
        {t.calculateButton}
      </button>

      {/* Error Message */}
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}

      {/* Amortization Table */}
      {amortizationSchedule.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">{t.amortizationScheduleTitle}</h3>
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
              {amortizationSchedule.map((row) => (
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