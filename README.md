# 💸 FlowImmo – Simulateur de Rentabilité Locative

**FlowImmo** est une webapp SaaS qui permet de **calculer précisément la rentabilité d'un bien immobilier locatif**, que ce soit en location classique, colocation, ou courte durée (Airbnb). L'objectif est d'accompagner les investisseurs dans leur prise de décision en offrant un outil simple, puissant et professionnel.

---

## 🧭 Objectifs du projet

- Proposer une alternative moderne aux fichiers Excel traditionnels.
- Offrir une UX claire, fluide et responsive (desktop/mobile).
- Intégrer des **simulations avancées** de fiscalité, crédit, vacance locative.
- Générer des **rapports PDF professionnels** utilisables en banque.
- Offrir un **modèle freemium** avec accès gratuit limité + version pro payante.

---

## ⚙️ Stack technique

| Élément           | Outil / Technologie      |
|------------------|--------------------------|
| Frontend         | React (Next.js recommandé) |
| Backend (optionnel) | Firebase / Supabase ou serverless functions |
| Authentification | Firebase Auth / Supabase Auth |
| Paiement         | Stripe Checkout           |
| Base de données  | Supabase (PostgreSQL)     |
| PDF              | jsPDF / html2pdf.js       |
| Graphiques       | Recharts / Chart.js       |
| Déploiement      | **Netlify**               |
| Formulaires      | React Hook Form           |
| SEO              | Next.js / React Helmet    |

---

## 🎯 Fonctionnalités détaillées

### ✅ Gratuits (MVP public)

- 🧾 **Saisie simplifiée** :
  - Prix d’achat, frais de notaire, travaux
  - Revenus locatifs fixes / Airbnb
  - Charges annuelles (copro, foncière, assurance, etc.)

- 📊 **Résultats dynamiques** :
  - Rendement brut, rendement net
  - Cashflow mensuel
  - ROI simple

- 📈 **Graphiques** :
  - Répartition des charges
  - Cashflow mensuel (barres)
  - Renta brute/net (cercle)

- 📤 **Export PDF simplifié** :
  - Résumé des données
  - Graphiques statiques

---

### 🔐 Premium (Pro)

- 💰 **Simulation de crédit immobilier** :
  - Apport, taux, durée, mensualité automatique
  - Simulation cashflow avec crédit

- 🧾 **Choix du régime fiscal** :
  - LMNP micro-BIC
  - LMNP réel
  - LMP
  - SCI IS
  - Foncier réel

- 🧠 **Analyse avancée** :
  - Vacance locative (en % ou mois/an)
  - Turnover (Airbnb, ménage, frais fixes)
  - TRI, retour sur investissement long terme
  - Effet de levier

- 📝 **Exports pros** :
  - PDF complet (banque, présentation client)
  - Export Excel/CSV
  - Comparaison entre 2 biens

- 🧑‍💼 **Espace utilisateur (dashboard)** :
  - Authentification sécurisée
  - Sauvegarde des projets
  - Historique des simulations
  - Catégorisation par type de projet

---

## 🎨 UX & UI Design

