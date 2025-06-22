// src/components/LoanAmortizationCalculator.tsx
"use client";

import React, { useState, useEffect } from "react";
import { translations } from "../utils/translations";
import { AmortizationRow, TableRowInput, Language } from "../utils/globals";

export default function LoanAmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");
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

  useEffect(() => {
    try {
      const savedState = localStorage.getItem("mortgageCalculatorState");
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log("Loaded from localStorage:", parsedState);
        setLoanAmount(parsedState.loanAmount || "");
        setInterestRate(parsedState.interestRate || "");
        // Load as loanTermMonths
        setLoanTermMonths(parsedState.loanTermMonths || "");
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
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    try {
      const stateToSave = {
        loanAmount,
        interestRate,
        loanTermMonths, // Save as loanTermMonths
        tableRows,
        amortizationSchedule,
        language,
      };
      console.log("Saving to localStorage:", stateToSave);
      localStorage.setItem("mortgageCalculatorState", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [loanAmount, interestRate, loanTermMonths, tableRows, amortizationSchedule, language]); // Dependency updated

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
  const initialLoanAmount = parseFloat(loanAmount); // Use a new variable for the initial amount
  const annualRate = parseFloat(interestRate);
  const totalLoanTermMonths = parseInt(loanTermMonths); // Renamed from loanTerm to loanTermMonths

  const monthlyRate = annualRate / 100 / 12;

  // Validate initial inputs
  if (!initialLoanAmount || isNaN(initialLoanAmount) || initialLoanAmount <= 0 ||
      !annualRate || isNaN(annualRate) || annualRate <= 0 ||
      !totalLoanTermMonths || isNaN(totalLoanTermMonths) || totalLoanTermMonths <= 0) {
    setError(
      language === "en"
        ? "Please provide valid loan amount, annual interest rate, and loan term (in months)."
        : language === "es"
        ? "Por favor, proporcione un monto de préstamo válido, tasa de interés anual y plazo del préstamo (en meses)."
        : "Veuillez fournir un montant de prêt valide, un taux d'intérêt annuel et une durée de prêt (en mois)."
    );
    return;
  }

  // Calculate the monthly payment for the *original* loan
  const originalMonthlyPayment = initialLoanAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalLoanTermMonths)));

  if (!isFinite(originalMonthlyPayment) || originalMonthlyPayment <= 0) {
    setError(
      language === "en"
        ? "Invalid calculation for original monthly payment. Please check your inputs."
        : language === "es"
        ? "Cálculo inválido para el pago mensual original. Por favor, revise sus entradas."
        : "Calcul invalide pour le paiement mensuel initial. Veuillez vérifier vos entrées."
    );
    return;
  }

  const fullSchedule: AmortizationRow[] = [];
  let currentBalance = initialLoanAmount;
  let lastCalculatedRank = 0;
  let currentMonthlyPayment = originalMonthlyPayment; // This will change if a lump sum impacts it
  let currentAdditionalCosts = 0; // To carry forward additional costs

  // Process optional amortization table rows
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
  ).sort((a, b) => parseInt(a.rank) - parseInt(b.rank)); // Ensure sorted by rank

  // Keep track of the last provided row's actual values to resume calculation
  let overrideRemainingBalance: number | null = null;
  let overrideRank: number | null = null;
  let overrideDueDate: Date | null = null;
  let overrideAdditionalCosts: number | null = null;


  // Populate the schedule up to the total loan term
  for (let i = 1; i <= totalLoanTermMonths; i++) {
    const dueDate = new Date();
    dueDate.setDate(1); // Start from the first of the current month
    dueDate.setMonth(dueDate.getMonth() + i - 1); // Adjust month for rank

    // Check if this rank is present in the provided table rows
    const providedRow = filledTableRows.find(row => parseInt(row.rank) === i);

    if (providedRow) {
      // Use the provided values for this rank
      const providedBalance = parseFloat(providedRow.remainingBalance);
      const providedPayment = parseFloat(providedRow.payment);
      const providedPrincipal = parseFloat(providedRow.principal);
      const providedInterest = parseFloat(providedRow.interest);
      const providedAdditionalCosts = parseFloat(providedRow.additionalCosts);

      fullSchedule.push({
        rank: i,
        dueDate: providedRow.dueDate,
        payment: providedPayment,
        principal: providedPrincipal,
        interest: providedInterest,
        additionalCosts: providedAdditionalCosts,
        remainingBalance: providedBalance,
      });

      // Update currentBalance for the next calculation
      currentBalance = providedBalance;
      lastCalculatedRank = i;
      overrideRemainingBalance = providedBalance;
      overrideRank = i;
      overrideDueDate = new Date(providedRow.dueDate);
      currentAdditionalCosts = providedAdditionalCosts; // Carry forward the provided additional costs

      // If this is the last provided row and there's remaining balance, recalculate monthly payment for subsequent periods
      if (currentBalance > 0 && i === filledTableRows[filledTableRows.length - 1].rank) {
          const remainingTermForRecalculation = totalLoanTermMonths - overrideRank;
          if (remainingTermForRecalculation > 0) {
              const denominator = (1 - Math.pow(1 + monthlyRate, -remainingTermForRecalculation));
              if (denominator === 0) {
                setError(
                  language === "en"
                    ? "Cannot calculate monthly payment with given terms for remaining loan. Please check interest rate and term."
                    : language === "es"
                    ? "No se puede calcular el pago mensual con los términos dados para el préstamo restante. Verifique la tasa de interés y el plazo."
                    : "Impossible de calculer le paiement mensuel avec les termes donnés pour le prêt restant. Veuillez vérifier le taux d'intérêt et la durée."
                );
                return;
              }
              currentMonthlyPayment = currentBalance * (monthlyRate / denominator);
          } else {
            currentMonthlyPayment = 0; // Loan paid off
          }
      }

    } else if (i > lastCalculatedRank && currentBalance > 0) {
      // For ranks after the last provided row, or if no rows were provided at all
      const interestPayment = currentBalance * monthlyRate;
      let principalPayment = currentMonthlyPayment - interestPayment - currentAdditionalCosts; // Deduct additional costs

      // Handle the last payment to ensure balance becomes zero
      if (principalPayment > currentBalance) {
        principalPayment = currentBalance;
      }

      currentBalance = currentBalance - principalPayment;

      const nextDueDate = new Date(overrideDueDate || dueDate); // Use overrideDueDate if available, otherwise default
      nextDueDate.setMonth(nextDueDate.getMonth() + (i - (overrideRank || 0))); // Adjust month for rank relative to override

      fullSchedule.push({
        rank: i,
        dueDate: nextDueDate.toISOString().split("T")[0],
        payment: parseFloat(currentMonthlyPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        additionalCosts: parseFloat(currentAdditionalCosts.toFixed(2)), // Carry forward
        remainingBalance: parseFloat(Math.max(currentBalance, 0).toFixed(2)),
      });

      lastCalculatedRank = i;

    } else if (currentBalance <= 0) {
      // If balance is already zero, stop adding rows
      break;
    }
  }

  setAmortizationSchedule(fullSchedule);
};

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

    const rows = amortizationSchedule.map(row =>
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
`;

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
            value={loanTermMonths} // Use loanTermMonths here
            onChange={(e) => setLoanTermMonths(e.target.value)}
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
          <button
                      onClick={handleDownload}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      {t.downloadButton}
                    </button>
        </div>
      )}
    </div>
  );
}