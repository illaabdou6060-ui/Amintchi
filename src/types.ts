/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'artisanat' | 'alimentation' | 'textile' | 'technologie' | 'autre';
  description: string;
  priceCfa: number;
  priceAmc: number; // Discounted (10% to 15% off) or direct price
  image: string;
  sellerName: string;
  sellerLocation: string; // e.g., "Niamey", "Agadez", "Zinder", "Maradi"
  rating: number;
  stock: number;
  shopName?: string; // Online boutique name
}

export interface UserAccount {
  lastName: string;
  firstName: string;
  age: number;
  gender: 'M' | 'F' | 'Autre';
  maritalStatus: string;
  region: 'Niamey' | 'Agadez' | 'Diffa' | 'Dosso' | 'Maradi' | 'Tahoua' | 'Tillabéri' | 'Zinder';
  idDocument: string; // ID Card or Passport
  username: string;
  email: string;
  phone: string;
  accountType: 'client' | 'revendeur';
  shopName?: string; // For sellers
  referralCodeUsed?: string;
  isRegistered200?: boolean; // Eligible for 20% discount
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type TransactionType = 'BUY' | 'SWAP' | 'SEND' | 'RECEIVE' | 'MINE';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amountCfa: number;
  amountAmc: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  txHash?: string; // Solana simulated transaction hash
  timestamp: string;
}

export interface WalletState {
  cfaBalance: number;
  amcBalance: number;
  solBalance: number; // For Solana gas fees simulation
  publicKey: string;  // SPL Wallet address
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface TokenomicsSection {
  name: string;
  percentage: number;
  amount: number;
  description: string;
  color: string;
}
