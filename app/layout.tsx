import type { Metadata } from "next";
import { Inter, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CalculatorProvider } from '../context/CalculatorContext';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'FlowImmo - Simulateur de Rentabilité Locative',
  description: 'Calculez précisément la rentabilité de vos investissements immobiliers locatifs',
  keywords: 'immobilier, rentabilité, investissement locatif, simulateur, calcul, Airbnb, colocation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${montserrat.variable}`}>
      <body className="min-h-screen flex flex-col bg-[color:var(--background)]">
        <AuthProvider>
          <CalculatorProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CalculatorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
