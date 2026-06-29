/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, ShoppingBag, Wallet, PieChart, FileText, Sparkles, 
  MapPin, HelpCircle, AlertCircle, Bookmark, Compass
} from 'lucide-react';

import { Product, WalletState, Transaction, UserAccount } from './types';
import Navbar from './components/Navbar';
import MarketTab from './components/MarketTab';
import WalletTab from './components/WalletTab';
import TokenomicsTab from './components/TokenomicsTab';
import WhitepaperTab from './components/WhitepaperTab';
import AiAssistant from './components/AiAssistant';
import AuthScreen from './components/AuthScreen';

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<'market' | 'wallet' | 'tokenomics' | 'whitepaper'>('market');
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // AI assistant states
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedProductForAi, setSelectedProductForAi] = useState<Product | null>(null);

  // Synchronized Wallet State (Starting with 0 AMC as specified)
  const [wallet, setWallet] = useState<WalletState>({
    cfaBalance: 100000, // Preloaded test CFA to allow user to easily swap in terminal
    amcBalance: 0, // Strict 0 AMC upon opening!
    solBalance: 0.15,
    publicKey: 'Am1ntch1SPL5o1anaR3seauN1gerX79bC9v' // Customized vanity address
  });

  // Transaction Ledger State (Seeded with realistic history)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-seed-1',
      type: 'RECEIVE',
      description: 'Dépôt Initial via Mobile Money',
      amountCfa: 150000,
      amountAmc: 0,
      status: 'COMPLETED',
      timestamp: '14:20:12 25/06/2026'
    },
    {
      id: 'tx-seed-2',
      type: 'SWAP',
      description: 'Échange : CFA convertis en AMC',
      amountCfa: 30000,
      amountAmc: 30000,
      status: 'COMPLETED',
      txHash: 'SWAP83FA91A7B2C6D1E8F90234B56C7D8E',
      timestamp: '09:45:00 26/06/2026'
    },
    {
      id: 'tx-seed-3',
      type: 'BUY',
      description: 'Achat de "Kilichi Super Fin" (Paiement AMC)',
      amountCfa: 0,
      amountAmc: 4250,
      status: 'COMPLETED',
      txHash: 'SOL7203A9D123E4567F890AB123CD456EF',
      timestamp: '11:15:32 27/06/2026'
    }
  ]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleSelectProductForAi = (product: Product) => {
    setSelectedProductForAi(product);
  };

  return (
    <AnimatePresence mode="wait">
      {!currentUser ? (
        <motion.div
          key="auth-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <AuthScreen 
            onRegisterSuccess={(user, initialWallet) => {
              setCurrentUser(user);
              setWallet(initialWallet);
            }} 
          />
        </motion.div>
      ) : (
        <motion.div
          key="app-dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-[#050508] text-white flex flex-col font-sans custom-grid-bg antialiased relative overflow-x-hidden"
        >
          
          {/* Background Atmosphere */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F27D26] opacity-[0.07] blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#14F195] opacity-[0.05] blur-[150px] rounded-full" />
            <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-[#9945FF] opacity-[0.04] blur-[100px] rounded-full" />
          </div>

          {/* Top Header & Navbar */}
          <Navbar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            wallet={wallet} 
            onOpenAssistant={() => setAssistantOpen(true)}
            currentUser={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              // Reset to default starting balance of 0 AMC for test ease
              setWallet({
                cfaBalance: 100000,
                amcBalance: 0,
                solBalance: 0.15,
                publicKey: 'Am1ntch1SPL5o1anaR3seauN1gerX79bC9v'
              });
            }}
          />

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {activeTab === 'market' && (
                  <MarketTab 
                    wallet={wallet}
                    onUpdateWallet={setWallet}
                    onAddTransaction={handleAddTransaction}
                    onOpenAssistant={() => setAssistantOpen(true)}
                    onSelectProductForAi={handleSelectProductForAi}
                  />
                )}

                {activeTab === 'wallet' && (
                  <WalletTab 
                    wallet={wallet}
                    onUpdateWallet={setWallet}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                  />
                )}

                {activeTab === 'tokenomics' && (
                  <TokenomicsTab />
                )}

                {activeTab === 'whitepaper' && (
                  <WhitepaperTab />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Floating Smart Assist Widget Trigger (Compact corner button) */}
          {!assistantOpen && (
            <button
              onClick={() => setAssistantOpen(true)}
              title="Ouvrir l'Assistant IA Amintchi"
              className="fixed bottom-6 right-6 p-4 bg-[#F27D26] hover:bg-[#ff8e38] text-black font-semibold rounded-full shadow-2xl shadow-orange-600/30 hover:scale-105 transition-all duration-200 z-45 cursor-pointer border border-white/10"
              id="floating-ai-trigger"
            >
              <Bot className="w-6 h-6 animate-pulse" />
            </button>
          )}

          {/* Sliding Interactive AI Assistant Drawer */}
          <AiAssistant 
            isOpen={assistantOpen}
            onClose={() => setAssistantOpen(false)}
            selectedProduct={selectedProductForAi}
          />

          {/* Footer credits */}
          <footer className="w-full bg-[#050508]/60 border-t border-white/10 py-6 mt-12 text-center text-white/40 text-xs backdrop-blur-md relative z-10">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-sans">
                © 2026 <strong className="text-white/80">Amintchi Market</strong> • Niamey, République du Niger. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-[#14F195] font-semibold flex items-center gap-1 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 bg-[#14F195] rounded-full animate-ping" />
                  SOLANA MAINNET SIMULATOR
                </span>
                <span className="h-4 w-px bg-white/10" />
                <span className="text-white/40 font-sans text-[11px]">Projet v1.0 • Whitepaper</span>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
