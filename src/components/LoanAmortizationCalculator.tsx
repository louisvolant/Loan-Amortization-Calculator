// src/components/LoanAmortizationCalculator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { translations } from "../utils/translations";
import { AmortizationRow, TableRowInput, Language } from "../utils/globals";

export default function LoanAmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
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

  // Load state from local storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("mortgageCalculatorState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setLoanAmount(parsedState.loanAmount || "");
      setInterestRate(parsedState.interestRate || "");
      setLoanTerm(parsedState.loanTerm || "");
      setTableRows(
        parsedState.tableRows || [
          {
            rank: "",
            dueDate: "",
            payment: "",
            principal: "",
            interest: "",
            additionalCosts: "",
            remainingBalance: "",
          },
        ]
      );
      setAmortizationSchedule(parsedState.amortizationSchedule || []);
      setLanguage(parsedState.language || "en");
    }
  }, []);

  // Save state to local storage when inputs, schedule, or language change
  useEffect(() => {
    const stateToSave = {
      loanAmount,
      interestRate,
      loanTerm,
      tableRows,
      amortizationSchedule,
      language,
    };
    localStorage.setItem("mortgageCalculatorState", JSON.stringify(stateToSave));
  }, [loanAmount, interestRate, loanTerm, tableRows, amortizationSchedule, language]);

  const addTableRow = () => {
    if (tableRows.length < 3) {
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

  const updateTableRow = (index: number, field: keyof TableRowInput, value: string) => {
    const newRows = [...tableRows];
    newRows[index][field] = value;
    setTableRows(newRows);
  };

  const calculateAmortization = () => {
    setError("");
    let amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const term = parseInt(loanTerm) * 12; // Total months

    // Validate basic inputs
    if (!amount || !rate || !term || amount <= 0 || rate <= 0 || term <= 0) {
      setError(
        language === "en"
          ? "Please provide valid loan amount, interest rate, and term."
          : language === "es"
          ? "Por favor, proporcione un monto de préstamo, tasa de interés y plazo válidos."
          : "Veuillez fournir un montant de prêt, un taux d'intérêt et une durée valides."
      );
      return;
    }

    // If table rows are provided, try to infer parameters
    if (
      tableRows.some(
        (row) =>
          row.rank ||
          row.dueDate ||
          row.payment ||
          row.principal ||
          row.interest ||
          row.additionalCosts ||
          row.remainingBalance
      )
    ) {
      const validRows = tableRows.filter(
        (row) =>
          row.rank &&
          row.payment &&
          row.principal &&
          row.interest &&
          row.additionalCosts &&
          row.remainingBalance
      );
      if (validRows.length > 0) {
        // Use the first valid row to infer parameters
        const firstRow = validRows[0];
        const payment = parseFloat(firstRow.payment);
        const interest = parseFloat(firstRow.interest);
        const principal = parseFloat(firstRow.principal);
        const remainingBalance = parseFloat(firstRow.remainingBalance);
        const rank = parseInt(firstRow.rank);

        // Infer loan amount if rank > 1
        if (rank > 1) {
          // Back-calculate initial loan amount (simplified)
          amount = remainingBalance + principal;
          for (let i = 1; i < rank; i++) {
            amount = amount / (1 + rate) + principal;
          }
        }
      }
    }

    // Calculate monthly payment
    const monthlyPayment = amount * (rate / (1 - Math.pow(1 + rate, -term)));
    if (!isFinite(monthlyPayment) || monthlyPayment <= 0) {
      setError(
        language === "en"
          ? "Invalid calculation. Please check your inputs."
          : language === "es"
          ? "Cálculo inválido. Por favor, revise sus entradas."
          : "Calcul invalide. Veuillez vérifier vos entrées."
      );
      return;
    }

    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let balance = amount;
    const startDate = new Date();
    startDate.setDate(1); // Start from the first of the current month

    for (let i = 1; i <= term && balance > 0; i++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = balance - principalPayment;

      // Calculate due date
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      schedule.push({
        rank: i,
        dueDate: dueDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        payment: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        additionalCosts: 0, // Placeholder
        remainingBalance: parseFloat(Math.max(balance, 0).toFixed(2)),
      });
    }

    setAmortizationSchedule(schedule);
  };

  const t = translations[language];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{t.title}</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>

{/* Loan Details Form */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {t.loanAmountLabel}
    </label>
    <input
      type="number"
      value={loanAmount}
      onChange={(e) => setLoanAmount(e.target.value)}
      className="mt-1 w-full p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
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
      className="mt-1 w-full p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
      placeholder={t.placeholders.interestRate}
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {t.loanTermLabel}
    </label>
    <input
      type="number"
      value={loanTerm}
      onChange={(e) => setLoanTerm(e.target.value)}
      className="mt-1 w-full p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 min-w-[100px]"
      placeholder={t.placeholders.loanTerm}
    />
  </div>
</div>

{/* Optional Amortization Table Rows */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
    {t.optionalRowsTitle}
  </h3>
  {tableRows.map((row, index) => (
    <div
      key={index}
      className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-4"
    >
      <input
        type="number"
        value={row.rank}
        onChange={(e) => updateTableRow(index, "rank", e.target.value)}
        placeholder={t.placeholders.rank}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[100px]"
      />
      <input
        type="date"
        value={row.dueDate}
        onChange={(e) => updateTableRow(index, "dueDate", e.target.value)}
        placeholder={t.placeholders.dueDate}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[150px]"
      />
      <input
        type="number"
        value={row.payment}
        onChange={(e) => updateTableRow(index, "payment", e.target.value)}
        placeholder={t.placeholders.payment}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[100px]"
      />
      <input
        type="number"
        value={row.principal}
        onChange={(e) => updateTableRow(index, "principal", e.target.value)}
        placeholder={t.placeholders.principal}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[100px]"
      />
      <input
        type="number"
        value={row.interest}
        onChange={(e) => updateTableRow(index, "interest", e.target.value)}
        placeholder={t.placeholders.interest}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[100px]"
      />
      <input
        type="number"
        value={row.additionalCosts}
        onChange={(e) => updateTableRow(index, "additionalCosts", e.target.value)}
        placeholder={t.placeholders.additionalCosts}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[100px]"
      />
      <input
        type="number"
        value={row.remainingBalance}
        onChange={(e) => updateTableRow(index, "remainingBalance", e.target.value)}
        placeholder={t.placeholders.remainingBalance}
        className="p-3 text-base border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-w-[100px]"
      />
    </div>
  ))}
  {tableRows.length < 3 && (
    <button
      onClick={addTableRow}
      className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
    >
      {t.addRowButton}
    </button>
  )}
</div>

      {/* Calculate Button */}
      <button
        onClick={calculateAmortization}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        {t.calculateButton}
      </button>

      {/* Error Message */}
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {/* Amortization Table */}
      {amortizationSchedule.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t.amortizationScheduleTitle}
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900">
                <th className="p-2 border-b">{t.tableHeaders.rank}</th>
                <th className="p-2 border-b">{t.tableHeaders.dueDate}</th>
                <th className="p-2 border-b">{t.tableHeaders.payment}</th>
                <th className="p-2 border-b">{t.tableHeaders.principal}</th>
                <th className="p-2 border-b">{t.tableHeaders.interest}</th>
                <th className="p-2 border-b">{t.tableHeaders.additionalCosts}</th>
                <th className="p-2 border-b">{t.tableHeaders.remainingBalance}</th>
              </tr>
            </thead>
            <tbody>
              {amortizationSchedule.map((row) => (
                <tr key={row.rank} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2 border-b">{row.rank}</td>
                  <td className="p-2 border-b">{row.dueDate}</td>
                  <td className="p-2 border-b">{row.payment.toFixed(2)}</td>
                  <td className="p-2 border-b">{row.principal.toFixed(2)}</td>
                  <td className="p-2 border-b">{row.interest.toFixed(2)}</td>
                  <td className="p-2 border-b">{row.additionalCosts.toFixed(2)}</td>
                  <td className="p-2 border-b">{row.remainingBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}