/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage, Product } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: Product | null;
}

const PRESET_PROMPTS = [
  { text: "Comment fonctionne l'Amintchi Coin ?", label: "Fonctionnement AMC" },
  { text: "Combien puis-je économiser en payant en AMC ?", label: "Réduction & Gain" },
  { text: "Comment vendre mes créations sur Amintchi Market ?", label: "Devenir Vendeur" },
  { text: "Quelle est la vitesse d'une transaction Solana ?", label: "Vitesse Solana" }
];

export default function AiAssistant({ isOpen, onClose, selectedProduct }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Sannu de aiki ! Fofo ! Bienvenue chez Amintchi Market AI.\n\nJe suis votre guide sur le premier marché intelligent du Niger. Comment puis-je vous aider aujourd'hui ? Je peux vous expliquer l'utilité du jeton Amintchi Coin (AMC), vous aider à simuler un achat, ou vous accompagner pour lister vos produits artisanaux.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, text: m.text })),
          userProductContext: selectedProduct || null
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le serveur Amintchi AI');
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setError("Désolé, impossible de se connecter au serveur IA Amintchi. Vérifiez la configuration de votre clé API dans les secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="ai-assistant-drawer"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c14]/95 backdrop-blur-2xl shadow-[-10px_0_40px_rgba(0,0,0,0.6)] z-50 flex flex-col border-l border-white/10"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#F27D26] to-[#14F195] text-black flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-black/10 rounded-lg">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-display font-bold tracking-wide text-sm">Assistant Intelligent</h3>
                <p className="text-[10px] text-black/70 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-black animate-pulse" />
                  Amintchi AI • En ligne
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-black/10 rounded-full transition-colors text-black"
              id="ai-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Banner */}
          {selectedProduct && (
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-white">
              <span className="truncate">
                Mode Conseil : <strong>{selectedProduct.name}</strong>
              </span>
              <span className="text-[10px] bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                {selectedProduct.priceAmc} AMC
              </span>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start space-x-2 max-w-[85%]">
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F27D26] mt-1 shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-md text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#F27D26] text-black font-semibold rounded-tr-none'
                        : 'bg-white/5 text-white border border-white/10 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1.5 text-right ${
                        msg.role === 'user' ? 'text-black/60' : 'text-white/40'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F27D26] mt-1 shrink-0">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#F27D26] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#F27D26] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-[#F27D26] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Erreur de connexion</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div ref={scrollToBottom} />
          </div>

          {/* Prompt Presets */}
          {messages.length === 1 && (
            <div className="p-3 bg-black/40 border-t border-white/10 flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.text)}
                  className="text-xs bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-white/10 bg-[#0c0c14] flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez un message (français, hausa, zarma)..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] rounded-xl px-3.5 py-2.5 text-sm outline-hidden transition-all text-white placeholder-white/20 disabled:bg-white/5 disabled:text-white/40"
              id="ai-input-field"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#F27D26] hover:bg-[#ff8e38] text-black disabled:bg-white/5 disabled:text-white/20 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer shrink-0"
              id="ai-send-btn"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
