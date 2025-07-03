"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types pour notre calculateur
export interface CalculatorInputs {
  // Section acquisition
  purchasePrice: number;
  notaryFees: number;
  renovationCost: number;
  furnishingCost: number;
  
  // Section financement
  cashDown: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  
  // Section revenus
  rentalIncome: number;
  rentalType: 'traditional' | 'seasonal' | 'coliving';
  occupancyRate: number;
  
  // Section charges
  propertyTax: number;
  insuranceCost: number;
  condoFees: number;
  managementFees: number;
  maintenanceCost: number;
  
  // Section fiscalité
  taxRegime: 'micro-foncier' | 'reel' | 'lmnp-micro' | 'lmnp-reel' | 'lmp' | 'sci-ir' | 'sci-is';
  taxBracket: number;
  distributeDividends: boolean; // Option pour distribuer les dividendes (SCI IS)
  
  // Section amortissements (LMNP réel et SCI IS)
  buildingRatio: number;     // Pourcentage du prix attribué au bâti (excluant le terrain)
  buildingYears: number;     // Durée d'amortissement du bâtiment (en années)
  furnishingYears: number;  // Durée d'amortissement du mobilier (en années)
  
  // Section plus-value
  holdingPeriod: number;
  sellPrice: number;
}

export interface CalculatorResults {
  investment: {
    totalInvestment: number;
    loanPayment: number;
  };
  cashflow: {
    monthly: number;
    yearly: number;
    monthlyNet: number;   // Cash-flow mensuel après impôt
    yearlyNet: number;   // Cash-flow annuel après impôt
  };
  returns: {
    gross: number;       // Rendement brut
    net: number;         // Rendement net avant impôt
    netAfterTax: number; // Rendement net après impôt
    roi: number;         // Retour sur investissement (cash-flow / apport)
    tri: number;         // Taux de rendement interne
    yearsToBreakEven: number;
  };
  cashBalance: {
    income: number;
    expenses: number;
    mortgage: number;
  };
  tax: {
    taxableIncome: number;      // Revenu imposable
    incomeTaxAmount: number;    // Montant de l'impôt sur le revenu
    socialContributionsAmount: number; // Prélèvements sociaux
    dividendsTax: number;       // Impôt sur les dividendes potentiels (SCI à l'IS)
    totalTaxAmount: number;     // Montant total des impôts
    effectiveTaxRate: number;   // Taux d'imposition effectif
    deficitFoncier?: number;    // Montant du déficit foncier
    deficitExcess?: number;     // Excédent non imputable sur les revenus
    corporateTaxAmount?: number; // Montant de l'IS pour SCI IS
  };
  capitalGain: {
    potentialGain: number;  // Plus-value potentielle brute
    taxOnGain: number;      // Impôt sur la plus-value
    netGain: number;        // Plus-value nette après impôt
    netBookValue?: number;  // Valeur nette comptable pour SCI IS
  };
}

interface CalculatorContextType {
  inputs: CalculatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>;
  results: CalculatorResults;
  formatCurrency: (value: number) => string;
}

const defaultInputs: CalculatorInputs = {
  purchasePrice: 200000,
  notaryFees: 16000,
  renovationCost: 10000,
  furnishingCost: 5000,
  
  cashDown: 50000,
  loanAmount: 165000,
  interestRate: 3.5,
  loanTerm: 20,
  
  rentalIncome: 800,
  rentalType: 'traditional',
  occupancyRate: 95,
  
  propertyTax: 1200,
  insuranceCost: 400,
  condoFees: 1800,
  managementFees: 800,
  maintenanceCost: 1000,
  
  taxRegime: 'lmnp-micro',
  taxBracket: 30,
  distributeDividends: true,  // Par défaut, distribution des dividendes pour SCI IS
  
  buildingRatio: 85,    // 85% du prix pour le bâti, 15% pour le terrain
  buildingYears: 25,    // 25 ans d'amortissement pour le bâtiment
  furnishingYears: 7,   // 7 ans d'amortissement pour le mobilier
  
  holdingPeriod: 15,
  sellPrice: 240000
};

