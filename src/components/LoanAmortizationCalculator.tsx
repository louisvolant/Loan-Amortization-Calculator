// src/components/LoanAmortizationCalculator.tsx
"use client";

import React, { useState } from "react";

interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}

interface TableRowInput {
  month: string;
  payment: string;
  interest: string;
  principal: string;
  remainingBalance: string;
}

export default function LoanAmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [tableRows, setTableRows] = useState<TableRowInput[]>([
    { month: "", payment: "", interest: "", principal: "", remainingBalance: "" },
  ]);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationRow[]>([]);
  const [error, setError] = useState("");

  const addTableRow = () => {
    if (tableRows.length < 3) {
      setTableRows([
        ...tableRows,
        { month: "", payment: "", interest: "", principal: "", remainingBalance: "" },
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
      setError("Please provide valid loan amount, interest rate, and term.");
      return;
    }

    // If table rows are provided, try to infer parameters
    if (tableRows.some(row => row.month || row.payment || row.interest || row.principal || row.remainingBalance)) {
      const validRows = tableRows.filter(row => row.month && row.payment && row.interest && row.principal && row.remainingBalance);
      if (validRows.length > 0) {
        // Use the first valid row to infer parameters
        const firstRow = validRows[0];
        const payment = parseFloat(firstRow.payment);
        const interest = parseFloat(firstRow.interest);
        const principal = parseFloat(firstRow.principal);
        const remainingBalance = parseFloat(firstRow.remainingBalance);
        const month = parseInt(firstRow.month);

        // Infer loan amount if month > 1
        if (month > 1) {
          // Back-calculate initial loan amount (simplified)
          amount = remainingBalance + principal;
          for (let i = 1; i < month; i++) {
            amount = amount / (1 + rate) + principal;
          }
        }
      }
    }

    // Calculate monthly payment
    const monthlyPayment = amount * (rate / (1 - Math.pow(1 + rate, -term)));
    if (!isFinite(monthlyPayment) || monthlyPayment <= 0) {
      setError("Invalid calculation. Please check your inputs.");
      return;
    }

    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let balance = amount;
    for (let i = 1; i <= term && balance > 0; i++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = balance - principalPayment;

      schedule.push({
        month: i,
        payment: parseFloat(monthlyPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        remainingBalance: parseFloat(Math.max(balance, 0).toFixed(2)),
      });
    }

    setAmortizationSchedule(schedule);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">
        Mortgage Amortization Calculator
      </h2>

      {/* Loan Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Loan Amount (€)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter loan amount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter interest rate"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Loan Term (Years)
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter loan term"
          />
        </div>
      </div>

      {/* Optional Amortization Table Rows */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Optional: Enter Amortization Table Rows
        </h3>
        {tableRows.map((row, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 mb-2">
            <input
              type="number"
              value={row.month}
              onChange={(e) => updateTableRow(index, "month", e.target.value)}
              placeholder="Month"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <input
              type="number"
              value={row.payment}
              onChange={(e) => updateTableRow(index, "payment", e.target.value)}
              placeholder="Payment (€)"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <input
              type="number"
              value={row.interest}
              onChange={(e) => updateTableRow(index, "interest", e.target.value)}
              placeholder="Interest (€)"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <input
              type="number"
              value={row.principal}
              onChange={(e) => updateTableRow(index, "principal", e.target.value)}
              placeholder="Principal (€)"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <input
              type="number"
              value={row.remainingBalance}
              onChange={(e) => updateTableRow(index, "remainingBalance", e.target.value)}
              placeholder="Balance (€)"
              className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
          </div>
        ))}
        {tableRows.length < 3 && (
          <button
            onClick={addTableRow}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Add Row
          </button>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateAmortization}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Calculate Amortization Schedule
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-red-500 text-center">{error}</p>
      )}

      {/* Amortization Table */}
      {amortizationSchedule.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Amortization Schedule
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900">
                <th className="p-2 border-b">Month</th>
                <th className="p-2 border-b">Payment (€)</th>
                <th className="p-2 border-b">Interest (€)</th>
                <th className="p-2 border-b">Principal (€)</th>
                <th className="p-2 border-b">Remaining Balance (€)</th>
              </tr>
            </thead>
            <tbody>
              {amortizationSchedule.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2 border-b">{row.month}</td>
                  <td className="p-2 border-b">{row.payment.toFixed(2)}</td>
                  <td className="p-2 border-b">{row.interest.toFixed(2)}</td>
                  <td className="p-2 border-b">{row.principal.toFixed(2)}</td>
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