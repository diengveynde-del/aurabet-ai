AURABET AI 🌍✨

Application React + Tailwind au style Afrofuturiste pour les paris sportifs assistés par l'intelligence artificielle.

🚀 Stack Technique

Frontend : React + Vite

Design : Tailwind CSS (Glassmorphism & Vibranium Animations)

Icônes : Lucide React

Backend : Firebase Auth (Google + Mobile) & Firestore

Tests UI : Playwright

✨ Fonctionnalités

Dashboard Aura Score : Suivi dynamique de votre score de parieur.

Grille Live CAF / EPL : Cotes évolutives en temps réel via widget.

Aura Advisor : Algorithme prédictif avec indice de confiance (%) recalculé en continu.

Wallet Multi-devises : Support complet pour XOF, GNF et USDT.

Paiements Mobiles : Simulation d'Orange Money et Wave.

📂 Structure des Données (Firestore)

Le projet respecte la hiérarchie suivante pour la persistance :

Public : /artifacts/{appId}/public/data/global_stats

Privé : /artifacts/{appId}/users/{userId}/private/profile

🛠 Installation et Développement Local

Installation :

npm install


Configuration :
Copier .env.example vers .env et renseigner les valeurs Firebase.

Lancement :

npm run dev


🧪 Validation et Tests

Vérification de syntaxe

Pour éviter les erreurs Vercel (Unexpected token '/'), assurez-vous que package.json ne contient aucun commentaire :

node scripts/check-package-json.mjs


Capture UI Afrofuturiste (Playwright)

Générez une capture d'écran haute définition du tableau de bord :

# Utilise DEPLOYMENT_URL si défini, sinon [https://aurabet-ai.vercel.app](https://aurabet-ai.vercel.app)
node scripts/capture-afrofuturism.mjs


🤖 CI/CD

Workflow CI : .github/workflows/ci.yml (Validation PR et syntaxe).

Déploiement : Déclenchement automatique vers GitHub Pages ou Vercel sur push vers main.

Note : Si vous rencontrez des erreurs de proxy lors de l'installation, utilisez : env -u http_proxy -u https_proxy npm install.