export const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  
  // Fonction pour formater les devises
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculs dynamiques basés sur les inputs
  const totalInvestment = inputs.purchasePrice + inputs.notaryFees + inputs.renovationCost + inputs.furnishingCost;
  const annualRentalIncome = inputs.rentalIncome * 12 * (inputs.occupancyRate / 100);
  
  // Calcul correct du prêt avec formule d'annuité (PMT)
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numberOfMonths = inputs.loanTerm * 12;
  const monthlyLoanPayment = inputs.loanAmount > 0 && inputs.interestRate > 0
    ? inputs.loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -numberOfMonths))
    : 0;
  const annualLoanPayment = monthlyLoanPayment * 12;
  
  const totalAnnualCharges = inputs.propertyTax + inputs.insuranceCost + inputs.condoFees + inputs.managementFees + inputs.maintenanceCost;
  
  // Calcul des amortissements pour LMNP réel et SCI IS
  // Bâtiment : pourcentage du prix d'achat (hors terrain) selon buildingRatio
  // Mobilier : entièrement amorti sur furnishingYears (typiquement 7 ans)
  const baseAmortissableBatiment = inputs.purchasePrice * (inputs.buildingRatio / 100);
  const amortissementAnnuelBatiment = baseAmortissableBatiment / inputs.buildingYears;
  
  const amortissementAnnuelMobilier = inputs.furnishingCost / inputs.furnishingYears;
  
  // Total des amortissements
  const amortissementTotal = amortissementAnnuelBatiment + amortissementAnnuelMobilier;
  
  const netAnnualIncome = annualRentalIncome - totalAnnualCharges;
  const annualCashflow = netAnnualIncome - annualLoanPayment;
  const monthlyCashflow = annualCashflow / 12;
  
  // Calcul des rendements
  // Formule correcte du rendement brut: revenu annuel / total investi * 100
  const grossReturn = totalInvestment > 0 ? (annualRentalIncome / totalInvestment) * 100 : 0;
  const netReturn = totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
  
  // Calcul du ROI et du point mort
  const equity = inputs.cashDown > 0 ? inputs.cashDown : totalInvestment;
  const roi = equity > 0 ? (annualCashflow / equity) * 100 : 0;
  const yearsToBreakEven = annualCashflow > 0 ? totalInvestment / annualCashflow : 999;
  
  // Constantes fiscales
  const SOCIAL_CONTRIBUTIONS_RATE = 0.172; // 17.2% de prélèvements sociaux
  const DEFICIT_FONCIER_CAP = 10700; // Plafond déficits fonciers
  const IS_RATE_REDUCED = 0.15; // Taux IS réduit à 15% (jusqu'à 42 500 €)
  const IS_RATE_NORMAL = 0.25; // Taux normal IS (25%)
  const IS_THRESHOLD = 42500; // Seuil pour bénéficier du taux réduit d'IS
  const FLAT_TAX_RATE = 0.30; // Prélèvement forfaitaire unique (PFU) sur dividendes (30%)
  
  // Plafonds des régimes fiscaux
  const MICRO_FONCIER_THRESHOLD = 15000; // Plafond micro-foncier (revenus < 15 000 €)
  const MICRO_BIC_THRESHOLD = 77700; // Plafond micro-BIC pour LMNP (revenus < 77 700 €)
  const LMP_INCOME_THRESHOLD = 23000; // Revenus minimums pour LMP (> 23 000 €)
  
  // Calcul des amortissements (utilisés pour LMNP réel, LMP et SCI IS)
  // Calcul de la part du prix d'achat attribuée au bâtiment (vs terrain)
  const buildingValue = inputs.purchasePrice * (inputs.buildingRatio / 100);
  
  // Calcul des amortissements annuels
  const buildingAmortization = inputs.buildingYears > 0 ? buildingValue / inputs.buildingYears : 0;
  const furnishingAmortization = inputs.furnishingYears > 0 ? inputs.furnishingCost / inputs.furnishingYears : 0;
  const totalAmortization = buildingAmortization + furnishingAmortization;
  
  // Variables pour le calcul fiscal
  let taxableIncome = 0;
  let incomeTaxAmount = 0;
  let socialContributionsAmount = 0;
  let corporateTaxAmount = 0;
  let dividendsTax = 0;
  let totalTaxAmount = 0;
  let deficitFoncier = 0;
  let deficitExcess = 0;
  let netBookValue = 0; // Valeur nette comptable pour SCI IS
  
  switch(inputs.taxRegime) {
    case 'micro-foncier':
      // Vérification de l'éligibilité au micro-foncier (revenus < 15 000 €)
      const isMicroFoncierEligible = annualRentalIncome <= MICRO_FONCIER_THRESHOLD;
      
      if (isMicroFoncierEligible) {
        // Abattement forfaitaire de 30% sur les revenus bruts
        taxableIncome = annualRentalIncome * 0.7; // Imposition sur 70% des loyers
      } else {
        // Si dépassement du plafond, bascule automatique en régime réel
        console.warn('Revenus > 15 000 €: le régime micro-foncier n\'est pas applicable, calcul effectué avec le régime réel');
        // Utilisation des règles du régime réel
        const interestPortionReel = calculateInterestPortion(inputs.loanAmount, inputs.interestRate, inputs.loanTerm);
        taxableIncome = annualRentalIncome - totalAnnualCharges - interestPortionReel;
      }
      
      // Impôt sur le revenu selon la TMI (Tranche Marginale d'Imposition)
      incomeTaxAmount = taxableIncome * (inputs.taxBracket / 100);
      
      // Prélèvements sociaux (17.2%)
      socialContributionsAmount = taxableIncome * SOCIAL_CONTRIBUTIONS_RATE;
      
      // Total fiscalité = IR + PS
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
      break;
      
    case 'reel':
      // Déduction des charges réelles et intérêts d'emprunt
      const interestPortionReel = calculateInterestPortion(inputs.loanAmount, inputs.interestRate, inputs.loanTerm);
      
      // Charges déductibles détaillées selon les règles du régime réel
      const deductibleExpensesReel = (
        totalAnnualCharges + // Toutes les charges (taxe foncière, assurance, copro, gestion, entretien)
        interestPortionReel // Intérêts d'emprunt déductibles
      );
      
      // Calcul du revenu foncier net
      const rawTaxableIncomeReel = annualRentalIncome - deductibleExpensesReel;
      
      // Gestion du déficit foncier (plafonné à 10 700 € imputable sur le revenu global)
      if (rawTaxableIncomeReel < 0) {
        // Le déficit est plafonné à 10 700 € imputable sur le revenu global
        deficitFoncier = Math.min(Math.abs(rawTaxableIncomeReel), DEFICIT_FONCIER_CAP);
        // L'excédent de déficit est reportable 10 ans sur revenus fonciers futurs
        deficitExcess = Math.max(0, Math.abs(rawTaxableIncomeReel) - DEFICIT_FONCIER_CAP);
        taxableIncome = 0; // Le déficit est déjà imputé sur le revenu global
      } else {
        // Revenu foncier positif
        taxableIncome = rawTaxableIncomeReel;
        deficitFoncier = 0;
        deficitExcess = 0;
      }
      
      // Impôt sur le revenu (IR) selon la TMI
      incomeTaxAmount = Math.max(0, taxableIncome * (inputs.taxBracket / 100));
      
      // Prélèvements sociaux (17.2%)
      socialContributionsAmount = Math.max(0, taxableIncome * SOCIAL_CONTRIBUTIONS_RATE);
      
      // Total fiscalité = IR + PS
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
      break;
      
    case 'lmnp-micro':
      // Vérification de l'éligibilité au micro-BIC (revenus < 77 700 €)
      const isMicroBICEligible = annualRentalIncome <= MICRO_BIC_THRESHOLD;
      
      if (isMicroBICEligible) {
        // Abattement forfaitaire de 50% pour les locations meublées (micro-BIC)
        taxableIncome = annualRentalIncome * 0.5;
      } else {
        // Si dépassement du plafond, bascule automatique en LMNP réel
        console.warn('Revenus > 77 700 €: le régime micro-BIC n\'est pas applicable, calcul effectué avec le régime LMNP réel');
        
        // Application des règles du LMNP réel
        const taxableIncomeLMNPReel = annualRentalIncome - totalAnnualCharges - totalAmortization;
        taxableIncome = Math.max(0, taxableIncomeLMNPReel); // On ne peut pas créer de déficit en LMNP
      }
      
      // Impôt sur le revenu selon la TMI
      incomeTaxAmount = taxableIncome * (inputs.taxBracket / 100);
      
      // Prélèvements sociaux (17.2%)
      socialContributionsAmount = taxableIncome * SOCIAL_CONTRIBUTIONS_RATE;
      
      // Total fiscalité = IR + PS
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
      break;
      
    case 'lmnp-reel':
      // Calcul des intérêts d'emprunt
      const interestPortionLMNP = calculateInterestPortion(inputs.loanAmount, inputs.interestRate, inputs.loanTerm);
      
      // Charges déductibles dans le régime LMNP au réel
      const deductibleExpensesLMNP = (
        totalAnnualCharges + // Charges locatives, taxe foncière, assurances...
        interestPortionLMNP  // Intérêts d'emprunt
      );
      
      // Calcul du bénéfice imposable avec amortissements
      // Détail des amortissements:
      // - Amortissement du bâtiment (hors terrain): sur inputs.buildingYears années
      // - Amortissement du mobilier: sur inputs.furnishingYears années
      const taxableIncomeLMNP = annualRentalIncome - deductibleExpensesLMNP - totalAmortization;
      
      // Important: en LMNP, les déficits ne sont pas imputables sur le revenu global
      // mais reportables sur les bénéfices BIC de même nature les années suivantes
      taxableIncome = Math.max(0, taxableIncomeLMNP);
      
      // Impôt sur le revenu selon la TMI
      incomeTaxAmount = taxableIncome * (inputs.taxBracket / 100);
      
      // Prélèvements sociaux (17.2%)
      socialContributionsAmount = taxableIncome * SOCIAL_CONTRIBUTIONS_RATE;
      
      // Total fiscalité = IR + PS
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
      break;
      
    case 'lmp':
      // Vérification des conditions pour le statut LMP :
      // 1. Recettes annuelles > 23 000 €
      // 2. Prépondérance des revenus locatifs par rapport aux autres revenus professionnels
      const isLMPEligible = annualRentalIncome > LMP_INCOME_THRESHOLD;
      
      if (!isLMPEligible) {
        console.warn('Revenus < 23 000 €: statut LMP non applicable, calcul effectué avec le régime LMNP réel');
      }
      
      // Calcul des intérêts d'emprunt
      const interestPortionLMP = calculateInterestPortion(inputs.loanAmount, inputs.interestRate, inputs.loanTerm);
      
      // Charges déductibles incluant les mêmes éléments qu'en LMNP réel
      const deductibleExpensesLMP = (
        totalAnnualCharges + // Charges locatives, taxe foncière, assurances...
        interestPortionLMP  // Intérêts d'emprunt
      );
      
      // Calcul du bénéfice/déficit avec amortissements
      const taxableIncomeLMP = annualRentalIncome - deductibleExpensesLMP - totalAmortization;
      
      // En LMP, les déficits sont imputables sur le revenu global sans plafond
      if (taxableIncomeLMP < 0 && isLMPEligible) {
        deficitFoncier = Math.abs(taxableIncomeLMP); // Imputable intégralement sur le revenu global
        taxableIncome = 0;
      } else {
        // En cas de bénéfice ou si non éligible au LMP (traitement comme LMNP)
        taxableIncome = Math.max(0, taxableIncomeLMP);
        deficitFoncier = 0;
      }
      
      // Cotisations sociales spécifiques au régime LMP (SSI - Sécurité Sociale des Indépendants)
      // Approximation: environ 40-45% des bénéfices en fonction de la tranche
      const TNS_CONTRIBUTION_RATE = 0.45; // Taux de cotisations TNS (approximatif)
      
      // Calcul des cotisations sociales pour LMP
      if (isLMPEligible && taxableIncome > 0) {
        // En cas de bénéfice, application des cotisations TNS
        socialContributionsAmount = taxableIncome * TNS_CONTRIBUTION_RATE;
      } else {
        // Si non éligible ou pas de bénéfice, prélèvements sociaux standards
        socialContributionsAmount = Math.max(0, taxableIncome * SOCIAL_CONTRIBUTIONS_RATE);
      }
      
      // Impôt sur le revenu selon la TMI
      incomeTaxAmount = taxableIncome * (inputs.taxBracket / 100);
      
      // Total fiscalité = IR + cotisations sociales
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
      break;
      
    case 'sci-ir':
      // SCI à l'IR: fiscalité translucide, imposition entre les mains des associés
      // Application du régime réel foncier (mêmes règles)
      const interestPortionSCI = calculateInterestPortion(inputs.loanAmount, inputs.interestRate, inputs.loanTerm);
      
      // Charges déductibles
      const deductibleExpensesSCIIR = (
        totalAnnualCharges + // Charges locatives, taxe foncière, assurances...
        interestPortionSCI   // Intérêts d'emprunt (totalement déductibles en SCI IR)
      );
      
      // Calcul du résultat foncier
      const rawTaxableIncomeSCI = annualRentalIncome - deductibleExpensesSCIIR;
      
      // Gestion du déficit foncier avec le plafond pour chaque associé
      // Pour simplifier, on considère que c'est pour un seul associé détenant 100%
      if (rawTaxableIncomeSCI < 0) {
        // Le déficit est plafonné à 10 700 € imputable sur le revenu global
        deficitFoncier = Math.min(Math.abs(rawTaxableIncomeSCI), DEFICIT_FONCIER_CAP);
        // L'excédent de déficit est reportable sur les revenus fonciers des 10 années suivantes
        deficitExcess = Math.max(0, Math.abs(rawTaxableIncomeSCI) - DEFICIT_FONCIER_CAP);
        taxableIncome = 0;
      } else {
        taxableIncome = rawTaxableIncomeSCI;
        deficitFoncier = 0;
        deficitExcess = 0;
      }
      
      // Impôt sur le revenu selon la TMI de l'associé
      incomeTaxAmount = Math.max(0, taxableIncome * (inputs.taxBracket / 100));
      
      // Prélèvements sociaux (17.2%)
      socialContributionsAmount = Math.max(0, taxableIncome * SOCIAL_CONTRIBUTIONS_RATE);
      
      // Total fiscalité = IR + PS
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
      break;
      
    case 'sci-is':
      // SCI à l'IS: la société est assujettie à l'impôt sur les sociétés
      // Calcul des intérêts d'emprunt
      const interestPortionSCIIS = calculateInterestPortion(inputs.loanAmount, inputs.interestRate, inputs.loanTerm);
      
      // Charges déductibles incluant toutes les charges locatives et les intérêts
      const deductibleExpensesSCIIS = (
        totalAnnualCharges + // Charges locatives, taxe foncière, assurances...
        interestPortionSCIIS // Intérêts d'emprunt entièrement déductibles
      );
      
      // Détail des amortissements pour la SCI à l'IS
      // - Bâtiment: amortissement linéaire sur inputs.buildingYears années
      // - Mobilier/Agencements: amortissement linéaire sur inputs.furnishingYears années
      // Remarque: le terrain n'est pas amortissable (pris en compte via buildingRatio)
      
      // Calcul du bénéfice imposable à l'IS avec amortissements
      taxableIncome = annualRentalIncome - deductibleExpensesSCIIS - totalAmortization;
      
      // Calcul de l'impôt sur les sociétés selon le barème progressif
      if (taxableIncome > 0) {
        // Taux réduit pour la tranche < 42 500€ (15%) puis taux normal (25%)
        if (taxableIncome <= IS_THRESHOLD) {
          corporateTaxAmount = taxableIncome * IS_RATE_REDUCED;
        } else {
          corporateTaxAmount = IS_THRESHOLD * IS_RATE_REDUCED + 
                              (taxableIncome - IS_THRESHOLD) * IS_RATE_NORMAL;
        }
        
        // Résultat net après IS (bénéfice distribuable)
        const profitAfterTax = taxableIncome - corporateTaxAmount;
        
        // Imposition des dividendes uniquement si l'option de distribution est activée
        if (inputs.distributeDividends) {
          // Flat tax de 30% sur les dividendes (PFU - Prélèvement Forfaitaire Unique)
          dividendsTax = profitAfterTax * FLAT_TAX_RATE; 
          
          // Résultat final après distribution et imposition des dividendes
          // Note: cet argent est finalement disponible pour l'associé
          const finalProfit = profitAfterTax - dividendsTax;
        } else {
          // Sans distribution, les bénéfices restent dans la société sans taxation supplémentaire
          dividendsTax = 0;
        }
      } else {
        // En cas de résultat négatif, pas d'IS à payer
        // Les pertes sont reportables sur les exercices suivants
        corporateTaxAmount = 0;
        dividendsTax = 0;
      }
      
      // Total fiscalité = IS + PFU sur dividendes (si distribution)
      totalTaxAmount = corporateTaxAmount + dividendsTax;
      
      // Calcul de la valeur nette comptable (VNC) pour la plus-value en SCI IS
      // Important pour le calcul de plus-value lors de la revente
      // VNC = Prix d'achat - amortissements cumulés sur la période
      const cumulativeAmortization = totalAmortization * inputs.holdingPeriod;
      netBookValue = inputs.purchasePrice - cumulativeAmortization;
      break;
      
    default:
      // Défaut: micro-foncier
      taxableIncome = annualRentalIncome * 0.7;
      incomeTaxAmount = taxableIncome * (inputs.taxBracket / 100);
      socialContributionsAmount = taxableIncome * SOCIAL_CONTRIBUTIONS_RATE;
      totalTaxAmount = incomeTaxAmount + socialContributionsAmount;
  }
  
  // Cashflow après impôts
  const annualCashflowAfterTax = annualCashflow - totalTaxAmount;
  const monthlyCashflowAfterTax = annualCashflowAfterTax / 12;
  
  // Rentabilité nette après impôt
  const netReturnAfterTax = totalInvestment > 0 ? (annualCashflowAfterTax / totalInvestment) * 100 : 0;
  
  // Calcul de la plus-value potentielle
  const potentialGain = inputs.sellPrice - inputs.purchasePrice;
  
  // Calcul simplifié de l'impôt sur la plus-value immobilière
  // (abattement de 6% par an à partir de la 6ème année)
  let taxOnGain = 0;
  if (potentialGain > 0) {
    // Calculer l'abattement pour durée de détention
    let taxableGainRate = 1.0; // 100% imposable par défaut
    
    if (inputs.holdingPeriod >= 6 && inputs.holdingPeriod < 22) {
      // 6% d'abattement par an de la 6ème à la 21ème année
      taxableGainRate = 1.0 - (inputs.holdingPeriod - 5) * 0.06;
    } else if (inputs.holdingPeriod >= 22) {
      taxableGainRate = 0.0; // Exonération après 22 ans
    }
    
    // Application du taux forfaitaire de 19% + 17.2% de prélèvements sociaux
    const taxableGain = potentialGain * taxableGainRate;
    taxOnGain = taxableGain * 0.362; // 36.2% au total
  }
  
  const netGain = potentialGain - taxOnGain;
  
  // Calcul simple du TRI (Taux de Rendement Interne)
  // Cette formule est une approximation, un vrai TRI nécessiterait des calculs plus complexes
  // avec actualisation des flux sur toute la période
  const estimatedAnnualIncrease = potentialGain / inputs.holdingPeriod;
  const annualReturn = annualCashflowAfterTax + estimatedAnnualIncrease;
  const tri = totalInvestment > 0 ? (annualReturn / totalInvestment) * 100 : 0;
  
  // Fonction utilitaire pour estimer la portion d'intérêts dans l'annuité de remboursement
  // (approximation, un calcul exact nécessiterait un tableau d'amortissement complet)
  function calculateInterestPortion(loanAmount: number, interestRate: number, loanTerm: number): number {
    const averageOutstandingAmount = loanAmount * 0.7; // Approximation pour une année moyenne
    return averageOutstandingAmount * (interestRate / 100);
  }
  
  const results: CalculatorResults = {
    investment: {
      totalInvestment: totalInvestment,
      loanPayment: monthlyLoanPayment
    },
    cashflow: {
      monthly: monthlyCashflow,
      yearly: annualCashflow,
      monthlyNet: monthlyCashflowAfterTax,
      yearlyNet: annualCashflowAfterTax
    },
    returns: {
      gross: parseFloat(grossReturn.toFixed(2)),
      net: parseFloat(netReturn.toFixed(2)),
      netAfterTax: parseFloat(netReturnAfterTax.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
      tri: parseFloat(tri.toFixed(2)),
      yearsToBreakEven: parseFloat(yearsToBreakEven.toFixed(1))
    },
    cashBalance: {
      income: annualRentalIncome,
      expenses: totalAnnualCharges,
      mortgage: annualLoanPayment
    },
    tax: {
      taxableIncome: Math.round(taxableIncome),
      incomeTaxAmount: Math.round(incomeTaxAmount),
      socialContributionsAmount: Math.round(socialContributionsAmount),
      corporateTaxAmount: Math.round(corporateTaxAmount),
      dividendsTax: Math.round(dividendsTax),
      totalTaxAmount: Math.round(totalTaxAmount),
      effectiveTaxRate: taxableIncome > 0 ? parseFloat(((totalTaxAmount / taxableIncome) * 100).toFixed(1)) : 0,
      deficitFoncier: Math.round(deficitFoncier),
      deficitExcess: Math.round(deficitExcess)
    },
    capitalGain: {
      potentialGain: potentialGain,
      taxOnGain: taxOnGain,
      netGain: netGain,
      netBookValue: netBookValue
    }
  };
  
  return (
    <CalculatorContext.Provider value={{ inputs, setInputs, results, formatCurrency }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
