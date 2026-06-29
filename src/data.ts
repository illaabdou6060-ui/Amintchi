/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, TokenomicsSection } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Kilichi Super Fin (Niamey)',
    category: 'alimentation',
    description: 'Bœuf séché traditionnel du Niger préparé avec des épices fines, de la pâte d\'arachide et séché au soleil de Niamey. Croustillant et savoureux.',
    priceCfa: 5000,
    priceAmc: 4250, // 15% discount
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', // Spiced dried meat style image
    sellerName: 'Maison du Kilichi Amadou',
    sellerLocation: 'Niamey, Boukoki',
    rating: 4.9,
    stock: 120
  },
  {
    id: 'prod-2',
    name: 'Véritable Croix d\'Agadez en Argent',
    category: 'artisanat',
    description: 'Bijou traditionnel touareg forgé à la main en argent massif (925) par un artisan d\'Agadez. Symbole ancestral de protection et d\'orientation.',
    priceCfa: 35000,
    priceAmc: 29750, // 15% discount
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80', // Elegant silver pendant/jewelry
    sellerName: 'Coopérative d\'Artisans de l\'Aïr',
    sellerLocation: 'Agadez, Centre Historique',
    rating: 5.0,
    stock: 15
  },
  {
    id: 'prod-3',
    name: 'Pagne Tissey Traditionnel "Sakala"',
    category: 'textile',
    description: 'Tissu traditionnel nigérien de haute qualité, tissé à la main fil par fil par les maîtres tisserands de Say. Parfait pour les grandes cérémonies.',
    priceCfa: 25000,
    priceAmc: 21250, // 15% discount
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80', // High texture textile / woven fabric
    sellerName: 'Mère Fati Tissage',
    sellerLocation: 'Say',
    rating: 4.8,
    stock: 22
  },
  {
    id: 'prod-4',
    name: 'Sac en Cuir d\'Agadez Brodé',
    category: 'artisanat',
    description: 'Sac en cuir de chèvre de haute qualité, tanné de manière naturelle et richement brodé de motifs géométriques touaregs traditionnels.',
    priceCfa: 18000,
    priceAmc: 16200, // 10% discount
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80', // Handcrafted leather bag
    sellerName: 'Atelier de Maroquinerie d\'Agadez',
    sellerLocation: 'Agadez',
    rating: 4.7,
    stock: 8
  },
  {
    id: 'prod-5',
    name: 'Huile de Sésame Pressée à Froid (Maradi)',
    category: 'alimentation',
    description: 'Huile de sésame 100% naturelle et biologique, extraite à froid à Maradi. Riche en nutriments, idéale pour la cuisine ou les soins corporels.',
    priceCfa: 4000,
    priceAmc: 3600, // 10% discount
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', // Organic oil in bottle
    sellerName: 'Huilerie Équitable du Katsina',
    sellerLocation: 'Maradi',
    rating: 4.6,
    stock: 80
  },
  {
    id: 'prod-6',
    name: 'Guetta d\'Agadez (Chaussures en Cuir)',
    category: 'textile',
    description: 'Sandales en cuir traditionnelles des nomades du Sahara, réputées pour leur durabilité incroyable et leur confort lors de longues marches.',
    priceCfa: 12000,
    priceAmc: 10200, // 15% discount
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', // Leather sandals
    sellerName: 'Sidi Chaussures du Désert',
    sellerLocation: 'Zinder, Quartier Birni',
    rating: 4.9,
    stock: 30
  }
];

export const TOKENOMICS_SECTIONS: TokenomicsSection[] = [
  {
    name: 'Récompenses Communautaires (Mining)',
    percentage: 40,
    amount: 40000000,
    description: 'Réservé au mining par achat et fidélité. Distribué progressivement sur 5 à 10 ans aux acheteurs, vendeurs et livreurs actifs sous forme de cashback ou primes de service.',
    color: '#059669' // Emerald Green
  },
  {
    name: 'Vente Initiale & Liquidité',
    percentage: 20,
    amount: 20000000,
    description: 'Mis en circulation pour le lancement public et pour fournir de la liquidité sur les plateformes d\'échange (DEX) comme Orca ou Raydium sur Solana.',
    color: '#D97706' // Amber Gold
  },
  {
    name: 'Trésorerie du Projet',
    percentage: 20,
    amount: 20000000,
    description: 'Destiné au financement du développement technique continu, à la maintenance des serveurs cloud, à l\'infrastructure blockchain, et aux campagnes marketing.',
    color: '#2563EB' // Royal Blue
  },
  {
    name: 'Équipe Fondatrice',
    percentage: 20,
    amount: 20000000,
    description: 'Attribué aux créateurs et contributeurs initiaux. Entièrement bloqué par contrat intelligent (Smart Contract) pendant 1 an, puis libéré mensuellement de façon linéaire sur 2 ans.',
    color: '#DC2626' // Red
  }
];

