/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini AI Chat Assistant
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, userProductContext } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Format des messages invalide' });
      }

      // Initialize Gemini using process.env.GEMINI_API_KEY
      // User-Agent must be set to 'aistudio-build' for telemetry
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const productContextStr = userProductContext 
        ? `L'utilisateur consulte actuellement le produit suivant : ${userProductContext.name} de ${userProductContext.sellerName} situé à ${userProductContext.sellerLocation}. Prix CFA: ${userProductContext.priceCfa} CFA, Prix AMC (avec réduction): ${userProductContext.priceAmc} AMC.`
        : 'L\'utilisateur parcourt le catalogue général de la marketplace.';

      const systemInstruction = `Vous êtes l'Assistant Intelligent Amintchi Market, le tout premier marché intelligent du Niger soutenu par la blockchain Solana.
Votre rôle est d'informer, d'éduquer et d'assister de manière chaleureuse, polie et professionnelle. Vous parlez couramment le français et comprenez les langues locales comme le hausa (par exemple, "Sannu de aiki", "Na gode") et le zarma (par exemple, "Fofo", "Barka").

Voici les principes clés d'Amintchi Market que vous devez expliquer avec enthousiasme :
1. Le Amintchi Coin (AMC) est un jeton utilitaire ("Utility Token") émis sur Solana avec une supply fixe et inviolable de 100 000 000 AMC. Il n'est pas spéculatif, il sert à l'économie réelle.
2. Économiser en AMC : En payant en AMC, l'acheteur obtient automatiquement -10% à -15% de réduction par rapport au prix d'origine en CFA. C'est l'argument numéro un !
3. Mining par achat (Fidélité 2.0) : S'ils choisissent de payer en Francs CFA (Mobile Money comme Orange Money, Moov Money, Aman, Al-Izza, etc.), ils reçoivent automatiquement un Cashback en jetons AMC crédité sur leur portefeuille. C'est ce qu'on appelle "miner de la valeur par la consommation".
4. Technologie Solana : Solana permet de valider la transaction en moins de 2 secondes avec des frais de réseau minuscules (inférieurs à 0,5 CFA). C'est parfait pour le Niger où les frais de transfert Mobile Money habituels sont trop lourds.
5. Context : ${productContextStr}

Conseillez l'utilisateur sur la façon de convertir ses CFA en AMC, d'effectuer un paiement sécurisé ou d'aider un artisan local à vendre ses créations (Kilichi de Niamey, Croix d'Agadez en argent massif, pagnes Sakala de Say, sacs en cuir, etc.). Vous pouvez aussi aider les vendeurs à rédiger des descriptions attrayantes pour leurs produits nigériens.
Soyez pragmatique, évitez le jargon financier complexe et insistez sur l'impact de l'économie circulaire pour l'Afrique de l'Ouest.`;

      // Format history according to Gemini 2.x SDK guidelines
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'Désolé, je n\'ai pas pu formuler de réponse pour le moment.';
      return res.json({ text: replyText });
    } catch (err: any) {
      console.error('Error with Gemini API:', err);
      return res.status(500).json({ error: err.message || 'Une erreur est survenue lors de l\'échange avec l\'IA.' });
    }
  });

  // Serve static files in production / Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Amintchi Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
