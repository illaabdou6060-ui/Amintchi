/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Copy, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Coins, 
  HelpCircle, CheckCircle2, AlertCircle, History, ExternalLink, RefreshCw, Zap, TrendingUp
} from 'lucide-react';
import { WalletState, Transaction } from '../types';
import QRCode from './QRCode';

interface WalletTabProps {
  wallet: WalletState;
  onUpdateWallet: (updater: (prev: WalletState) => WalletState) => void;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
}

export default function WalletTab({ wallet, onUpdateWallet, transactions, onAddTransaction }: WalletTabProps) {
  // Transfer States
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Section Échange / Recharge States
  const [rechargeMethod, setRechargeMethod] = useState<'MOBILE_MONEY' | 'TRANSFER' | 'CRYPTO'>('MOBILE_MONEY');
  const [rechargeProvider, setRechargeProvider] = useState('Airtel Money');
  const [rechargeAmountCfa, setRechargeAmountCfa] = useState('');
  const [rechargeAccountDetails, setRechargeAccountDetails] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [lastCreditedAmc, setLastCreditedAmc] = useState(0);

  // Explorer Log Modal State
  const [inspectTx, setInspectTx] = useState<Transaction | null>(null);

  // Copy Clipboard Helper
  const [copied, setCopied] = useState(false);
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Faucet Helper (to prevent users from getting stuck)
  const handleFaucetTopUp = () => {
    onUpdateWallet(prev => ({
      ...prev,
      cfaBalance: prev.cfaBalance + 50000,
      solBalance: Math.round((prev.solBalance + 0.1) * 10) / 10
    }));

    const newTx: Transaction = {
      id: `faucet-${Date.now()}`,
      type: 'RECEIVE',
      description: 'Dépôt Faucet (Test CFA & SOL)',
      amountCfa: 50000,
      amountAmc: 0,
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
    };
    onAddTransaction(newTx);
  };

  // Transfer Action
  const handleSendCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setSendSuccess(false);

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      setSendError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    if (amount > wallet.amcBalance) {
      setSendError('Solde Amintchi Coin (AMC) insuffisant.');
      return;
    }

    if (wallet.solBalance < 0.001) {
      setSendError('Frais de gaz Solana insuffisants (requis : 0.001 SOL pour la signature).');
      return;
    }

    if (!recipient.trim() || recipient.length < 32) {
      setSendError('Veuillez saisir une adresse de portefeuille Solana SPL valide (min. 32 caractères).');
      return;
    }

    setIsSending(true);

    // Simulate blockchain confirmation (~1.5 seconds)
    await new Promise(r => setTimeout(r, 1500));

    // Deduct coins and SOL
    onUpdateWallet(prev => ({
      ...prev,
      amcBalance: Math.round((prev.amcBalance - amount) * 100) / 100,
      solBalance: Math.round((prev.solBalance - 0.0008) * 10000) / 10000
    }));

    // Record transaction log
    const txHash = 'SOL' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
    const newTx: Transaction = {
      id: `tx-send-${Date.now()}`,
      type: 'SEND',
      description: `Envoi de jetons AMC à : ${recipient.slice(0, 6)}...${recipient.slice(-6)}`,
      amountCfa: 0,
      amountAmc: amount,
      status: 'COMPLETED',
      txHash: txHash,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
    };
    onAddTransaction(newTx);

    setIsSending(false);
    setSendSuccess(true);
    setSendAmount('');
    setRecipient('');
    setTimeout(() => setSendSuccess(false), 3000);
  };

  // Section Échange / Recharge Action
  const handleRechargeAmc = async (e: React.FormEvent) => {
    e.preventDefault();
    setRechargeError(null);
    setRechargeSuccess(false);

    const amountCfa = parseFloat(rechargeAmountCfa);
    if (isNaN(amountCfa) || amountCfa <= 0) {
      setRechargeError('Veuillez saisir un montant en CFA valide (supérieur à 0).');
      return;
    }

    if (!rechargeAccountDetails.trim()) {
      setRechargeError(
        rechargeMethod === 'MOBILE_MONEY' 
          ? 'Veuillez saisir votre numéro de téléphone Mobile Money.'
          : rechargeMethod === 'TRANSFER'
            ? 'Veuillez saisir le numéro de reçu ou référence du transfert.'
            : 'Veuillez saisir l\'adresse de transaction de vos cryptomonnaies.'
      );
      return;
    }

    setIsRecharging(true);

    // Simulate validation and verification on Niger's local network (2.5 seconds)
    await new Promise(r => setTimeout(r, 2500));

    // Conversion rate: 1 Amintchi Coin (AMC) = 50 F CFA
    const receivedAmc = Math.round((amountCfa / 50) * 100) / 100;

    // Credit Amintchi Coin balance
    onUpdateWallet(prev => ({
      ...prev,
      amcBalance: prev.amcBalance + receivedAmc
    }));

    // Record transaction log
    const txHash = 'SOL' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
    const newTx: Transaction = {
      id: `tx-recharge-${Date.now()}`,
      type: 'RECEIVE',
      description: `Recharge de ${receivedAmc} AMC via ${rechargeProvider} (${rechargeAccountDetails})`,
      amountCfa: amountCfa,
      amountAmc: receivedAmc,
      status: 'COMPLETED',
      txHash: txHash,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
    };
    onAddTransaction(newTx);

    setLastCreditedAmc(receivedAmc);
    setIsRecharging(false);
    setRechargeSuccess(true);
    setRechargeAmountCfa('');
    setRechargeAccountDetails('');
    setTimeout(() => setRechargeSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Wallet Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Wallet Address & Balances Card */}
        <div className="lg:col-span-2 bg-[#0c0c14]/80 backdrop-blur-xl text-white rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(242,125,38,0.15)] border border-white/10">
          {/* Subtle design accents from Niger Flag */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F27D26]/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#14F195]/10 rounded-full blur-2xl" />

          {/* Header row */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Wallet className="w-4 h-4 text-[#F27D26]" />
              <span className="text-[10px] uppercase font-bold tracking-wider font-sans">Portefeuille Amintchi</span>
            </div>
            
            {/* Balance Faucet */}
            <button
              onClick={handleFaucetTopUp}
              title="Obtenir des CFA & SOL de test"
              className="text-[10px] bg-gradient-to-r from-[#F27D26] to-[#FFB347] hover:from-[#ff8e38] hover:to-[#ffc468] text-black font-bold px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer flex items-center space-x-1 shadow-sm"
              id="faucet-btn"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Tester (Faucet)</span>
            </button>
          </div>

          {/* Wallet Address SPL */}
          <div className="space-y-1.5 mb-8">
            <span className="text-[10px] text-white/45 uppercase font-sans">Adresse du compte (Solana SPL)</span>
            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/10 max-w-sm">
              <span className="font-mono text-xs text-white/80 truncate select-all">{wallet.publicKey}</span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white cursor-pointer shrink-0"
                id="copy-address-btn"
              >
                {copied ? <span className="text-[10px] text-[#14F195] font-bold">Copié !</span> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Balances Display Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
            
            {/* AMC Balance */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 uppercase font-sans flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#14F195] rounded-full animate-pulse" />
                Amintchi Coin
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1.5">
                <span className="text-2xl font-mono font-bold text-[#14F195]">{wallet.amcBalance.toLocaleString()}</span>
                <span className="text-xs text-[#14F195] font-mono font-bold">AMC</span>
              </div>
              <p className="text-[9px] text-white/40 mt-1">Jeton utilitaire SPL Solana</p>
            </div>

            {/* CFA Balance */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 uppercase font-sans">Monnaie Fiduciaire</span>
              <div className="flex items-baseline space-x-1.5 mt-1.5">
                <span className="text-2xl font-mono font-bold text-white">{wallet.cfaBalance.toLocaleString()}</span>
                <span className="text-xs text-white/45 font-mono">F CFA</span>
              </div>
              <p className="text-[9px] text-white/40 mt-1">Pour achats classiques & swap</p>
            </div>

            {/* SOL Balance */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/50 uppercase font-sans flex items-center gap-1">
                Solana Native
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1.5">
                <span className="text-2xl font-mono font-bold text-[#F27D26]">{wallet.solBalance.toLocaleString()}</span>
                <span className="text-xs text-[#F27D26] font-mono font-bold">SOL</span>
              </div>
              <p className="text-[9px] text-white/40 mt-1">Nécessaire pour frais de gaz</p>
            </div>

          </div>

        </div>

        {/* Network Metrics Stats */}
        <div className="bg-[#0c0c14]/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 flex flex-col justify-between text-white shadow-[0_0_30px_rgba(20,241,149,0.05)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-[#14F195] animate-pulse" />
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-white">Performance Réseau</h3>
              </div>
              <span className="text-[10px] bg-[#14F195]/20 text-[#14F195] px-2 py-0.5 rounded-full font-bold">Actif</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Vitesse Moyenne</p>
                <p className="font-mono font-bold text-white mt-1 flex items-center gap-1">
                  1.25s
                  <span className="text-[9px] font-sans font-normal text-[#14F195]">(&lt; 2s)</span>
                </p>
              </div>
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Frais Réseau</p>
                <p className="font-mono font-bold text-white mt-1">0.0005 SOL</p>
                <p className="text-[9px] text-white/40 mt-0.5">&lt; 0.5 F CFA</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Capacité max</p>
                <p className="font-mono font-bold text-white mt-1">65 000 TPS</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Type Jeton</p>
                <p className="font-mono font-bold text-white mt-1">Solana SPL</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4 text-[10px] text-white/40 space-y-2">
            <p className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#14F195] shrink-0" />
              <span>AMC est interopérable avec Phantom, Trust Wallet et Solflare.</span>
            </p>
          </div>
        </div>

      </div>

      {/* Transfer and Swap Terminals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Send / Transfer Terminal */}
        <div className="bg-[#0c0c14]/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 text-white shadow-lg">
          <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-2">
            <ArrowUpRight className="w-5 h-5 text-[#F27D26]" />
            <h3 className="font-display font-bold text-sm text-white">Transférer des AMC (P2P)</h3>
          </div>

          <form onSubmit={handleSendCoins} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase mb-1">Adresse de réception Solana</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ex: Am92xP2kF7B8L4...9mZ9a5kX"
                className="w-full bg-white/5 border border-white/10 focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] rounded-xl px-3 py-2 text-xs font-mono outline-hidden text-white placeholder-white/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase mb-1">Montant à envoyer (AMC)</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="Ex: 50"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] rounded-xl px-3 py-2 text-xs font-mono outline-hidden text-white placeholder-white/20 pr-12"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono font-bold text-white/40">AMC</span>
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] text-white/40">
                <span>Disponible : {wallet.amcBalance.toLocaleString()} AMC</span>
                <button
                  type="button"
                  onClick={() => setSendAmount(wallet.amcBalance.toString())}
                  className="text-[#F27D26] hover:text-[#ff8e38] font-bold cursor-pointer"
                >
                  Max
                </button>
              </div>
            </div>

            {sendError && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{sendError}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="p-2.5 bg-[#14F195]/10 border border-[#14F195]/30 rounded-xl text-[11px] text-[#14F195] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195] shrink-0" />
                <span>Transfert effectué et validé en 1.1s sur Solana !</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !sendAmount || !recipient}
              className="w-full bg-[#F27D26] hover:bg-[#ff8e38] disabled:bg-white/5 disabled:text-white/20 text-black font-bold text-xs py-2.5 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-1.5"
              id="send-submit-btn"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Validation Solana en cours...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Envoyer les jetons</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Swap / Recharge Terminal */}
        <div className="bg-[#0c0c14]/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 text-white shadow-lg">
          <div className="flex items-center space-x-2 mb-2 border-b border-white/10 pb-2">
            <ArrowLeftRight className="w-5 h-5 text-[#14F195]" />
            <h3 className="font-display font-bold text-sm text-white">Section Échange & Recharge (AMC)</h3>
          </div>

          <p className="text-[11px] text-white/60 mb-4 leading-relaxed">
            Pour effectuer des achats sur <span className="text-[#F27D26] font-bold">Amintchi Market</span>, vous devez d'abord échanger vos fonds en <span className="text-[#14F195] font-bold">Amintchi Coins (AMC)</span>. Le marché fonctionne exclusivement avec l'AMC. <strong className="text-white">1 AMC = 50 F CFA</strong>.
          </p>

          <form onSubmit={handleRechargeAmc} className="space-y-4">
            
            {/* Recharge Method Toggle */}
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase mb-1.5">Méthode de Paiement</label>
              <div className="bg-white/5 p-1 rounded-xl grid grid-cols-3 gap-1 text-center border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setRechargeMethod('MOBILE_MONEY');
                    setRechargeProvider('Airtel Money');
                    setRechargeError(null);
                  }}
                  className={`text-[10px] py-1.5 rounded-lg transition-all font-sans cursor-pointer ${
                    rechargeMethod === 'MOBILE_MONEY'
                      ? 'bg-[#F27D26] text-black font-bold shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRechargeMethod('TRANSFER');
                    setRechargeProvider('Mynita Transfert');
                    setRechargeError(null);
                  }}
                  className={`text-[10px] py-1.5 rounded-lg transition-all font-sans cursor-pointer ${
                    rechargeMethod === 'TRANSFER'
                      ? 'bg-[#14F195] text-black font-bold shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Transfert Local
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRechargeMethod('CRYPTO');
                    setRechargeProvider('USDT');
                    setRechargeError(null);
                  }}
                  className={`text-[10px] py-1.5 rounded-lg transition-all font-sans cursor-pointer ${
                    rechargeMethod === 'CRYPTO'
                      ? 'bg-indigo-500 text-white font-bold shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Cryptomonnaies
                </button>
              </div>
            </div>

            {/* Provider Select */}
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase mb-1">Opérateur / Service</label>
              <select
                value={rechargeProvider}
                onChange={(e) => setRechargeProvider(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#14F195] focus:ring-1 focus:ring-[#14F195] rounded-xl px-3 py-2 text-xs outline-hidden text-white"
              >
                {rechargeMethod === 'MOBILE_MONEY' && (
                  <>
                    <option value="Airtel Money" className="bg-slate-950">Airtel Money (Niger)</option>
                    <option value="Moov Money" className="bg-slate-950">Moov Money (Niger)</option>
                    <option value="Zamani Money" className="bg-slate-950">Zamani Money (Niger)</option>
                  </>
                )}
                {rechargeMethod === 'TRANSFER' && (
                  <>
                    <option value="Mynita Transfert" className="bg-slate-950">Mynita Transfert (Agences Niger)</option>
                    <option value="Amana Transfert" className="bg-slate-950">Amana Transfert (Agences Niger)</option>
                  </>
                )}
                {rechargeMethod === 'CRYPTO' && (
                  <>
                    <option value="USDT" className="bg-slate-950">USDT (Stablecoin TRC20/ERC20)</option>
                    <option value="SOL" className="bg-slate-950">SOL (Solana Native)</option>
                    <option value="BTC" className="bg-slate-950">BTC (Bitcoin Network)</option>
                  </>
                )}
              </select>
            </div>

            {/* CFA Amount Input */}
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase mb-1">
                {rechargeMethod === 'CRYPTO' ? 'Montant équivalent en Francs CFA à échanger' : 'Montant du Dépôt (Francs CFA)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rechargeAmountCfa}
                  onChange={(e) => setRechargeAmountCfa(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#14F195] focus:ring-1 focus:ring-[#14F195] rounded-xl px-3 py-2 text-xs font-mono outline-hidden text-white placeholder-white/20 pr-16"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono font-bold text-white/40">FCFA</span>
              </div>
            </div>

            {/* Account Details / Reference */}
            <div>
              <label className="block text-[10px] font-semibold text-white/50 uppercase mb-1">
                {rechargeMethod === 'MOBILE_MONEY' 
                  ? 'Votre Numéro de Téléphone' 
                  : rechargeMethod === 'TRANSFER' 
                    ? 'Référence / Code de reçu du Transfert' 
                    : 'Adresse de Transaction / Hash'}
              </label>
              <input
                type="text"
                value={rechargeAccountDetails}
                onChange={(e) => setRechargeAccountDetails(e.target.value)}
                placeholder={
                  rechargeMethod === 'MOBILE_MONEY' 
                    ? 'Ex: +227 99 99 99 99' 
                    : rechargeMethod === 'TRANSFER' 
                      ? 'Ex: MN-938192-NG' 
                      : 'Ex: 0x82c...9e3'
                }
                className="w-full bg-white/5 border border-white/10 focus:border-[#14F195] focus:ring-1 focus:ring-[#14F195] rounded-xl px-3 py-2 text-xs font-mono outline-hidden text-white placeholder-white/20"
              />
            </div>

            {/* Dynamic conversion display */}
            {rechargeAmountCfa && parseFloat(rechargeAmountCfa) > 0 && (
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/45">Taux fixe applicable :</span>
                  <span className="font-mono text-white">50 FCFA = 1.00 AMC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">Vous obtiendrez :</span>
                  <span className="font-mono text-[#14F195] font-bold">
                    {(parseFloat(rechargeAmountCfa) / 50).toLocaleString()} AMC
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1 mt-1 text-[9px]">
                  <span className="text-white/45">Frais de validation :</span>
                  <span className="text-[#14F195] font-bold uppercase">Gratuit (0 FCFA)</span>
                </div>
              </div>
            )}

            {rechargeError && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{rechargeError}</span>
              </div>
            )}

            {rechargeSuccess && (
              <div className="p-2.5 bg-[#14F195]/10 border border-[#14F195]/30 rounded-xl text-[11px] text-[#14F195] flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195] shrink-0" />
                  <span className="font-bold">Dépôt validé avec succès !</span>
                </div>
                <span className="text-[10px] text-white/70">
                  Votre compte a été crédité de {lastCreditedAmc} AMC après validation de votre transaction via {rechargeProvider}.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isRecharging || !rechargeAmountCfa}
              className="w-full bg-[#14F195] hover:bg-[#1dfa9f] disabled:bg-white/5 disabled:text-white/20 text-black font-bold text-xs py-2.5 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-1.5"
              id="recharge-submit-btn"
            >
              {isRecharging ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Validation & Vérification Réseau...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Confirmer & Échanger contre AMC</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Transaction History & Explorer Inspect panel */}
      <div className="bg-[#0c0c14]/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 text-white shadow-lg">
        <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-2">
          <History className="w-5 h-5 text-white/80" />
          <h3 className="font-display font-bold text-sm text-white">Registre Global de vos Transactions</h3>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/50">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] font-bold tracking-wider">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 font-mono">Valeur CFA</th>
                  <th className="py-2.5 px-3 font-mono">Valeur AMC</th>
                  <th className="py-2.5 px-3">Horodatage</th>
                  <th className="py-2.5 px-3 text-right">Blockchain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* Badge Column */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider border ${
                        tx.type === 'BUY' ? 'bg-[#F27D26]/10 text-[#F27D26] border-[#F27D26]/20' :
                        tx.type === 'MINE' ? 'bg-[#14F195]/10 text-[#14F195] border-[#14F195]/20' :
                        tx.type === 'SWAP' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                        tx.type === 'SEND' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-white/10 text-white border-white/10'
                      }`}>
                        {tx.type}
                      </span>
                    </td>

                    {/* Description Column */}
                    <td className="py-3 px-3 text-white/80 font-sans font-medium">
                      {tx.description}
                    </td>

                    {/* CFA value Column */}
                    <td className="py-3 px-3 font-mono font-bold text-white/70">
                      {tx.amountCfa > 0 ? `-${tx.amountCfa.toLocaleString()} F` : '—'}
                    </td>

                    {/* AMC value Column */}
                    <td className="py-3 px-3 font-mono">
                      {tx.amountAmc > 0 ? (
                        <span className={tx.type === 'MINE' || tx.type === 'RECEIVE' || (tx.type === 'SWAP' && tx.description.includes('CFA convertis')) ? 'text-[#14F195] font-bold' : 'text-white font-bold'}>
                          {tx.type === 'MINE' || tx.type === 'RECEIVE' || (tx.type === 'SWAP' && tx.description.includes('CFA convertis')) ? '+' : '-'}
                          {tx.amountAmc.toLocaleString()} AMC
                        </span>
                      ) : '—'}
                    </td>

                    {/* Date Column */}
                    <td className="py-3 px-3 text-white/40 font-sans">
                      {tx.timestamp}
                    </td>

                    {/* Link Column */}
                    <td className="py-3 px-3 text-right">
                      {tx.txHash ? (
                        <button
                          onClick={() => setInspectTx(tx)}
                          className="text-[10px] text-[#F27D26] hover:text-[#ff8e38] font-bold font-mono flex items-center gap-0.5 justify-end hover:underline cursor-pointer ml-auto"
                        >
                          Explorer
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/20 italic font-sans">—</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-white/40">
            <p className="text-xs">Aucune transaction enregistrée pour le moment.</p>
            <p className="text-[10px] text-white/30">Faites un achat ou convertissez vos CFA dans le terminal pour débuter.</p>
          </div>
        )}
      </div>

      {/* Explorer Inspector Modal */}
      <AnimatePresence>
        {inspectTx && (
          <div className="fixed inset-0 z-50 bg-[#050508]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c14]/95 backdrop-blur-xl text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Header */}
              <div className="p-4 bg-black/40 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-[#14F195] animate-spin" />
                  <span className="font-display font-bold text-xs tracking-wider uppercase text-white">Solana Explorer (Simulé)</span>
                </div>
                <button
                  onClick={() => setInspectTx(null)}
                  className="px-2 py-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white font-mono text-xs font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase mb-1">Hash de la Signature</span>
                  <span className="text-[#F27D26] text-[10px] block select-all break-all bg-black/40 p-2.5 rounded-xl border border-white/10">
                    {inspectTx.txHash}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Bloc Réseau</span>
                    <span className="font-bold text-white">#238,194,034</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase">Statut</span>
                    <span className="text-[#14F195] font-bold flex items-center gap-1">
                      Finalisé (2s)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase mt-2">Frais Réseau</span>
                    <span className="text-white/60 block mt-0.5">0.0005 SOL</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block uppercase mt-2">Programme Solana</span>
                    <span className="text-[#14F195] block mt-0.5 truncate">Token_SPL_Amintchi</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-white/70 border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span>Expéditeur:</span>
                    <span className="text-white/40 font-mono truncate w-32 text-right">{wallet.publicKey.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Action:</span>
                    <span className="text-white/55">{inspectTx.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valeur convertie:</span>
                    <span className="text-[#14F195] font-bold">
                      {inspectTx.amountAmc > 0 ? `${inspectTx.amountAmc} AMC` : `${inspectTx.amountCfa} F CFA`}
                    </span>
                  </div>
                </div>

                {inspectTx.txHash && (
                  <div className="flex flex-col items-center justify-center bg-white text-black p-4 rounded-2xl border border-white/10 my-2 shadow-inner">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2 font-sans">Reçu Numérique Infalsifiable</span>
                    <QRCode value={inspectTx.txHash} size={130} />
                    <span className="text-[9px] text-[#F27D26] font-extrabold mt-2 font-mono uppercase tracking-widest">Amintchi Proof of Tx</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setInspectTx(null)}
                  className="w-full bg-white hover:bg-white/90 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Fermer l'explorateur
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
