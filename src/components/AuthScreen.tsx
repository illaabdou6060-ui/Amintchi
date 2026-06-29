import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, User, Mail, Phone, Lock, Calendar, MapPin, 
  Sparkles, Camera, Mic, Fingerprint, Eye, EyeOff, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { UserAccount, WalletState } from '../types';

interface AuthScreenProps {
  onRegisterSuccess: (user: UserAccount, initialWallet: WalletState) => void;
}

const NIGER_REGIONS = [
  'Niamey', 'Agadez', 'Diffa', 'Dosso', 'Maradi', 'Tahoua', 'Tillabéri', 'Zinder'
];

export default function AuthScreen({ onRegisterSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [accountType, setAccountType] = useState<'client' | 'revendeur'>('client');
  
  // Registration Fields
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Autre'>('M');
  const [maritalStatus, setMaritalStatus] = useState('Célibataire');
  const [region, setRegion] = useState<string>('Niamey');
  const [idDocument, setIdDocument] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  
  // Captcha State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  
  // Biometrics simulation states
  const [fingerprintScanned, setFingerprintScanned] = useState(false);
  const [scanningFinger, setScanningFinger] = useState(false);
  const [facialVerified, setFacialVerified] = useState(false);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [voiceVerified, setVoiceVerified] = useState(false);
  const [verifyingVoice, setVerifyingVoice] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a simple math Captcha or alpha-numeric captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handler for finger scan
  const handleScanFingerprint = () => {
    setScanningFinger(true);
    setTimeout(() => {
      setScanningFinger(false);
      setFingerprintScanned(true);
    }, 2000);
  };

  // Handler for face scan
  const handleVerifyFace = () => {
    setVerifyingFace(true);
    setTimeout(() => {
      setVerifyingFace(false);
      setFacialVerified(true);
    }, 2500);
  };

  // Handler for voice scan
  const handleVerifyVoice = () => {
    setVerifyingVoice(true);
    setTimeout(() => {
      setVerifyingVoice(false);
      setVoiceVerified(true);
    }, 2500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form validations
    if (!lastName || !firstName || !age || !idDocument || !username || !email || !phone || !password) {
      setValidationError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (parseInt(age) < 18) {
      setValidationError('Vous devez avoir au moins 18 ans pour vous inscrire.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      setValidationError('Le code Captcha est incorrect.');
      generateCaptcha();
      return;
    }

    if (!fingerprintScanned) {
      setValidationError('Veuillez scanner votre empreinte digitale pour sécuriser le compte.');
      return;
    }

    if (accountType === 'revendeur') {
      if (!shopName) {
        setValidationError('Veuillez indiquer le nom de votre boutique en ligne.');
        return;
      }
      if (!facialVerified || !voiceVerified) {
        setValidationError('La vérification faciale et vocale est requise pour les revendeurs.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const isPromoApplied = promoCode.toUpperCase() === 'AMINTCHI';
      
      const user: UserAccount = {
        lastName,
        firstName,
        age: parseInt(age),
        gender,
        maritalStatus,
        region: region as any,
        idDocument,
        username,
        email,
        phone,
        accountType,
        shopName: accountType === 'revendeur' ? shopName : undefined,
        referralCodeUsed: referralCode || undefined,
        isRegistered200: isPromoApplied
      };

      setSuccessMessage('Inscription validée avec succès ! Bienvenue sur Amintchi Market.');
      
      setTimeout(() => {
        // Strict specification: "dès l'ouverture du compte il doit afficher le solde de 0 Amintchi Coin"
        const initialWallet: WalletState = {
          cfaBalance: 0,
          amcBalance: 0, // Strict 0 AMC on opening!
          solBalance: 0.0,
          publicKey: 'Am1n' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'SolanaR3seau'
        };
        onRegisterSuccess(user, initialWallet);
      }, 1500);

    }, 2000);
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username || !password) {
      setValidationError('Veuillez saisir votre nom d\'utilisateur et mot de passe.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Simulate login of existing user
      const user: UserAccount = {
        lastName: 'Boubacar',
        firstName: 'Ibrahim',
        age: 28,
        gender: 'M',
        maritalStatus: 'Marié',
        region: 'Niamey',
        idDocument: 'NGR-ID-9821-XP',
        username: username,
        email: `${username}@gmail.com`,
        phone: '+227 96 45 12 30',
        accountType: 'client'
      };

      const initialWallet: WalletState = {
        cfaBalance: 25000,
        amcBalance: 500, // Returning user with funds
        solBalance: 0.12,
        publicKey: 'Am1ntch1SPL5o1anaR3seauN1gerX79bC9v'
      };

      onRegisterSuccess(user, initialWallet);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050508] py-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Flag Aesthetics */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-[#E05206] blur-[150px]" />
        <div className="absolute top-1/3 bottom-1/3 left-0 right-0 bg-white blur-[150px]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#009A44] blur-[150px]" />
      </div>

      <div className="max-w-2xl w-full bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        {/* Banner with Niger Flag colors and Amintchi Market title */}
        <div className="p-6 bg-gradient-to-r from-[#E05206] via-[#FFFFFF]/10 to-[#009A44] text-white border-b border-white/10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 blur-xl pointer-events-none" />
          
          <div className="w-12 h-12 rounded-2xl bg-white text-black font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(224,82,6,0.5)] border-2 border-[#E05206]">
            A
          </div>
          
          <h2 className="font-display font-extrabold text-xl tracking-tight text-white uppercase">
            AMINTCHI <span className="text-[#E05206]">MARKET</span>
          </h2>
          <p className="text-xs text-white/80 font-medium mt-1">
            Le Premier Marché Intelligent du Niger 🇳🇪
          </p>
          <div className="inline-flex items-center gap-1 bg-black/40 border border-white/20 rounded-full px-3 py-0.5 text-[10px] uppercase font-mono mt-3">
            <span className="w-1.5 h-1.5 bg-[#009A44] rounded-full animate-ping" />
            Paiement 100% Amintchi Coin (AMC)
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-black/40 border-b border-white/10 p-1">
          <button
            onClick={() => { setIsLogin(false); setValidationError(null); }}
            className={`py-3 text-xs font-bold tracking-wider uppercase transition-all ${
              !isLogin ? 'text-[#E05206] border-b-2 border-[#E05206]' : 'text-white/40 hover:text-white'
            }`}
          >
            Créer un compte
          </button>
          <button
            onClick={() => { setIsLogin(true); setValidationError(null); }}
            className={`py-3 text-xs font-bold tracking-wider uppercase transition-all ${
              isLogin ? 'text-[#E05206] border-b-2 border-[#E05206]' : 'text-white/40 hover:text-white'
            }`}
          >
            Se connecter
          </button>
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {isLogin ? (
              /* LOGIN FORM */
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleMockLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Nom d'utilisateur</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: ibrahim227"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Saisissez votre mot de passe"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/20 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {validationError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#E05206] to-[#FF7F27] hover:from-[#ff6210] hover:to-[#ff9144] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </motion.form>
            ) : (
              /* REGISTER FORM */
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-6"
              >
                {/* Account Type Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-2 text-center">Type de compte</label>
                  <div className="grid grid-cols-2 gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => { setAccountType('client'); setValidationError(null); }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        accountType === 'client'
                          ? 'bg-gradient-to-r from-[#E05206] to-[#FF7F27] text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      🛍️ Compte Client
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAccountType('revendeur'); setValidationError(null); }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        accountType === 'revendeur'
                          ? 'bg-gradient-to-r from-[#009A44] to-[#22C55E] text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      🏪 Compte Revendeur
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-extrabold text-[#E05206] uppercase tracking-wider mb-4">
                    📋 Informations Personnelles
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Nom *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex: Oumarou"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Prénom *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: Fatouma"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Âge (Min 18 ans) *</label>
                      <input
                        type="number"
                        required
                        min="18"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Ex: 24"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Sexe *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                      >
                        <option value="M" className="bg-[#0c0c14]">Masculin</option>
                        <option value="F" className="bg-[#0c0c14]">Féminin</option>
                        <option value="Autre" className="bg-[#0c0c14]">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Situation Matrimoniale *</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                      >
                        <option value="Célibataire" className="bg-[#0c0c14]">Célibataire</option>
                        <option value="Marié(e)" className="bg-[#0c0c14]">Marié(e)</option>
                        <option value="Divorcé(e)" className="bg-[#0c0c14]">Divorcé(e)</option>
                        <option value="Veuf/Veuve" className="bg-[#0c0c14]">Veuf/Veuve</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Région du Niger *</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white outline-hidden"
                      >
                        {NIGER_REGIONS.map(r => (
                          <option key={r} value={r} className="bg-[#0c0c14]">{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Carte d'Identité Nationale ou Passeport *</label>
                      <input
                        type="text"
                        required
                        value={idDocument}
                        onChange={(e) => setIdDocument(e.target.value)}
                        placeholder="Ex: NGR-ID-12345678"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {accountType === 'revendeur' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-[#009A44]/30 pt-4"
                  >
                    <h3 className="text-xs font-extrabold text-[#009A44] uppercase tracking-wider mb-4">
                      🏪 Informations Revendeur (Boutique)
                    </h3>
                    <div>
                      <label className="block text-[10px] font-bold text-[#009A44] uppercase mb-1">Nom de votre Boutique en ligne *</label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="Ex: Niger Tech Store"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#009A44] focus:ring-1 focus:ring-[#009A44] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-hidden font-semibold"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-extrabold text-[#E05206] uppercase tracking-wider mb-4">
                    🔒 Identifiants de connexion
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Nom d'utilisateur (Identifiant) *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ex: fatouma227"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Adresse E-mail *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: fatouma@gmail.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Numéro de téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: +227 96 12 34 56"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden font-mono"
                      />
                    </div>

                    <div />

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Mot de passe *</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Saisissez un mot de passe fort"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Répétez le mot de passe *</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Parrainage & Promo code */}
                <div className="border-t border-white/5 pt-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    Offres d'Inscription & Parrainage
                  </h3>
                  <p className="text-[10px] text-white/50 mb-3">
                    Bénéficiez de 20% de réduction immédiate sur les abonnements de livraison en saisissant le code promo exclusif.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Code de Parrainage (Optionnel)</label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Ex: REF-8293"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Code Promo d'Inscription</label>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Entrez AMINTCHI"
                        className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden font-mono font-bold"
                      />
                      {promoCode.toUpperCase() === 'AMINTCHI' && (
                        <p className="text-[9px] text-amber-300 font-bold mt-1">
                          🎉 Code promo appliqué ! Réduction de 20% active.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Biometrics & Verification Panel */}
                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-extrabold text-white/80 uppercase tracking-wider mb-3">
                    🛡️ Sécurité & Vérification Biométrique
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Fingerprint */}
                    <div className="border border-white/10 bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Fingerprint className={`w-8 h-8 mb-2 ${fingerprintScanned ? 'text-[#009A44]' : 'text-white/40'}`} />
                      <span className="text-[10px] font-bold block text-white/70">Empreinte Digitale</span>
                      <button
                        type="button"
                        onClick={handleScanFingerprint}
                        disabled={scanningFinger || fingerprintScanned}
                        className={`mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border outline-hidden ${
                          fingerprintScanned 
                            ? 'bg-[#009A44]/10 border-[#009A44]/30 text-[#009A44]'
                            : 'bg-[#E05206]/10 hover:bg-[#E05206]/20 border-[#E05206]/30 text-[#E05206] cursor-pointer'
                        }`}
                      >
                        {scanningFinger ? 'Numérisation...' : fingerprintScanned ? '✓ Enregistrée' : 'Scanner'}
                      </button>
                    </div>

                    {/* Facial scan (For Revendeurs) */}
                    <div className={`border border-white/10 bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center ${accountType === 'client' && 'opacity-40'}`}>
                      <Camera className={`w-8 h-8 mb-2 ${facialVerified ? 'text-[#009A44]' : 'text-white/40'}`} />
                      <span className="text-[10px] font-bold block text-white/70">Reconnaissance Faciale</span>
                      <button
                        type="button"
                        onClick={handleVerifyFace}
                        disabled={accountType === 'client' || verifyingFace || facialVerified}
                        className={`mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border outline-hidden ${
                          facialVerified 
                            ? 'bg-[#009A44]/10 border-[#009A44]/30 text-[#009A44]'
                            : accountType === 'client'
                              ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                              : 'bg-[#009A44]/10 hover:bg-[#009A44]/20 border-[#009A44]/30 text-[#009A44] cursor-pointer'
                        }`}
                      >
                        {verifyingFace ? 'Analyse...' : facialVerified ? '✓ Vérifiée' : accountType === 'client' ? 'Non requise' : 'Capturer'}
                      </button>
                    </div>

                    {/* Voice check (For Revendeurs) */}
                    <div className={`border border-white/10 bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center ${accountType === 'client' && 'opacity-40'}`}>
                      <Mic className={`w-8 h-8 mb-2 ${voiceVerified ? 'text-[#009A44]' : 'text-white/40'}`} />
                      <span className="text-[10px] font-bold block text-white/70">Identification Vocale</span>
                      <button
                        type="button"
                        onClick={handleVerifyVoice}
                        disabled={accountType === 'client' || verifyingVoice || voiceVerified}
                        className={`mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border outline-hidden ${
                          voiceVerified 
                            ? 'bg-[#009A44]/10 border-[#009A44]/30 text-[#009A44]'
                            : accountType === 'client'
                              ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                              : 'bg-[#009A44]/10 hover:bg-[#009A44]/20 border-[#009A44]/30 text-[#009A44] cursor-pointer'
                        }`}
                      >
                        {verifyingVoice ? 'Enregistrement...' : voiceVerified ? '✓ Identifié' : accountType === 'client' ? 'Non requise' : 'Enregistrer'}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Security Captcha */}
                <div className="border-t border-white/5 pt-4">
                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-2">Sécurité Anti-Robot (Captcha) *</label>
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="px-4 py-2 bg-gradient-to-r from-neutral-800 to-neutral-900 text-amber-400 font-mono text-sm tracking-widest font-extrabold rounded-xl border border-white/10 italic select-none line-through">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all"
                      title="Nouveau captcha"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Recopiez le code"
                      className="flex-1 bg-white/5 border border-white/10 focus:border-[#E05206] focus:ring-1 focus:ring-[#E05206] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-hidden"
                    />
                  </div>
                </div>

                {validationError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-[#009A44]/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#009A44] shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#E05206] via-[#FF7F27] to-[#009A44] hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Validation du Compte en cours...</span>
                    </>
                  ) : (
                    <span>Valider et ouvrir mon compte</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
