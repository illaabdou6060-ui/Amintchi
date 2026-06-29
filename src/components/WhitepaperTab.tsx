/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, 
  Compass, Flag, HelpCircle, Map, Sparkles, Trophy, Users
} from 'lucide-react';
import { WHITEPAPER_SECTIONS, ROADMAP_STEPS } from '../data';

export default function WhitepaperTab() {
  const [activeDocSection, setActiveDocSection] = useState('intro');
  const [expandedRoadmapPhase, setExpandedRoadmapPhase] = useState<string | null>('Phase 2');

  const selectedDoc = WHITEPAPER_SECTIONS.find(s => s.id === activeDocSection) || WHITEPAPER_SECTIONS[0];

  const toggleRoadmapExpand = (phase: string) => {
    if (expandedRoadmapPhase === phase) {
      setExpandedRoadmapPhase(null);
    } else {
      setExpandedRoadmapPhase(phase);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Overview Intro Banner */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-1.5 bg-orange-100 text-orange-800 w-fit px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
            <BookOpen className="w-3 h-3 text-orange-700" />
            <span>Document de Référence Officiel</span>
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
            Livre Blanc & Feuille de Route d'Amintchi
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Consultez notre plan stratégique complet et notre vision technologique hybride visant à lever les barrières du e-commerce au Niger par la blockchain.
          </p>
        </div>
        
        {/* Quick summary cards */}
        <div className="flex items-center space-x-4 bg-white p-3.5 rounded-2xl border border-slate-100 shrink-0 shadow-xs">
          <div className="text-center px-3 border-r border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase">Token SPL</span>
            <span className="font-mono text-sm font-bold text-slate-800">AMC</span>
          </div>
          <div className="text-center px-3 border-r border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase">Réseau</span>
            <span className="font-mono text-sm font-bold text-emerald-600">Solana</span>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] text-slate-400 block uppercase">Slogan</span>
            <span className="text-[10px] font-bold text-orange-600">Amintchi</span>
          </div>
        </div>
      </div>

      {/* Main Livre Blanc Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold px-1.5 block">Livre Blanc (Sommaire)</span>
          <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs space-y-1">
            {WHITEPAPER_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveDocSection(sec.id)}
                className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
                  activeDocSection === sec.id
                    ? 'bg-orange-50 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Panel */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-50 pb-3">
              {selectedDoc.title}
            </h3>
            
            {/* Formatted body paragraph */}
            <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans space-y-4">
              {selectedDoc.content}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-3">
            <p className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-orange-500" />
              <span>Amintchi Market Projet v1.0 • Économie circulaire numérique</span>
            </p>
            <p className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              Propulsé par Solana & l'IA
            </p>
          </div>
        </div>

      </div>

      {/* Interactive Vertical Roadmap */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">Feuille de Route d'Amintchi</h3>
          <p className="text-xs text-slate-400 mt-0.5">Cliquez sur chaque phase pour inspecter les jalons, les priorités et les réalisations.</p>
        </div>

        {/* Timeline container */}
        <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-6">
          
          {ROADMAP_STEPS.map((step) => {
            const isExpanded = expandedRoadmapPhase === step.phase;
            return (
              <div key={step.phase} className="relative">
                
                {/* Timeline Icon Marker */}
                <span className="absolute -left-[35px] top-1 flex items-center justify-center">
                  {step.status === 'completed' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : step.status === 'current' ? (
                    <div className="w-5 h-5 rounded-full bg-orange-500 border-4 border-white text-white flex items-center justify-center shadow-md animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-300 border-4 border-white text-white flex items-center justify-center shadow-xs">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  )}
                </span>

                {/* Step content header */}
                <div 
                  onClick={() => toggleRoadmapExpand(step.phase)}
                  className={`bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-100 cursor-pointer flex items-center justify-between transition-all duration-150 ${
                    step.status === 'current' ? 'border-orange-100 bg-orange-50/10' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      step.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      step.status === 'current' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {step.phase} • {step.timeframe}
                    </span>
                    <h4 className="font-display font-bold text-sm text-slate-800">{step.title}</h4>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-slate-400 shrink-0 ml-4">
                    <span className="text-[10px] uppercase font-semibold">
                      {step.status === 'completed' ? 'Terminée' : step.status === 'current' ? 'En cours' : 'Planifiée'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details list with animated expand effect */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 bg-slate-50/30 rounded-2xl border border-slate-100/60 p-4 space-y-2.5 ml-1"
                  >
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Objectifs prioritaires :</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-xs text-slate-600 space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            step.status === 'completed' ? 'bg-emerald-500' :
                            step.status === 'current' ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'
                          }`} />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}