export const WHITEPAPER_SECTIONS = [
  {
    id: 'intro',
    title: '1. Introduction & Vision',
    content: `Le commerce électronique en Afrique de l'Ouest, et spécifiquement au Niger, souffre de trois maux majeurs : le manque de confiance, les frais de transaction élevés et surtout la très faible bancarisation de la population.

Amintchi Market n'est pas simplement une boutique en ligne de plus. C'est un écosystème hybride de nouvelle génération qui fusionne la simplicité d'utilisation du e-commerce classique avec la puissance de la technologie Blockchain. Son but ultime est de récompenser équitablement chaque acteur de la chaîne de valeur : le vendeur local, l'acheteur, le livreur et le mineur de réseau.

Notre mission fondamentale : Créer une économie circulaire inclusive au Niger où la valeur circule librement, instantanément, en toute confiance et à moindre coût.`
  },
  {
    id: 'problem',
    title: '2. Le Problème',
    content: `Actuellement, pour un entrepreneur, un artisan ou un consommateur au Niger, se lancer dans le commerce numérique relève du parcours du combattant :

• Frais de transaction exorbitants : Les services de Mobile Money ou bancaires traditionnels prélèvent des commissions importantes sur chaque vente, rognant les marges déjà faibles des petits artisans et commerçants.
• Fidélité inexistante : La relation client est purement transactionnelle. Un client régulier qui achète de nombreuses fois n'est jamais récompensé de sa fidélité à la plateforme, ce qui freine la rétention.
• Barrières à l'entrée technologiques : Les petits vendeurs locaux n'ont pas accès aux systèmes de paiement internationaux et sont souvent exclus de l'économie numérique mondiale.`
  },
  {
    id: 'solution',
    title: '3. La Solution : L\'Écosystème Amintchi',
    content: `Amintchi Market apporte une réponse pragmatique et innovante à travers sa place de marché hybride intégrée avec son propre actif numérique : le Amintchi Coin (AMC).

Contrairement aux cryptomonnaies purement spéculatives, l'Amintchi Coin est un "Utility Token" (Jeton Utilitaire) ancré dans l'économie réelle :

• Réduction Directe : Payer en jetons AMC offre automatiquement une réduction immédiate de -10% à -15% sur tous les articles de la plateforme (par rapport au prix affiché en Francs CFA).
• Fidélité 2.0 (Cashback & Mining) : Chaque transaction effectuée en monnaie fiduciaire (CFA / Mobile Money) génère automatiquement un cashback en jetons AMC, directement crédité dans le portefeuille de l'acheteur. C'est du "Mining par l'achat" !
• Rapidité Inégalée : Les règlements et transferts en AMC s'effectuent de pair-à-pair et sont validés en moins de 2 secondes avec des frais de réseau presque inexistants.`
  },
  {
    id: 'tech',
    title: '4. Technologie & Sécurité',
    content: `Pour garantir un service sécurisé, ultra-rapide et économique, Amintchi Market s'appuie sur des standards d'excellence technologiques mondiaux :

• Blockchain Solana (SOL) : Choisie pour ses performances de pointe, sa capacité de traitement de plus de 65 000 transactions par seconde (TPS) et ses frais infimes (inférieurs à 0.5 CFA par transaction). C'est l'outil parfait pour les micro-paiements quotidiens au Niger.
• Standard SPL Token : Le jeton AMC est émis selon la norme technique SPL de Solana. Cela garantit une interopérabilité immédiate et totale avec l'écosystème crypto mondial (portefeuilles d'actifs numériques Phantom, Solflare, Trust Wallet ou sur les grandes plateformes d'échange).`
  },
  {
    id: 'tokenomics',
    title: '5. Tokenomics (Économie du Jeton)',
    content: `L'économie du jeton AMC est conçue de manière mathématique et transparente pour assurer sa rareté, sa viabilité à long terme et un alignement parfait des intérêts de tous les participants :

• Nom de l'actif : Amintchi Coin
• Symbole : AMC
• Offre totale maximale (Supply) : 100 000 000 AMC (Fixe, sans aucune possibilité d'inflation ou d'impression supplémentaire).

La répartition s'établit de façon équilibrée :
• 40% - Récompenses Communautaires (Mining d'achat) : Distribués aux utilisateurs sur 5 à 10 ans pour soutenir la croissance organique de l'écosystème.
• 20% - Trésorerie du Projet : Consacrés au marketing, aux serveurs, à la sécurité et à l'innovation technologique.
• 20% - Équipe Fondatrice : Bloqués intégralement par Smart Contract pendant 12 mois pour attester du sérieux des fondateurs, puis libérés progressivement de façon linéaire.
• 20% - Vente Initiale / Pool de Liquidité : Mis sur le marché pour établir un cours de départ et assurer la liquidité d'échange.`
  }
];

export const ROADMAP_STEPS = [
  {
    phase: 'Phase 1',
    title: 'Fondation & Lancement CFA',
    timeframe: 'Mois 1 - 3',
    status: 'completed',
    details: [
      'Conception et développement de la plateforme e-commerce Amintchi Market.',
      'Recrutement et formation de la première cohorte d\'artisans et commerçants locaux à Niamey.',
      'Création et déploiement technique du Token Amintchi Coin (AMC) sur la Blockchain Solana.'
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Intégration Hybride & Portefeuille',
    timeframe: 'Mois 4 - 6',
    status: 'current',
    details: [
      'Intégration d\'un portefeuille numérique sécurisé directement sur la plateforme web.',
      'Activation du protocole de Mining par l\'achat : versement automatique de Cashback en AMC lors de paiements en CFA/Mobile Money.',
      'Mise en place d\'un outil de transfert pair-à-pair rapide pour les marchands.'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'Paiement Web3 & Expansion DEX',
    timeframe: 'Mois 6+',
    status: 'upcoming',
    details: [
      'Activation des passerelles de paiement 100% Amintchi Coin (AMC) avec réduction automatique de 15%.',
      'Listing officiel du jeton AMC sur les plateformes décentralisées (DEX) de Solana pour permettre la conversion directe en Dollars/USDT.',
      'Expansion de l\'écosystème de livraison Amintchi Express à Zinder, Maradi et Agadez.'
    ]
  }
];