### 🖌️ Charte graphique
- **Palette de couleurs** : 
  - Principal : Bleu nuit (#1A2238) - Stabilité, confiance
  - Secondaire : Vert flow (#38B2AC) - Finance, croissance
  - Accentuation : Jaune doré (#FFD700) - Investissement, succès
  - Fond : Blanc cassé (#F9F9F9) - Lisibilité et élégance

- **Typographie** : 
  - Titres : Poppins (Bold) - Moderne et distinctif
  - Corps : Inter - Haute lisibilité même en petite taille
  - Données chiffrées : Montserrat - Clarté des informations financières

- **Design System**:
  - Cards avec ombre légère et coins arrondis (8px)
  - Boutons avec micro-animations au survol
  - Espacement généreux (vertical rhythm de 8px)
  - Icônes minimalistes avec style unifié

### 🖥️ Interface utilisateur
- **Header** : Navigation épurée, logo animé, accès rapide profil/dashboard
- **Landing page** : Hero section avec animation illustrant la transformation des données immobilières en insights financiers
- **Calculateur** : Interface en sections progressives (stepper horizontal) avec sauvegarde automatique
- **Dashboard** : Grille de projets avec filtres et tri, vue carte/liste, aperçu rapide des KPIs
- **Mode sombre** : Basculement fluide préservant la lisibilité des données
- **Design responsive** : Adaptation intelligente sur mobile avec priorisation des informations essentielles

### 🚀 Microinteractions & Animations
- **Animations d'entrée** :
  - Apparition progressive et séquentielle des éléments (staggered animations)
  - Cartes qui se déploient lors du chargement des résultats

- **Transitions entre pages** :
  - Transition fluide avec effet de continuité spatiale
  - Conservation du contexte visuel entre les étapes

- **Feedback instantané** :
  - Animations subtiles sur les inputs lors de la validation
  - Feedback haptique sur mobile
  - Bulles de notification stylisées

- **Animations data-driven** :
  - Graphiques animés réagissant aux changements de données
  - Compteurs qui s'incrémentent progressivement
  - Indicateurs de progression circulaires pour les KPIs

- **Animations fonctionnelles** :
  - Simulation visuelle de l'effet de levier
  - Animation montrant l'évolution de la rentabilité sur la durée
  - Comparaison avant/après travaux avec transition

---

## 💳 Monétisation

- Stripe Checkout :
  - Abonnement mensuel : 9€/mois
  - Abonnement annuel : 49€/an
  - Paiement à vie (one-shot) : 79€
- Partenariats :
  - Liens affiliés vers banques, assurances, outils de gestion locative
- Marque blanche : version personnalisée pour influenceurs/coachs

---

## 🚀 Déploiement sur Netlify

### Étapes de base :

1. **Créer un repo GitHub avec ce README**
2. Créer un projet React / Next.js (`npx create-next-app flowimmo`)
3. Push le code vers GitHub
4. Connecter le repo à Netlify
5. Configuration Netlify :
   - Branch: `main`
   - Build command : `npm run build`
   - Publish directory : `out` (Next.js avec `next export`) ou `.next` si SSR

### Variables d’environnement à configurer :
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
NEXT_PUBLIC_BASE_URL=https://flowimmo.netlify.app

## 📁 Architecture du projet

```
flowimmo/
│
├── components/
│   ├── calculator/
│   │   ├── CalculatorForm.jsx
│   │   ├── StepperNavigation.jsx
│   │   ├── InputGroups/
│   │   └── ValidationRules.js
│   ├── results/
│   │   ├── ResultDisplay.jsx
│   │   ├── DataVisualisation.jsx
│   │   ├── charts/
│   │   └── AnimatedCounter.jsx
│   ├── premium/
│   │   ├── PremiumFeatures.jsx
│   │   └── UpgradeModal.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── AnimatedIcon.jsx
│   │   └── Transitions.jsx
│   └── layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Sidebar.jsx
│
├── pages/
│   ├── index.jsx
│   ├── calculator.jsx
│   ├── dashboard.jsx
│   ├── login.jsx
│   ├── register.jsx
│   ├── premium.jsx
│   └── reports/[id].jsx
│
├── hooks/
│   ├── useAnimation.js
│   ├── useCalculator.js
│   ├── useLocalStorage.js
│   └── useMediaQuery.js
│
├── utils/
│   ├── financialFormulas.js
│   ├── fiscalSimulation.js
│   ├── pdfExport.js
│   ├── animations.js
│   └── theme.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── CalculatorContext.jsx
│   └── ThemeContext.jsx
│
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   ├── illustrations/
│   │   └── animations/
│   └── fonts/
│
├── styles/
│   ├── globals.css
│   ├── animations.css
│   └── tailwind.config.js
│
├── README.md
└── package.json

---

🛠️ Roadmap (MVP)
 UI de saisie complète (achat, revenus, charges)

📊 Calculs brut / net / cashflow avec actualisation automatique

📈 Graphiques de synthèse animés et interactifs

 Export PDF simple

 Déploiement Netlify

 Intégration Stripe

 Auth Firebase

 Version Pro avec fiscalité, crédit, export avancé

 SEO + prélanding marketing

## 🧠 Évolutions futures

### 🔄 Intégrations automatiques
- **Plugin d'analyse via URL** : Extension navigateur qui détecte et analyse automatiquement les annonces Leboncoin/SeLoger avec animation de scan
- **API d'estimation de loyers** : Visualisation par quartier avec carte thermique interactive (via data.gouv ou partenaires)
- **Intégration avec Yousign** : Signature électronique avec animation de validation pour les mandats

### 📱 Extensions produit
- **Mobile app compagnon** : Synchronisation en temps réel avec transitions fluides entre desktop et mobile
- **Mode hors ligne** : Synchronisation intelligente avec animation de mise à jour lors de la reconnexion
- **Calculateur de capacité d'emprunt** : Simulation visuelle du pouvoir d'achat immobilier avec carte interactive

### 🤖 Intelligence artificielle
- **Assistant IA** : Conseiller virtuel avec animations de conversation pour guider les investisseurs
- **Prédiction de rentabilité** : Visualisation des tendances futures basée sur l'historique du marché
- **Analyse concurrentielle** : Comparaison animée des biens similaires dans le même secteur

### 🌐 Dimension sociale
- **Partage de simulations** : Animations de partage avec aperçu en temps réel
- **Marketplace experts** : Mise en relation animée avec notaires, banquiers, gestionnaires
- **Communauté d'investisseurs** : Forums avec badges animés et système de réputation visuel
