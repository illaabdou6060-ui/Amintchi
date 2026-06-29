/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, SlidersHorizontal, MapPin, Star, Sparkles, ShoppingBag, 
  ArrowRight, ShieldCheck, CreditCard, Flame, AlertCircle, Info, Check, Bot, Zap,
  GitCompare, Scale, Trash2, Plus, Minus, Truck, QrCode
} from 'lucide-react';
import { Product, WalletState, Transaction } from '../types';
import { INITIAL_PRODUCTS } from '../data';
import QRCode from './QRCode';

interface MarketTabProps {
  wallet: WalletState;
  onUpdateWallet: (updater: (prev: WalletState) => WalletState) => void;
  onAddTransaction: (tx: Transaction) => void;
  onOpenAssistant: () => void;
  onSelectProductForAi: (product: Product) => void;
}

export default function MarketTab({ 
  wallet, 
  onUpdateWallet, 
  onAddTransaction, 
  onOpenAssistant,
  onSelectProductForAi 
}: MarketTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product Comparison State
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.some(p => p.id === product.id)) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (compareList.length >= 2) {
        // Automatically replace the second item to keep maximum 2
        setCompareList(prev => [prev[0], product]);
      } else {
        setCompareList(prev => [...prev, product]);
      }
    }
  };
  
  // Checkout Process State
  const [paymentMethod, setPaymentMethod] = useState<'CFA' | 'AMC'>('AMC');
  const [mobileOperator, setMobileOperator] = useState<string>('Orange Money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutTxHash, setCheckoutTxHash] = useState<string>('');

  // --- Shopping Cart (Panier Intelligent) State & Logic ---
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartDeliveryRegion, setCartDeliveryRegion] = useState<string>('Niamey');
  const [cartDeliveryAddress, setCartDeliveryAddress] = useState<string>('');
  const [cartIsProcessing, setCartIsProcessing] = useState(false);
  const [cartProcessingStep, setCartProcessingStep] = useState(0);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartTxHash, setCartTxHash] = useState<string>('');

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateCartTotalAmc = () => {
    return cart.reduce((sum, item) => sum + (item.product.priceAmc * item.quantity), 0);
  };

  const calculateCartTotalCfa = () => {
    return cart.reduce((sum, item) => sum + (item.product.priceCfa * item.quantity), 0);
  };

  const getDeliveryFeeAmc = () => {
    // 5 AMC delivery fee across Niger, free above 150 AMC
    const total = calculateCartTotalAmc();
    if (total >= 150 || total === 0) return 0;
    return 5;
  };

  const handleConfirmCartPayment = async () => {
    const totalAmc = calculateCartTotalAmc();
    const deliveryFee = getDeliveryFeeAmc();
    const grandTotalAmc = totalAmc + deliveryFee;

    if (wallet.amcBalance < grandTotalAmc) {
      setCartError("Solde AMC insuffisant ! Veuillez d'abord échanger du CFA contre de l'Amintchi Coin (AMC) dans l'onglet Portefeuille.");
      return;
    }

    if (wallet.solBalance < 0.001) {
      setCartError("Frais de gaz Solana insuffisants (requis : 0.001 SOL pour la transaction blockchain).");
      return;
    }

    if (!cartDeliveryAddress.trim()) {
      setCartError("Veuillez renseigner votre adresse de livraison au Niger.");
      return;
    }

    setCartIsProcessing(true);
    setCartError(null);

    // Step 1: Sign Transaction on Solana
    setCartProcessingStep(1);
    await new Promise(r => setTimeout(r, 800));

    // Step 2: Validate blocks
    setCartProcessingStep(2);
    await new Promise(r => setTimeout(r, 1200));

    // Success!
    // Update balances
    onUpdateWallet(prev => ({
      ...prev,
      amcBalance: Math.round((prev.amcBalance - grandTotalAmc) * 100) / 100,
      solBalance: Math.round((prev.solBalance - 0.0005) * 10000) / 10000
    }));

    const txHash = 'SOL-CART-' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
    setCartTxHash(txHash);

    // Add to transaction log
    const newTx: Transaction = {
      id: `tx-cart-${Date.now()}`,
      type: 'BUY',
      description: `Commande Amintchi Market (${cart.length} articles) livré à ${cartDeliveryRegion}`,
      amountCfa: 0,
      amountAmc: grandTotalAmc,
      status: 'COMPLETED',
      txHash: txHash,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
    };
    onAddTransaction(newTx);

    setCartIsProcessing(false);
    setCartSuccess(true);
  };

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'artisanat', label: 'Artisanat d\'Art' },
    { id: 'alimentation', label: 'Alimentation Locale' },
    { id: 'textile', label: 'Textiles' }
  ];

  const filteredProducts = INITIAL_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCheckout = (product: Product, preferredMethod?: 'CFA' | 'AMC') => {
    setSelectedProduct(product);
    setErrorMessage(null);
    setIsSuccess(false);
    setIsProcessing(false);
    setProcessingStep(0);
    if (preferredMethod) {
      setPaymentMethod(preferredMethod);
    } else {
      // Suggest the best payment method based on wallet balance
      if (wallet.amcBalance >= product.priceAmc) {
        setPaymentMethod('AMC');
      } else {
        setPaymentMethod('CFA');
      }
    }
  };

  const calculateMobileMoneyFee = (priceCfa: number) => {
    // 2.5% fee
    return Math.round(priceCfa * 0.025);
  };

  const handleConfirmPayment = async () => {
    if (!selectedProduct) return;

    if (paymentMethod === 'AMC') {
      // Validate balance
      if (wallet.amcBalance < selectedProduct.priceAmc) {
        setErrorMessage("Solde AMC insuffisant ! Allez dans l'onglet 'Portefeuille' pour échanger des CFA contre des jetons AMC.");
        return;
      }
      if (wallet.solBalance < 0.001) {
        setErrorMessage("Frais de gaz Solana insuffisants (requis : 0.001 SOL). Réapprovisionnez votre portefeuille.");
        return;
      }

      // Start Blockchain process simulation
      setIsProcessing(true);
      setErrorMessage(null);
      
      // Step 1: Sign transaction
      setProcessingStep(1);
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Validate blocks (Solana 1.2s avg)
      setProcessingStep(2);
      await new Promise(r => setTimeout(r, 900));

      // Step 3: Success!
      // Update balances
      onUpdateWallet(prev => ({
        ...prev,
        amcBalance: Math.round((prev.amcBalance - selectedProduct.priceAmc) * 100) / 100,
        solBalance: Math.round((prev.solBalance - 0.0005) * 10000) / 10000 // minimal network gas fee
      }));

      // Add transaction logs
      const txHash = 'SOL' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'BUY',
        description: `Achat de "${selectedProduct.name}" (Paiement AMC)`,
        amountCfa: 0,
        amountAmc: selectedProduct.priceAmc,
        status: 'COMPLETED',
        txHash: txHash,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
      };
      onAddTransaction(newTx);

      setCheckoutTxHash(txHash);
      setIsProcessing(false);
      setIsSuccess(true);

    } else {
      // CFA Mobile Money Simulation
      const totalCfa = selectedProduct.priceCfa + calculateMobileMoneyFee(selectedProduct.priceCfa);
      if (wallet.cfaBalance < totalCfa) {
        setErrorMessage("Solde CFA insuffisant ! Veuillez ajouter des Francs CFA virtuels à votre solde.");
        return;
      }

      if (!phoneNumber.trim()) {
        setErrorMessage("Veuillez saisir votre numéro de téléphone Mobile Money.");
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);

      // Step 1: Connect to Operator
      setProcessingStep(1);
      await new Promise(r => setTimeout(r, 800));

      // Step 2: Validate Transaction OTP
      setProcessingStep(2);
      await new Promise(r => setTimeout(r, 800));

      // Step 3: Mining AMC Cashback!
      setProcessingStep(3);
      await new Promise(r => setTimeout(r, 1000));

      // Calculate earned AMC cashback (10% of CFA price in tokens)
      const minedAmc = Math.round((selectedProduct.priceCfa * 0.1) * 10) / 10;

      // Update balances
      onUpdateWallet(prev => ({
        ...prev,
        cfaBalance: prev.cfaBalance - totalCfa,
        amcBalance: Math.round((prev.amcBalance + minedAmc) * 100) / 100
      }));

      const txHash = 'CFA' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();

      // Add main transaction logs
      const newTx: Transaction = {
        id: `tx-buy-${Date.now()}`,
        type: 'BUY',
        description: `Achat de "${selectedProduct.name}" (Mobile Money)`,
        amountCfa: totalCfa,
        amountAmc: 0,
        status: 'COMPLETED',
        txHash: txHash,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
      };
      onAddTransaction(newTx);

      // Add Mining transaction logs
      const mineTx: Transaction = {
        id: `tx-mine-${Date.now()}`,
        type: 'MINE',
        description: `Mining Cashback de +${minedAmc} AMC (Fidélité Achat)`,
        amountCfa: 0,
        amountAmc: minedAmc,
        status: 'COMPLETED',
        txHash: 'MINE' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString()
      };
      onAddTransaction(mineTx);

      setCheckoutTxHash(txHash);
      setIsProcessing(false);
      setIsSuccess(true);
    }
  };

  const handleConsultAiAboutProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProductForAi(product);
    onOpenAssistant();
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Category Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Rechercher du Kilichi, un artisanat touareg, un vendeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-hidden text-white placeholder-white/30 transition-all"
            id="search-input"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-1.5 text-xs text-white/50 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
            <span>Filtrer par :</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.3)] font-bold'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="font-display font-black text-lg text-white tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 bg-[#009A44] rounded-full inline-block animate-pulse" />
            Amintchi Market Intelligent 🇳🇪
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Ajoutez plusieurs articles au panier et payez en une seule fois et exclusivement en jetons <span className="text-[#14F195] font-bold">Amintchi Coin (AMC)</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-white/30 font-mono">
            {filteredProducts.length} articles disponibles
          </span>
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#F27D26] hover:bg-[#ff8e38] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-150 cursor-pointer"
            id="open-cart-btn"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mon Panier</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5.5 h-5.5 bg-[#009A44] border-2 border-[#050508] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="product-grid">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              className={`group bg-white/5 border backdrop-blur-md rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-[#F27D26]/40 hover:shadow-[0_0_20px_rgba(242,125,38,0.15)] ${
                compareList.some(p => p.id === product.id)
                  ? 'border-[#14F195]/60 shadow-[0_0_15px_rgba(20,241,149,0.15)]'
                  : 'border-white/10'
              }`}
            >
              {/* Product Image */}
              <div className="relative h-48 w-full overflow-hidden bg-white/5">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Categoric Tag */}
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-xs border ${
                    product.category === 'alimentation' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                    product.category === 'artisanat' ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' :
                    product.category === 'textile' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-white/10 text-white/80 border-white/20'
                  }`}>
                    {product.category}
                  </span>
                  {compareList.some(p => p.id === product.id) && (
                    <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[#14F195] text-black border border-[#14F195] flex items-center gap-0.5 shadow-[0_0_8px_rgba(20,241,149,0.5)]">
                      <GitCompare className="w-2.5 h-2.5" />
                      Sélectionné
                    </span>
                  )}
                </div>

                {/* Localized Location Tag */}
                <div className="absolute top-3 right-3 bg-[#050508]/75 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1 border border-white/10">
                  <MapPin className="w-3 h-3 text-[#F27D26]" />
                  <span>{product.sellerLocation}</span>
                </div>

                {/* AMC Discount Spark */}
                <div className="absolute bottom-3 left-3 bg-[#14F195] text-black text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Jusqu'à -15% en AMC</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title & Seller */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display font-semibold text-sm text-white leading-snug group-hover:text-[#F27D26] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-0.5 text-amber-400 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-xs font-mono font-medium text-white">{product.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/40 font-sans mt-0.5">
                    Par : <strong className="text-white/75">{product.sellerName}</strong>
                  </p>

                  <p className="text-xs text-white/60 font-sans mt-2 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & Checkout Block */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    
                    {/* Price CFA */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/40 uppercase font-sans">Prix Standard</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {product.priceCfa.toLocaleString()} F CFA
                      </span>
                      <span className="text-[9px] text-[#14F195] font-semibold">
                        +10% AMC Cashback
                      </span>
                    </div>

                    {/* Price AMC */}
                    <div className="flex flex-col border-l border-white/10 pl-3 relative">
                      <span className="text-[10px] text-[#14F195] uppercase font-sans font-semibold flex items-center gap-0.5">
                        Prix Amintchi
                        <Zap className="w-2.5 h-2.5 fill-[#14F195] text-[#14F195]" />
                      </span>
                      <span className="font-mono text-sm font-bold text-[#14F195]">
                        {product.priceAmc.toLocaleString()} AMC
                      </span>
                      <span className="text-[9px] text-[#F27D26] font-semibold">
                        Économisez {(product.priceCfa - product.priceAmc).toLocaleString()} F
                      </span>
                    </div>

                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="flex-1 bg-[#009A44] hover:bg-[#00b34f] text-white font-extrabold text-xs py-2.5 rounded-xl transition-all duration-150 shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Ajouter au panier</span>
                      </button>

                      {/* Immediate Buy button */}
                      <button
                        onClick={() => handleOpenCheckout(product)}
                        className="bg-white/15 hover:bg-white/20 border border-white/10 text-white font-semibold text-[11px] px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                        title="Achat express direct"
                      >
                        Achat direct
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-white/70">
                      {/* Compare Button */}
                      <button
                        onClick={(e) => handleToggleCompare(product, e)}
                        title={compareList.some(p => p.id === product.id) ? "Retirer de la comparaison" : "Ajouter au comparateur"}
                        className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
                          compareList.some(p => p.id === product.id)
                            ? 'bg-[#14F195]/25 border-[#14F195]/40 text-[#14F195]'
                            : 'bg-white/5 border-white/10 hover:border-[#14F195]/30 hover:text-[#14F195]'
                        }`}
                      >
                        <GitCompare className="w-3 h-3" />
                        <span>{compareList.some(p => p.id === product.id) ? "Sélectionné" : "Comparer"}</span>
                      </button>

                      {/* Ask AI Context Shortcut */}
                      <button
                        onClick={(e) => handleConsultAiAboutProduct(product, e)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-[#F27D26]/15 border border-white/10 hover:border-[#F27D26]/30 rounded-lg hover:text-[#F27D26] text-[10px] font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Bot className="w-3 h-3" />
                        <span>Amintchi AI</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="font-display font-semibold text-white">Aucun produit trouvé</p>
          <p className="text-xs text-white/50 mt-1">
            Essayez de modifier votre recherche ou de sélectionner une autre catégorie de produits.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
            className="mt-4 text-xs bg-white/10 hover:bg-white/15 border border-white/10 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}

      {/* Dynamic Checkout & Payment Terminal Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-[#050508]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-[#0c0c14]/95 backdrop-blur-xl rounded-3xl ${isSuccess ? 'max-w-2xl' : 'max-w-lg'} w-full overflow-hidden shadow-[0_0_50px_rgba(242,125,38,0.2)] border border-white/10 flex flex-col max-h-[90vh] text-white`}
            >
              {/* Modal Header */}
              <div className="p-4 bg-gradient-to-r from-[#F27D26] to-[#FFB347] text-black flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <h3 className="font-display font-bold tracking-wide">Terminal d'Achat Intégré</h3>
                </div>
                {!isProcessing && (
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-2.5 py-1 hover:bg-black/10 rounded-lg transition-colors font-mono text-xs font-semibold"
                  >
                    Fermer ✕
                  </button>
                )}
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                
                {/* Active Purchase Summary */}
                <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-xs text-white truncate">{selectedProduct.name}</h4>
                    <p className="text-[10px] text-white/40">Vendu par {selectedProduct.sellerName} • {selectedProduct.sellerLocation}</p>
                    <div className="flex items-center space-x-3 mt-1 text-[11px]">
                      <span className="text-white/60">Prix CFA : <strong className="text-white">{selectedProduct.priceCfa.toLocaleString()} F</strong></span>
                      <span className="text-[#14F195] font-bold">Prix AMC : <strong className="text-[#14F195]">{selectedProduct.priceAmc.toLocaleString()} AMC</strong></span>
                    </div>
                  </div>
                </div>

                {/* State: normal selection */}
                {!isProcessing && !isSuccess && (
                  <>
                    {/* Select Payment Method */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/80">Choisissez votre moyen de paiement :</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Option 1: Solana Blockchain AMC */}
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod('AMC'); setErrorMessage(null); }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            paymentMethod === 'AMC'
                              ? 'border-[#14F195] bg-[#14F195]/10 ring-1 ring-[#14F195]'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-white">Amintchi Coin (AMC)</span>
                            <div className="bg-[#14F195]/20 text-[#14F195] p-0.5 rounded-full">
                              <Zap className="w-3 h-3 text-[#14F195] fill-[#14F195]" />
                            </div>
                          </div>
                          <p className="font-mono text-xs font-bold text-[#14F195]">
                            {selectedProduct.priceAmc.toLocaleString()} AMC
                          </p>
                          <p className="text-[10px] text-[#14F195]/80 mt-1">
                            • Réduction immédiate de 15%
                          </p>
                          <p className="text-[10px] text-white/50">
                            • Confirmation blockchain &lt;2s
                          </p>
                          <p className="text-[10px] text-white/50">
                            • Sans commissions opérateurs
                          </p>
                          {paymentMethod === 'AMC' && (
                            <div className="absolute top-2 right-2 bg-[#14F195] text-black rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>

                        {/* Option 2: CFA Mobile Money */}
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod('CFA'); setErrorMessage(null); }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                            paymentMethod === 'CFA'
                              ? 'border-[#F27D26] bg-[#F27D26]/10 ring-1 ring-[#F27D26]'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-white">CFA / Mobile Money</span>
                            <div className="bg-[#F27D26]/20 text-[#F27D26] p-0.5 rounded-full">
                              <CreditCard className="w-3 h-3 text-[#F27D26]" />
                            </div>
                          </div>
                          <p className="font-mono text-xs font-bold text-white">
                            {(selectedProduct.priceCfa + calculateMobileMoneyFee(selectedProduct.priceCfa)).toLocaleString()} F CFA
                          </p>
                          <p className="text-[10px] text-white/50 mt-1">
                            • Prix : {selectedProduct.priceCfa.toLocaleString()} F
                          </p>
                          <p className="text-[10px] text-white/50">
                            • Frais op : +{calculateMobileMoneyFee(selectedProduct.priceCfa).toLocaleString()} F (2.5%)
                          </p>
                          <p className="text-[10px] text-[#14F195] font-semibold mt-1">
                            • Gagnez +{(selectedProduct.priceCfa * 0.1).toLocaleString()} AMC Cashback !
                          </p>
                          {paymentMethod === 'CFA' && (
                            <div className="absolute top-2 right-2 bg-[#F27D26] text-black rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>

                      </div>
                    </div>

                    {/* Conditional inputs */}
                    {paymentMethod === 'CFA' ? (
                      <div className="space-y-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 uppercase">Opérateur</label>
                            <select
                              value={mobileOperator}
                              onChange={(e) => setMobileOperator(e.target.value)}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 text-xs outline-hidden text-white"
                            >
                              <option value="Orange Money">Orange Money</option>
                              <option value="Moov Money">Moov Money</option>
                              <option value="Aman Transfert">Aman Transfert</option>
                              <option value="Al-Izza">Al-Izza Express</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 uppercase">Numéro Téléphone</label>
                            <input
                              type="text"
                              placeholder="+227 9x xx xx xx"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 text-xs font-mono outline-hidden text-white placeholder-white/20"
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-white/40">
                          Un message d'autorisation de débit (requête USSD/OTP) sera simulé sur votre mobile.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/60">Adresse de paiement :</span>
                          <span className="font-mono text-[10px] text-white/40 shrink-0 select-all">
                            {wallet.publicKey.slice(0, 8)}...{wallet.publicKey.slice(-8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Solde actuel :</span>
                          <span className="font-mono text-[#14F195] font-bold">{wallet.amcBalance.toLocaleString()} AMC</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-1.5">
                          <span className="text-white/60">Frais réseau Solana :</span>
                          <span className="font-mono text-white/30">~0.0005 SOL (frais infimes &lt; 0.5 CFA)</span>
                        </div>
                      </div>
                    )}

                    {/* Display Error Message */}
                    {errorMessage && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Checkout CTA */}
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      className={`w-full text-black font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2 ${
                        paymentMethod === 'AMC' ? 'bg-[#14F195] hover:bg-[#1dfa9f]' : 'bg-[#F27D26] hover:bg-[#ff8e38]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirmer et Payer l'article</span>
                    </button>
                  </>
                )}

                {/* State: Processing transaction */}
                {isProcessing && (
                  <div className="py-8 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className={`absolute inset-0 border-4 border-white/5 rounded-full ${
                        paymentMethod === 'AMC' ? 'border-t-[#14F195]' : 'border-t-[#F27D26]'
                      } animate-spin`} />
                      <ShoppingBag className={`w-6 h-6 ${paymentMethod === 'AMC' ? 'text-[#14F195]' : 'text-[#F27D26]'}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-white text-sm">Traitement en cours...</h4>
                      <p className="text-xs text-white/40">Veuillez ne pas fermer cette fenêtre</p>
                    </div>

                    {/* Progress Steps Visualizer */}
                    <div className="max-w-xs mx-auto text-left space-y-2.5 pt-4">
                      {paymentMethod === 'AMC' ? (
                        <>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              processingStep >= 1 ? 'bg-[#14F195] text-black' : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              {processingStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={processingStep === 1 ? 'font-semibold text-white' : 'text-white/40'}>
                              Signature de la transaction Solana
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              processingStep >= 2 ? 'bg-[#14F195] text-black' : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              {processingStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={processingStep === 2 ? 'font-semibold text-white' : 'text-white/40'}>
                              Validation décentralisée (~1.2 seconde)
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              processingStep >= 1 ? 'bg-[#F27D26] text-black' : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              {processingStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={processingStep === 1 ? 'font-semibold text-white' : 'text-white/40'}>
                              Connexion opérateur ({mobileOperator})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              processingStep >= 2 ? 'bg-[#F27D26] text-black' : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              {processingStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={processingStep === 2 ? 'font-semibold text-white' : 'text-white/40'}>
                              Validation de l'autorisation USSD/OTP
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              processingStep >= 3 ? 'bg-[#F27D26] text-black' : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              {processingStep > 3 ? '✓' : '3'}
                            </div>
                            <span className={processingStep === 3 ? 'font-semibold text-white' : 'text-white/40'}>
                              Mining de vos récompenses Cashback AMC
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* State: Success checkout */}
                {isSuccess && (
                  <div className="py-4 flex flex-col md:flex-row gap-6 items-center md:items-start text-left">
                    {/* Left Column: Digital Receipt */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 bg-[#14F195]/15 text-[#14F195] border border-[#14F195]/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Reçu Blockchain Sécurisé
                        </div>
                        <h4 className="font-display font-black text-lg text-white">Paiement Validé !</h4>
                        <p className="text-[11px] text-white/50">
                          Votre transaction unique a été confirmée sur la blockchain.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 text-xs">
                        <div className="border-b border-white/10 pb-2.5">
                          <span className="text-[10px] text-white/40 block uppercase font-bold tracking-wider">Article Acheté</span>
                          <span className="font-bold text-white text-sm block mt-0.5">{selectedProduct.name}</span>
                          <span className="text-[10px] text-white/40 block mt-1 font-sans">Boutique : {selectedProduct.sellerName} • {selectedProduct.sellerLocation}</span>
                        </div>

                        <div className="border-b border-white/10 pb-2.5 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-white/50">Moyen de paiement :</span>
                            <span className={`font-mono font-bold ${paymentMethod === 'AMC' ? 'text-[#14F195]' : 'text-[#F27D26]'}`}>
                              {paymentMethod === 'AMC' ? 'AMC Wallet' : 'Mobile Money'}
                            </span>
                          </div>
                          {paymentMethod === 'AMC' ? (
                            <div className="flex justify-between">
                              <span className="text-white/50">Montant payé :</span>
                              <span className="font-mono text-[#14F195] font-extrabold">{selectedProduct.priceAmc} AMC</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white/50">Montant payé :</span>
                                <span className="font-mono text-white font-semibold">{(selectedProduct.priceCfa + calculateMobileMoneyFee(selectedProduct.priceCfa)).toLocaleString()} F CFA</span>
                              </div>
                              <div className="flex justify-between text-[#14F195] font-semibold">
                                <span>Cashback reçu :</span>
                                <span className="font-mono">+{(selectedProduct.priceCfa * 0.1).toFixed(1)} AMC</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between text-white/40">
                            <span>Horodatage :</span>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Niger (GMT+1)</span>
                          </div>
                          <div className="flex justify-between text-white/40 truncate gap-2">
                            <span>Hash Solana :</span>
                            <span className="font-semibold text-white/60 select-all">{checkoutTxHash.substring(0, 18)}...</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm text-center border-none"
                      >
                        Retourner au marché
                      </button>
                    </div>

                    {/* Right Column: Unique QR Code Digital Receipt */}
                    <div className="w-full max-w-[210px] bg-white text-black p-4.5 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl shrink-0 border-4 border-[#F27D26]">
                      <div className="text-[9px] uppercase tracking-widest font-black text-[#F27D26] mb-1 font-mono">
                        Amintchi Receipt
                      </div>
                      <p className="text-[9px] text-gray-500 font-sans mb-3.5 leading-tight">Scannez pour valider la livraison de l'article</p>

                      <div className="p-2.5 bg-white border border-gray-200 rounded-2xl mb-3.5 w-36 h-36 flex items-center justify-center">
                        <QRCode value={checkoutTxHash} size={130} />
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-xl px-2.5 py-1 w-full text-center">
                        <span className="font-mono text-[10px] font-bold text-[#E05206]">
                          REÇU # {checkoutTxHash.slice(3, 11)}
                        </span>
                      </div>
                      
                      <div className="text-[8px] text-gray-400 font-mono break-all line-clamp-2 mt-1.5 select-all">
                        {checkoutTxHash}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0c0c14]/90 backdrop-blur-xl border border-white/15 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-4 max-w-lg w-[calc(100%-2rem)]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-[#14F195]/10 p-2 rounded-lg text-[#14F195] hidden sm:block">
                <GitCompare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white font-display">
                  Comparateur ({compareList.length}/2)
                </p>
                <p className="text-[10px] text-white/50 truncate">
                  {compareList.length === 1
                    ? `Sélectionnez un autre produit pour comparer`
                    : `${compareList[0].name} vs ${compareList[1].name}`}
                </p>
              </div>
            </div>

            {/* Selected Thumbnails */}
            <div className="flex items-center gap-1.5">
              {compareList.map(p => (
                <div key={p.id} className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => handleToggleCompare(p, e)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 scale-75 cursor-pointer flex items-center justify-center w-3.5 h-3.5 text-[8px] font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {compareList.length < 2 && (
                <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs font-bold shrink-0">
                  +
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {compareList.length === 2 ? (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="bg-gradient-to-r from-[#F27D26] to-[#FFB347] hover:from-[#ff8e38] hover:to-[#ffc468] text-black font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md animate-pulse cursor-pointer whitespace-nowrap"
                >
                  Comparer
                </button>
              ) : (
                <button
                  disabled
                  className="bg-white/5 text-white/30 border border-white/10 text-xs px-4 py-2 rounded-xl cursor-not-allowed whitespace-nowrap"
                >
                  Comparer
                </button>
              )}
              <button
                onClick={() => setCompareList([])}
                className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                Vider
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Comparison Drawer / Modal */}
      <AnimatePresence>
        {isCompareModalOpen && compareList.length === 2 && (
          <div className="fixed inset-0 z-50 bg-[#050508]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c14]/95 border border-white/10 text-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col my-8"
            >
              {/* Header */}
              <div className="p-5 bg-black/40 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-[#14F195]/10 rounded-xl text-[#14F195]">
                    <Scale className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Comparatif Amintchi</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                      Analyse de prix & potentiel de récompenses AMC
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all font-mono text-xs font-semibold"
                >
                  Fermer ✕
                </button>
              </div>

              {/* Content Grid */}
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                
                {/* Product Headers */}
                <div className="grid grid-cols-2 gap-4">
                  {compareList.map((p, idx) => (
                    <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative group">
                      <div className="absolute top-2 left-2 bg-black/40 text-white/50 px-2 py-0.5 rounded-md text-[9px] font-mono">
                        Produit {idx + 1}
                      </div>
                      
                      <div className="w-24 h-24 rounded-xl overflow-hidden mb-3 border border-white/10 bg-black/20">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <h4 className="font-display font-bold text-xs text-white line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#F27D26]" /> {p.sellerLocation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Side-by-Side Comparison Metrics */}
                <div className="border border-white/10 rounded-2xl bg-black/20 overflow-hidden divide-y divide-white/5 text-xs">
                  
                  {/* Category */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-white/40 font-semibold text-[10px] uppercase">Catégorie</span>
                    <div className="text-center font-medium capitalize text-white/80">{compareList[0].category}</div>
                    <div className="text-center font-medium capitalize text-white/80">{compareList[1].category}</div>
                  </div>

                  {/* Rating */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-white/40 font-semibold text-[10px] uppercase">Évaluation</span>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-mono font-bold text-white">
                        {compareList[0].rating}
                      </span>
                      {compareList[0].rating > compareList[1].rating && (
                        <span className="text-[9px] px-1 bg-amber-400/10 text-amber-300 rounded font-semibold">Max</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-mono font-bold text-white">
                        {compareList[1].rating}
                      </span>
                      {compareList[1].rating > compareList[0].rating && (
                        <span className="text-[9px] px-1 bg-amber-400/10 text-amber-300 rounded font-semibold">Max</span>
                      )}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-white/40 font-semibold text-[10px] uppercase">Disponibilité</span>
                    <div className="text-center font-mono">
                      <span className={compareList[0].stock > 10 ? 'text-white/80' : 'text-red-400'}>{compareList[0].stock} en stock</span>
                    </div>
                    <div className="text-center font-mono">
                      <span className={compareList[1].stock > 10 ? 'text-white/80' : 'text-red-400'}>{compareList[1].stock} en stock</span>
                    </div>
                  </div>

                  {/* Price CFA */}
                  <div className="grid grid-cols-3 p-3 items-center bg-white/[0.01]">
                    <span className="text-white/40 font-semibold text-[10px] uppercase">Prix Standard (CFA)</span>
                    
                    <div className="text-center flex flex-col">
                      <span className="font-mono font-bold text-white text-sm">
                        {compareList[0].priceCfa.toLocaleString()} F CFA
                      </span>
                      {compareList[0].priceCfa < compareList[1].priceCfa ? (
                        <span className="text-[9px] text-[#14F195] font-semibold mt-0.5">
                          Moins cher (-{(compareList[1].priceCfa - compareList[0].priceCfa).toLocaleString()} F)
                        </span>
                      ) : compareList[0].priceCfa > compareList[1].priceCfa ? (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">
                          Plus cher (+{(compareList[0].priceCfa - compareList[1].priceCfa).toLocaleString()} F)
                        </span>
                      ) : (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">Même prix</span>
                      )}
                    </div>

                    <div className="text-center flex flex-col">
                      <span className="font-mono font-bold text-white text-sm">
                        {compareList[1].priceCfa.toLocaleString()} F CFA
                      </span>
                      {compareList[1].priceCfa < compareList[0].priceCfa ? (
                        <span className="text-[9px] text-[#14F195] font-semibold mt-0.5">
                          Moins cher (-{(compareList[0].priceCfa - compareList[1].priceCfa).toLocaleString()} F)
                        </span>
                      ) : compareList[1].priceCfa > compareList[0].priceCfa ? (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">
                          Plus cher (+{(compareList[1].priceCfa - compareList[0].priceCfa).toLocaleString()} F)
                        </span>
                      ) : (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">Même prix</span>
                      )}
                    </div>
                  </div>

                  {/* Price AMC */}
                  <div className="grid grid-cols-3 p-3 items-center bg-[#14F195]/[0.02]">
                    <span className="text-[#14F195] font-semibold text-[10px] uppercase flex items-center gap-0.5">
                      Prix Web3 (AMC)
                      <Zap className="w-2.5 h-2.5 fill-[#14F195]" />
                    </span>

                    <div className="text-center flex flex-col">
                      <span className="font-mono font-extrabold text-[#14F195] text-sm">
                        {compareList[0].priceAmc.toLocaleString()} AMC
                      </span>
                      {compareList[0].priceAmc < compareList[1].priceAmc ? (
                        <span className="text-[9px] text-[#14F195]/80 font-bold mt-0.5">
                          Économie max (-{(compareList[1].priceAmc - compareList[0].priceAmc).toLocaleString()} AMC)
                        </span>
                      ) : compareList[0].priceAmc > compareList[1].priceAmc ? (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">
                          +{(compareList[0].priceAmc - compareList[1].priceAmc).toLocaleString()} AMC
                        </span>
                      ) : (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">Même prix</span>
                      )}
                    </div>

                    <div className="text-center flex flex-col">
                      <span className="font-mono font-extrabold text-[#14F195] text-sm">
                        {compareList[1].priceAmc.toLocaleString()} AMC
                      </span>
                      {compareList[1].priceAmc < compareList[0].priceAmc ? (
                        <span className="text-[9px] text-[#14F195]/80 font-bold mt-0.5">
                          Économie max (-{(compareList[0].priceAmc - compareList[1].priceAmc).toLocaleString()} AMC)
                        </span>
                      ) : compareList[1].priceAmc > compareList[0].priceAmc ? (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">
                          +{(compareList[1].priceAmc - compareList[0].priceAmc).toLocaleString()} AMC
                        </span>
                      ) : (
                        <span className="text-[9px] text-white/30 font-medium mt-0.5">Même prix</span>
                      )}
                    </div>
                  </div>

                  {/* AMC Instant Saving */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-white/40 font-semibold text-[10px] uppercase">Remise direct AMC</span>
                    <div className="text-center">
                      <span className="font-mono font-bold text-amber-300">
                        -{(compareList[0].priceCfa - compareList[0].priceAmc).toLocaleString()} F CFA
                      </span>
                      <p className="text-[9px] text-white/40">Économisé en payant en AMC</p>
                    </div>
                    <div className="text-center">
                      <span className="font-mono font-bold text-amber-300">
                        -{(compareList[1].priceCfa - compareList[1].priceAmc).toLocaleString()} F CFA
                      </span>
                      <p className="text-[9px] text-white/40">Économisé en payant en AMC</p>
                    </div>
                  </div>

                  {/* Reward Potential (CFA purchase AMC cashback mining) */}
                  <div className="grid grid-cols-3 p-3 items-center bg-[#F27D26]/[0.03]">
                    <span className="text-[#F27D26] font-semibold text-[10px] uppercase flex items-center gap-0.5">
                      Cashback CFA (Mining)
                      <Sparkles className="w-2.5 h-2.5 text-[#F27D26]" />
                    </span>

                    <div className="text-center flex flex-col items-center">
                      <span className="font-mono font-bold text-[#F27D26] text-sm">
                        +{(compareList[0].priceCfa * 0.1).toLocaleString()} AMC
                      </span>
                      <p className="text-[9px] text-white/40 mt-0.5">Versé lors de l'achat en CFA</p>
                      {compareList[0].priceCfa > compareList[1].priceCfa && (
                        <span className="mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 rounded uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                          🏆 Plus gros minage
                        </span>
                      )}
                    </div>

                    <div className="text-center flex flex-col items-center">
                      <span className="font-mono font-bold text-[#F27D26] text-sm">
                        +{(compareList[1].priceCfa * 0.1).toLocaleString()} AMC
                      </span>
                      <p className="text-[9px] text-white/40 mt-0.5">Versé lors de l'achat en CFA</p>
                      {compareList[1].priceCfa > compareList[0].priceCfa && (
                        <span className="mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 rounded uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                          🏆 Plus gros minage
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vendeur */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-white/40 font-semibold text-[10px] uppercase">Vendeur</span>
                    <div className="text-center font-medium text-white/80">{compareList[0].sellerName}</div>
                    <div className="text-center font-medium text-white/80">{compareList[1].sellerName}</div>
                  </div>

                </div>

                {/* Dynamic Tokenomics & Decision Guidance */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2.5 text-xs text-white/80">
                  <h5 className="font-display font-bold text-white flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#F27D26]" />
                    Guide d'Achat Amintchi
                  </h5>
                  <div className="space-y-1.5 leading-relaxed text-[11px]">
                    <p>
                      💡 Si vous recherchez l'économie immédiate, privilégiez le paiement en AMC : 
                      <strong> {compareList[0].priceAmc < compareList[1].priceAmc ? compareList[0].name : compareList[1].name}</strong> vous permet d'économiser un maximum avec son prix réduit de 
                      <strong className="text-[#14F195]"> {Math.min(compareList[0].priceAmc, compareList[1].priceAmc).toLocaleString()} AMC</strong>.
                    </p>
                    <p>
                      🎁 Si vous souhaitez accumuler de la valeur future (Mining), achetez en CFA : 
                      <strong> {compareList[0].priceCfa > compareList[1].priceCfa ? compareList[0].name : compareList[1].name}</strong> possède le plus fort potentiel de minage avec une récompense cashback automatique de 
                      <strong className="text-[#F27D26]"> +{Math.max(compareList[0].priceCfa * 0.1, compareList[1].priceCfa * 0.1).toLocaleString()} AMC</strong> créditée directement sur votre adresse Solana.
                    </p>
                  </div>
                </div>

                {/* Direct Column Purchase Trigger Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsCompareModalOpen(false);
                        handleOpenCheckout(compareList[0], 'AMC');
                      }}
                      className="w-full bg-[#14F195] hover:bg-[#1dfa9f] text-black font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer border-none outline-hidden"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>Acheter (AMC)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCompareModalOpen(false);
                        handleOpenCheckout(compareList[0], 'CFA');
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer outline-hidden"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-white/70" />
                      <span>Acheter (CFA)</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsCompareModalOpen(false);
                        handleOpenCheckout(compareList[1], 'AMC');
                      }}
                      className="w-full bg-[#14F195] hover:bg-[#1dfa9f] text-black font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer border-none outline-hidden"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>Acheter (AMC)</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCompareModalOpen(false);
                        handleOpenCheckout(compareList[1], 'CFA');
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer outline-hidden"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-white/70" />
                      <span>Acheter (CFA)</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Immersive Shopping Cart & Receipt Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-[#050508]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-[0_0_50px_rgba(20,241,149,0.15)] flex flex-col my-8 max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-[#E05206] via-white/10 to-[#009A44] border-b border-white/10 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#009A44]/15 rounded-xl text-[#009A44] border border-[#009A44]/30">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm tracking-wide text-white uppercase">
                      Panier d'Achat Intelligent Amintchi
                    </h3>
                    <p className="text-[10px] text-white/60">
                      Rassemblez vos courses et payez en une fois sans frais intermédiaires
                    </p>
                  </div>
                </div>
                {!cartIsProcessing && (
                  <button
                    onClick={() => {
                      if (cartSuccess) {
                        setCart([]);
                        setCartSuccess(false);
                        setCartDeliveryAddress('');
                      }
                      setIsCartOpen(false);
                      setCartError(null);
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 transition-colors font-mono text-xs font-bold cursor-pointer"
                  >
                    Fermer ✕
                  </button>
                )}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartSuccess ? (
                  /* Success Screen - UNIQUE QR CODE RECEIPT */
                  <div className="py-6 flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
                    
                    {/* Receipt Details Box */}
                    <div className="flex-1 w-full space-y-4">
                      <div className="text-center md:text-left space-y-1">
                        <div className="inline-flex items-center gap-1.5 bg-[#009A44]/10 text-[#009A44] border border-[#009A44]/30 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Commande Validée sur la Blockchain
                        </div>
                        <h4 className="font-display font-black text-xl text-white pt-2">Merci pour vos achats !</h4>
                        <p className="text-xs text-white/50">
                          Votre reçu numérique unique a été généré sur Solana Mainnet.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
                        <div className="border-b border-white/10 pb-3">
                          <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px] text-white/40">Articles Commandés</h5>
                          <div className="space-y-2">
                            {cart.map(item => (
                              <div key={item.product.id} className="flex justify-between items-center text-xs">
                                <span className="text-white/80 font-medium truncate max-w-[200px]">
                                  {item.product.name} <strong className="text-[#F27D26] font-mono">x{item.quantity}</strong>
                                </span>
                                <span className="font-mono text-[#14F195] font-bold">
                                  {(item.product.priceAmc * item.quantity).toLocaleString()} AMC
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-b border-white/10 pb-3 space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-white/50">Lieu de Livraison:</span>
                            <span className="font-bold text-white">{cartDeliveryRegion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Adresse exacte:</span>
                            <span className="font-medium text-white/80 text-right">{cartDeliveryAddress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Délai estimé:</span>
                            <span className="font-semibold text-amber-400">24h à 72h max (Livreurs locaux)</span>
                          </div>
                        </div>

                        <div className="pt-2 space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/50">Montant des articles:</span>
                            <span className="text-white font-bold">{calculateCartTotalAmc().toLocaleString()} AMC</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Frais de livraison:</span>
                            <span className="text-white">{getDeliveryFeeAmc() > 0 ? `${getDeliveryFeeAmc()} AMC` : 'GRATUIT'}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
                            <span className="text-[#14F195] font-bold">Total Payé (AMC):</span>
                            <span className="text-[#14F195] font-black">
                              {(calculateCartTotalAmc() + getDeliveryFeeAmc()).toLocaleString()} AMC
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-white/30 pt-1.5 truncate">
                            <span>Tx Solana Hash:</span>
                            <span className="font-semibold select-all text-white/50">{cartTxHash}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center md:justify-start">
                        <button
                          type="button"
                          onClick={() => {
                            setCart([]);
                            setCartSuccess(false);
                            setCartDeliveryAddress('');
                            setIsCartOpen(false);
                          }}
                          className="bg-white hover:bg-neutral-200 text-black font-extrabold text-xs px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                        >
                          Fermer et retourner au marché
                        </button>
                      </div>
                    </div>

                    {/* Vector Smart QR Code Receipt */}
                    <div className="w-full max-w-xs bg-white text-black p-5 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl relative border-4 border-[#009A44]">
                      {/* Decorative elements representing Niger and Blockchain */}
                      <div className="absolute top-2 left-2 w-3 h-3 bg-[#E05206] rounded-full" />
                      <div className="absolute top-2 right-2 w-3 h-3 bg-[#009A44] rounded-full" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#009A44] rounded-full" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#E05206] rounded-full" />

                      <div className="text-[9px] uppercase tracking-widest font-black text-[#E05206] mb-1 font-mono">
                        Amintchi QR Receipt
                      </div>
                      <p className="text-[10px] text-gray-500 font-sans mb-3">Scannez pour valider à la livraison</p>

                      {/* Clean High-Tech Dynamic QR Code */}
                      <div className="p-3 bg-white border border-gray-200 rounded-2xl mb-4 w-44 h-44 flex items-center justify-center">
                        <QRCode value={cartTxHash} size={152} />
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5 mb-2 w-full text-center">
                        <span className="font-mono text-xs font-bold text-[#E05206]">
                          {calculateCartTotalAmc()} AMC PAYÉ
                        </span>
                      </div>
                      
                      <div className="text-[9px] text-gray-400 font-mono break-all line-clamp-2 select-all">
                        ID: {cartTxHash}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Normal Shopping Cart UI with dual Column split */
                  <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column: Cart items list */}
                    <div className="flex-1 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                        <span>Articles dans votre panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                      </h4>

                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {cart.map(item => (
                          <div
                            key={item.product.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center justify-between"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-white truncate">{item.product.name}</h5>
                              <p className="text-[10px] text-white/40 truncate">
                                Boutique : <strong className="text-white/70">{item.product.sellerName}</strong> • {item.product.sellerLocation}
                              </p>
                              <div className="text-[11px] font-mono font-bold text-[#14F195] mt-1">
                                {item.product.priceAmc.toLocaleString()} AMC <span className="text-white/30">/ unité</span>
                              </div>
                            </div>

                            {/* Quantity Adjustment Controls */}
                            <div className="flex items-center space-x-2.5 bg-black/40 border border-white/10 px-2 py-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                                className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white cursor-pointer transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-xs font-bold text-white text-center w-5">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                                className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white cursor-pointer transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Delete article */}
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="p-2 hover:bg-red-950/20 text-white/40 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                              title="Retirer l'article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Info on local shipping */}
                      <div className="bg-orange-950/15 border border-[#F27D26]/30 rounded-2xl p-4 flex items-start gap-3">
                        <Truck className="w-5 h-5 text-[#F27D26] shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <h6 className="text-xs font-bold text-white">Livraison Sécurisée Amintchi 🇳🇪</h6>
                          <p className="text-[10px] text-white/60 leading-relaxed">
                            Nos livreurs certifiés s'occupent d'acheminer vos commandes n'importe où au Niger en un délai record de <strong>24h à 72h maximum</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Checkout Pane */}
                    <div className="w-full lg:w-[360px] bg-black/40 border border-white/10 rounded-3xl p-5 space-y-4 flex flex-col justify-between self-start">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                          Détails de la Commande
                        </h4>

                        <div className="space-y-2 border-b border-white/10 pb-4 font-mono text-xs text-white/70">
                          <div className="flex justify-between">
                            <span>Prix Total Standard:</span>
                            <span className="line-through text-white/40">{calculateCartTotalCfa().toLocaleString()} CFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prix Total Amintchi:</span>
                            <span className="text-[#14F195] font-bold">{calculateCartTotalAmc().toLocaleString()} AMC</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Économie cumulée:</span>
                            <span className="text-[#F27D26] font-semibold">
                              -{(calculateCartTotalCfa() - (calculateCartTotalAmc() * 50)).toLocaleString()} F CFA
                            </span>
                          </div>
                        </div>

                        {/* Delivery configuration */}
                        <div className="pt-4 space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">Région du Niger</label>
                            <select
                              value={cartDeliveryRegion}
                              onChange={(e) => setCartDeliveryRegion(e.target.value)}
                              className="w-full bg-[#1c1c28] border border-white/10 rounded-xl px-3 py-2 text-xs outline-hidden text-white"
                            >
                              <option value="Niamey">Niamey (Capitale)</option>
                              <option value="Agadez">Agadez</option>
                              <option value="Diffa">Diffa</option>
                              <option value="Dosso">Dosso</option>
                              <option value="Maradi">Maradi</option>
                              <option value="Tahoua">Tahoua</option>
                              <option value="Tillabéri">Tillabéri</option>
                              <option value="Zinder">Zinder</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">Adresse de Livraison Exacte</label>
                            <textarea
                              placeholder="Quartier, avenue, n° de porte, contact..."
                              rows={2}
                              value={cartDeliveryAddress}
                              onChange={(e) => setCartDeliveryAddress(e.target.value)}
                              className="w-full bg-[#1c1c28] border border-white/10 focus:border-[#F27D26] rounded-xl px-3 py-2 text-xs outline-hidden text-white placeholder-white/20 resize-none"
                            />
                          </div>
                        </div>

                        {/* Total Pay details */}
                        <div className="pt-4 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/60">Frais de livraison:</span>
                            <span className="font-mono text-white font-semibold">
                              {getDeliveryFeeAmc() > 0 ? `${getDeliveryFeeAmc()} AMC` : 'GRATUIT'}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline border-t border-white/10 pt-2.5">
                            <span className="text-white font-extrabold uppercase text-[10px]">Net à Payer (AMC)</span>
                            <span className="font-mono text-base font-black text-[#14F195]">
                              {(calculateCartTotalAmc() + getDeliveryFeeAmc()).toLocaleString()} AMC
                            </span>
                          </div>
                          
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5 text-[11px] font-sans mt-2">
                            <div className="flex justify-between">
                              <span className="text-white/40">Solde de votre Portefeuille :</span>
                              <span className={`font-mono font-bold ${wallet.amcBalance >= (calculateCartTotalAmc() + getDeliveryFeeAmc()) ? 'text-[#14F195]' : 'text-red-400'}`}>
                                {wallet.amcBalance.toLocaleString()} AMC
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Frais réseau Solana :</span>
                              <span className="font-mono text-white/30">~0.0005 SOL</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Errors */}
                      {cartError && (
                        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-300 flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{cartError}</span>
                        </div>
                      )}

                      {/* Confirmation checkout Button */}
                      {cartIsProcessing ? (
                        <div className="py-2 flex flex-col items-center justify-center text-center space-y-2">
                          <div className="w-6 h-6 border-2 border-white/10 border-t-[#14F195] rounded-full animate-spin" />
                          <span className="text-[10px] text-white/50 font-medium">
                            {cartProcessingStep === 1 ? 'Signature de la transaction...' : 'Validation blocs Solana...'}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleConfirmCartPayment}
                          className="w-full bg-[#14F195] hover:bg-[#1dfa9f] text-black font-extrabold text-xs py-3 rounded-xl transition-all shadow-md hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer border-none outline-hidden"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirmer et Payer { (calculateCartTotalAmc() + getDeliveryFeeAmc()).toLocaleString() } AMC</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
