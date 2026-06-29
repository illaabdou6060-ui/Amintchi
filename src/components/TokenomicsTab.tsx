/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PieChart, Coins, Lock, HelpCircle, ArrowRight, Sparkles, 
  ChevronRight, Info, Award, ShieldAlert, BadgePercent, Landmark
} from 'lucide-react';
import { TOKENOMICS_SECTIONS } from '../data';

export default function TokenomicsTab() {
  const [activeSegment, setActiveSegment] = useState<number>(0);
  const [calcAmount, setCalcAmount] = useState('25000'); // CFA

  const activeSection = TOKENOMICS_SECTIONS[activeSegment];

  // SVG Donut Calculations (Radius 50)
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159

  let accumulatedPercentage = 0;

  const segments = TOKENOMICS_SECTIONS.map((sec, idx) => {
    const strokeDasharray = `${(sec.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = `${- (accumulatedPercentage / 100) * circumference}`;
    accumulatedPercentage += sec.percentage;
    return {
      ...sec,
      idx,
      strokeDasharray,
      strokeDashoffset
    };
  });

  // Calculate simulated savings based on calculator input
  const amountCfa = parseFloat(calcAmount) || 0;
  const priceAmc = Math.round(amountCfa * 0.85); // 15% discount
  const savingsCfa = amountCfa - priceAmc;
  const cashbackEarned = Math.round((amountCfa * 0.1) * 10) / 10; // 10% cashback in AMC

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      <div className="bg-linear-to-r from-orange-600 to-amber-500 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-100">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="relative max-w-xl space-y-3">
          <div className="flex items-center space-x-1.5 bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
            <Coins className="w-3 h-3 text-orange-200" />
            <span>Données Officielles AMC</span>
          </div>
          <h2 className="font-display font-bold text-2xl tracking-tight leading-tight">
            Tokenomics du Amintchi Coin
          </h2>
          <p className="text-xs text-orange-50/95 leading-relaxed">
            L'Amintchi Coin (AMC) possède une réserve fixe et inviolable de 100 000 000 jetons. Aucune inflation n'est possible, ce qui garantit la rareté programmée de l'actif au fur et à mesure que le commerce intelligent se développe au Niger.
          </p>
        </div>
      </div>

      {/* Interactive Donut & Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        
        {/* SVG Donut Chart */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-64 h-64">
            
            {/* Center Legend Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none select-none">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-medium">Répartition</span>
              <span className="font-display font-bold text-3xl text-slate-800 leading-none mt-1">
                {activeSection.percentage}%
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 mt-1 truncate max-w-[120px]">
                {activeSection.name.split(' ')[0]}
              </span>
            </div>

            {/* Custom SVG Circle segments */}
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full transform -rotate-90"
            >
              {segments.map((seg) => {
                const isSelected = activeSegment === seg.idx;
                return (
                  <circle
                    key={seg.idx}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isSelected ? '14' : '10'}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    onClick={() => setActiveSegment(seg.idx)}
                    className="transition-all duration-300 cursor-pointer hover:stroke-[13px]"
                    style={{
                      opacity: activeSegment === seg.idx ? 1 : 0.8,
                    }}
                  />
                );
              })}
            </svg>

          </div>

          {/* Quick Click Legend buttons */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
            {TOKENOMICS_SECTIONS.map((sec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSegment(idx)}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeSegment === idx
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                <span>{sec.percentage}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Allocation details card */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3">
              <div 
                className="p-2.5 rounded-xl text-white shrink-0 shadow-sm"
                style={{ backgroundColor: activeSection.color }}
              >
                {activeSection.percentage === 40 ? <Award className="w-5 h-5" /> :
                 activeSection.percentage === 20 && activeSection.name.includes('Équipe') ? <Lock className="w-5 h-5" /> :
                 activeSection.percentage === 20 && activeSection.name.includes('Vente') ? <BadgePercent className="w-5 h-5" /> :
                 <Landmark className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold block">Section active</span>
                <h4 className="font-display font-bold text-sm text-slate-800 mt-0.5">{activeSection.name}</h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200/55 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 font-sans uppercase">Proportion</span>
                <p className="font-mono text-base font-bold text-slate-800 mt-0.5">{activeSection.percentage} %</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans uppercase">Quantité Fixe</span>
                <p className="font-mono text-base font-bold text-slate-800 mt-0.5">{activeSection.amount.toLocaleString()} AMC</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-sans leading-relaxed">
              {activeSection.description}
            </div>

            {/* Smart Contract details details */}
            {activeSection.name.includes('Équipe') && (
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-[10px] text-red-800 flex items-start gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Garantie de Sérieux :</strong> Bloqué par Smart Contract pendant 1 an (falaise), suivi d'un déblocage linéaire sur 2 ans pour éviter toute vente massive et rassurer les investisseurs.
                </span>
              </div>
            )}
            
            {activeSection.name.includes('Récompenses') && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 flex items-start gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mining Circularité :</strong> Ces jetons ne sont pas minés par de grosses machines énergivores, mais par de véritables achats réels au Niger. Plus les gens achètent, plus l'économie se décentralise !
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Interactive Mining & Savings Calculator */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Coins className="w-4 h-4 text-orange-600 animate-pulse" />
            <h3 className="font-display font-semibold text-sm text-slate-800">Simulateur Économique Amintchi</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">Estimez vos gains et réductions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Input block */}
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Entrez le budget d'un achat classique que vous feriez en Francs CFA pour voir l'impact immédiat si vous l'effectuez sur l'écosystème Amintchi :
            </p>
            
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Montant d'achat simulé</label>
              <div className="relative">
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="Ex: 25000"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2.5 text-xs font-mono outline-hidden pr-12"
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono font-bold text-slate-400">F CFA</span>
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Case 1: Pay in AMC */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Option A : Payer en AMC (-15%)
              </span>
              <div className="space-y-1 pt-1">
                <p className="text-[10px] text-slate-400 font-sans">Coût équivalent en jetons :</p>
                <p className="font-mono text-lg font-bold text-emerald-700">{priceAmc.toLocaleString()} AMC</p>
              </div>
              <div className="text-[10px] text-emerald-600 font-sans pt-1 border-t border-emerald-100 flex justify-between">
                <span>Économie directe en CFA :</span>
                <strong>{savingsCfa.toLocaleString()} F CFA</strong>
              </div>
            </div>

            {/* Case 2: Pay in CFA */}
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Option B : Payer en CFA (Mining)
              </span>
              <div className="space-y-1 pt-1">
                <p className="text-[10px] text-slate-400 font-sans">Cashback reversé (Fidélité 2.0) :</p>
                <p className="font-mono text-lg font-bold text-orange-700">+{cashbackEarned.toLocaleString()} AMC</p>
              </div>
              <div className="text-[10px] text-orange-600 font-sans pt-1 border-t border-orange-100 flex justify-between">
                <span>Intérêt de fidélité :</span>
                <strong>10% Cashback converti</strong>
              </div>
            </div>

          </div>

        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <span>
            <strong>Constat économique :</strong> En payant en AMC, vous conservez immédiatement du pouvoir d'achat en poche (15% de réduction directe accordée par les marchands pour encourager la blockchain). En payant en CFA, vous accumulez de l'Amintchi Coin pour vos futurs achats !
          </span>
        </div>

      </div>

    </div>
  );
}
