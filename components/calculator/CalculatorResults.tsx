"use client";

import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';

const CalculatorResults = () => {
  const { inputs, results, formatCurrency } = useCalculator();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Résultats</h2>
      
      <div className="space-y-4">
        <div className="border-b pb-2">
          <p className="text-sm text-gray-500">Mensualité du prêt</p>
          <p className="text-lg font-semibold">{formatCurrency(results.monthlyPayment)}</p>
        </div>
        
        <div className="border-b pb-2">
          <p className="text-sm text-gray-500">Rendement brut</p>
          <p className="text-lg font-semibold">{results.grossYield.toFixed(2)}%</p>
        </div>
        
        <div className="border-b pb-2">
          <p className="text-sm text-gray-500">Cash-flow mensuel</p>
          <p className="text-lg font-semibold">
            {results.monthlyCashFlow >= 0 ? (
              <span className="text-green-600">{formatCurrency(results.monthlyCashFlow)}</span>
            ) : (
              <span className="text-red-600">{formatCurrency(results.monthlyCashFlow)}</span>
            )}
          </p>
        </div>
        
        <div className="border-b pb-2">
          <p className="text-sm text-gray-500">Cash-flow annuel</p>
          <p className="text-lg font-semibold">
            {results.annualCashFlow >= 0 ? (
              <span className="text-green-600">{formatCurrency(results.annualCashFlow)}</span>
            ) : (
              <span className="text-red-600">{formatCurrency(results.annualCashFlow)}</span>
            )}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">ROI (Retour sur investissement)</p>
          <p className="text-lg font-semibold">{results.roi.toFixed(2)}%</p>
        </div>
      </div>
      
      {results.monthlyCashFlow < 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-700 text-sm">
          ⚠️ Ce projet génère un cash-flow négatif. Vérifiez vos paramètres ou explorez d'autres options.
        </div>
      )}
    </div>
  );
};

export default CalculatorResults;
