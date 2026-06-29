/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Wallet, PieChart, FileText, Bot, Compass, Sparkles, LogOut, User } from 'lucide-react';
import { WalletState, UserAccount } from '../types';

interface NavbarProps {
  activeTab: 'market' | 'wallet' | 'tokenomics' | 'whitepaper';
  setActiveTab: (tab: 'market' | 'wallet' | 'tokenomics' | 'whitepaper') => void;
  wallet: WalletState;
  onOpenAssistant: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, wallet, onOpenAssistant, currentUser, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-45 w-full bg-[#050508]/60 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 select-none">
          {/* Circular logo representing Niger and Blockchain */}
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#F27D26] to-[#FFB347] text-black shadow-[0_0_20px_rgba(242,125,38,0.4)]">
            <span className="font-sans font-black text-xl">A</span>
            {/* The circular orange dot from the Niger flag */}
            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-600 border border-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-lg text-white tracking-tight leading-none">
                AMINTCHI <span className="text-[#F27D26]">MARKET</span>
              </h1>
              <span className="text-[10px] bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/30 px-1.5 py-0.5 rounded-full font-semibold font-mono">
                v1.0 LIVE
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-0.5">
              Propulsé par la Blockchain Solana
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            id="tab-market"
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'market'
                ? 'bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Marché</span>
          </button>
          
          <button
            id="tab-wallet"
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Portefeuille</span>
          </button>

          <button
            id="tab-tokenomics"
            onClick={() => setActiveTab('tokenomics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'tokenomics'
                ? 'bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Tokenomics</span>
          </button>

          <button
            id="tab-whitepaper"
            onClick={() => setActiveTab('whitepaper')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'whitepaper'
                ? 'bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.35)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Livre Blanc</span>
          </button>
        </nav>

        {/* Dynamic Balances & AI Toggle */}
        <div className="flex items-center space-x-2">
          {/* Quick Balance Pills */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 space-x-3 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 font-sans uppercase">Solde CFA</span>
              <span className="font-mono font-bold text-white">
                {wallet.cfaBalance.toLocaleString()} F
              </span>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#14F195] font-sans uppercase font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                Solde AMC
              </span>
              <span className="font-mono font-bold text-[#14F195]">
                {wallet.amcBalance.toLocaleString()} AMC
              </span>
            </div>
          </div>

          {/* AI Trigger button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-1.5 bg-[#14F195] hover:bg-[#1dfa9f] text-black font-semibold text-xs px-3.5 py-2 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(20,241,149,0.25)] cursor-pointer group"
            id="toggle-ai-btn"
          >
            <Bot className="w-3.5 h-3.5 group-hover:animate-bounce" />
            <span className="hidden sm:inline">Amintchi AI</span>
          </button>

          {/* User Profile & Logout */}
          {currentUser && (
            <div className="flex items-center space-x-2 border-l border-white/10 pl-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <User className="w-3 h-3 text-[#F27D26]" />
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className={`text-[9px] uppercase font-bold ${currentUser.accountType === 'revendeur' ? 'text-[#F27D26]' : 'text-[#14F195]'}`}>
                  {currentUser.accountType === 'revendeur' ? 'Revendeur' : 'Client'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Se Déconnecter"
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-red-400 cursor-pointer"
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
