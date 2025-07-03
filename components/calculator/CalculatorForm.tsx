"use client";

import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';

const CalculatorForm = () => {
  const { inputs, setInputs } = useCalculator();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = name !== 'location' ? parseFloat(value) || 0 : value;
    
    setInputs({
      ...inputs,
      [name]: numericValue
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Paramètres de l'investissement</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lieu</label>
            <input
              type="text"
              name="location"
              value={inputs.location || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ville ou quartier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prix d'achat (€)</label>
            <input
              type="number"
              name="purchasePrice"
              value={inputs.purchasePrice || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Loyer mensuel (€)</label>
            <input
              type="number"
              name="monthlyRent"
              value={inputs.monthlyRent || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Apport initial (%)</label>
            <input
              type="number"
              name="downPaymentPercent"
              value={inputs.downPaymentPercent || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taux d'intérêt (%)</label>
            <input
              type="number"
              name="interestRate"
              value={inputs.interestRate || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Durée du prêt (années)</label>
            <input
              type="number"
              name="loanTerm"
              value={inputs.loanTerm || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              max="30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;
