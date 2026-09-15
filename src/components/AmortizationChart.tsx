// src/components/AmortizationChart.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartConfiguration,
} from "chart.js";
import { AmortizationRow, Translations } from "../utils/globals";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AmortizationChartProps {
  schedule: AmortizationRow[];
  translations: Translations[string]["charts"];
}

type ChartView = "annual" | "cumulative" | "monthly";

export default function AmortizationChart({ schedule, translations: t }: AmortizationChartProps) {
  const [view, setView] = useState<ChartView>("annual");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Compute KPI summaries
  const totals = useMemo(() => {
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalCosts = 0;

    for (const row of schedule) {
      totalPrincipal += row.principal;
      totalInterest += row.interest;
      totalCosts += row.additionalCosts;
    }

    return {
      principal: totalPrincipal,
      interest: totalInterest,
      costs: totalCosts,
      total: totalPrincipal + totalInterest + totalCosts,
    };
  }, [schedule]);

  useEffect(() => {
    if (!canvasRef.current || schedule.length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "#94a3b8" : "#475569";

    let config: ChartConfiguration;

    if (view === "annual") {
      // Group by year (every 12 payments)
      const yearlyData: { [year: number]: { principal: number; interest: number } } = {};
      for (const row of schedule) {
        const year = Math.ceil(row.rank / 12);
        if (!yearlyData[year]) {
          yearlyData[year] = { principal: 0, interest: 0 };
        }
        yearlyData[year].principal += row.principal;
        yearlyData[year].interest += row.interest;
      }

      const years = Object.keys(yearlyData).map(Number);
      const labels = years.map((y) => `${t.year} ${y}`);
      const principalData = years.map((y) => parseFloat(yearlyData[y].principal.toFixed(2)));
      const interestData = years.map((y) => parseFloat(yearlyData[y].interest.toFixed(2)));

      config = {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: t.principal,
              data: principalData,
              backgroundColor: "rgba(59, 130, 246, 0.85)", // Blue
              borderRadius: 4,
              stack: "combined",
            },
            {
              label: t.interest,
              data: interestData,
              backgroundColor: "rgba(245, 158, 11, 0.85)", // Amber
              borderRadius: 4,
              stack: "combined",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: { color: textColor },
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.dataset.label}: €${Number(context.raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: { color: gridColor },
              ticks: { color: textColor },
            },
            y: {
              stacked: true,
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: (val) => `€${Number(val).toLocaleString()}`,
              },
            },
          },
        },
      };
    } else if (view === "cumulative") {
      const labels: string[] = [];
      const balanceData: number[] = [];
      const cumPrincipalData: number[] = [];
      const cumInterestData: number[] = [];

      let runningPrincipal = 0;
      let runningInterest = 0;

      // Sample every few months if schedule is very long to optimize chart performance
      const step = schedule.length > 120 ? Math.ceil(schedule.length / 60) : 1;

      schedule.forEach((row, idx) => {
        runningPrincipal += row.principal;
        runningInterest += row.interest;

        if (idx % step === 0 || idx === schedule.length - 1) {
          labels.push(`${t.month} ${row.rank}`);
          balanceData.push(parseFloat(row.remainingBalance.toFixed(2)));
          cumPrincipalData.push(parseFloat(runningPrincipal.toFixed(2)));
          cumInterestData.push(parseFloat(runningInterest.toFixed(2)));
        }
      });

      config = {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: t.remainingBalance,
              data: balanceData,
              borderColor: "rgba(148, 163, 184, 1)", // Slate
              backgroundColor: "rgba(148, 163, 184, 0.1)",
              fill: false,
              tension: 0.1,
              pointRadius: 1,
            },
            {
              label: t.cumulativePrincipal,
              data: cumPrincipalData,
              borderColor: "rgba(16, 185, 129, 1)", // Emerald
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: false,
              tension: 0.1,
              pointRadius: 1,
            },
            {
              label: t.cumulativeInterest,
              data: cumInterestData,
              borderColor: "rgba(245, 158, 11, 1)", // Amber
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              fill: false,
              tension: 0.1,
              pointRadius: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: { color: textColor },
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.dataset.label}: €${Number(context.raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor },
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: (val) => `€${Number(val).toLocaleString()}`,
              },
            },
          },
        },
      };
    } else {
      // Monthly Breakdown
      const labels = schedule.map((r) => `${t.month} ${r.rank}`);
      const principalData = schedule.map((r) => r.principal);
      const interestData = schedule.map((r) => r.interest);

      config = {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: t.principal,
              data: principalData,
              backgroundColor: "rgba(59, 130, 246, 0.85)",
              stack: "monthly",
            },
            {
              label: t.interest,
              data: interestData,
              backgroundColor: "rgba(245, 158, 11, 0.85)",
              stack: "monthly",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: { color: textColor },
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.dataset.label}: €${Number(context.raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: { color: gridColor },
              ticks: { color: textColor, maxTicksLimit: 24 },
            },
            y: {
              stacked: true,
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: (val) => `€${Number(val).toLocaleString()}`,
              },
            },
          },
        },
      };
    }

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [schedule, view, t]);

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/60" data-testid="amortization-chart-container">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-blue-500/10 p-3 text-center border border-blue-500/20">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t.totalPrincipal}</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300" data-testid="kpi-total-principal">
            €{totals.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-3 text-center border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t.totalInterest}</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300" data-testid="kpi-total-interest">
            €{totals.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-3 text-center border border-emerald-500/20">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t.totalInsurance}</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300" data-testid="kpi-total-insurance">
            €{totals.costs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg bg-purple-500/10 p-3 text-center border border-purple-500/20">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t.totalCost}</p>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300" data-testid="kpi-total-cost">
            €{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Chart Header & View Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t.title}</h3>
        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 text-xs dark:border-gray-600 dark:bg-gray-700">
          <button
            type="button"
            data-testid="chart-tab-annual"
            onClick={() => setView("annual")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "annual"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            {t.annualBreakdown}
          </button>
          <button
            type="button"
            data-testid="chart-tab-cumulative"
            onClick={() => setView("cumulative")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "cumulative"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            {t.cumulativeTotals}
          </button>
          <button
            type="button"
            data-testid="chart-tab-monthly"
            onClick={() => setView("monthly")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "monthly"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            }`}
          >
            {t.monthlyBreakdown}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative h-72 sm:h-96 w-full">
        <canvas ref={canvasRef} data-testid="amortization-chart-canvas" />
      </div>
    </div>
  );
}
