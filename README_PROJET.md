# 🚀 PayQr — Frontend Web Dashboard

> **Plateforme de paiement par QR Code** — Interface Web React pour la gestion des paiements MTN Mobile Money et Orange Money au Cameroun.

---

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Technologies](#technologies)
3. [Installation](#installation)
4. [Structure des fichiers](#structure-des-fichiers)
5. [Modules et fonctionnalités](#modules-et-fonctionnalités)
6. [Composants UI](#composants-ui)
7. [Endpoints API consommés](#endpoints-api-consommés)
8. [Thème et Design System](#thème-et-design-system)

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │Dashboard │  │ Clients  │  │ Vendeurs │      │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │              │              │              │            │
│  ┌────┴──────────────┴──────────────┴──────────────┴─────┐    │
│  │              API Layer (Axios + JWT Interceptors)       │    │
│  └──────────────────────────┬─────────────────────────────┘    │
└─────────────────────────────┼──────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│   Backend API (Spring Boot)                                     │
│   https://backend-qr-code-u2kx.onrender.com                    │
│                                                                 │
│   Auth │ QR Code │ Payments │ Client │ Vendeur │ Webhook        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies

| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 19.x | UI Framework |
| **Vite** | 8.x | Build Tool & Dev Server |
| **Tailwind CSS** | 4.x | Styling (via PostCSS) |
| **React Router DOM** | 7.x | Navigation SPA |
| **Axios** | 1.x | HTTP Client + Interceptors JWT |
| **Recharts** | 2.x | Graphiques de transactions |
| **Lucide React** | — | Icônes modernes |
| **React Hot Toast** | — | Notifications toast |
| **QRCode.react** | — | Génération de QR codes SVG |

---

## 📦 Installation

```bash
# 1. Cloner le projet
cd FrontendWeb-qr-code

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir dans le navigateur
http://localhost:5173
```

> ⚠️ **Si `npm` ne fonctionne pas dans PowerShell**, utilisez :
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Ou lancez les commandes avec `cmd /c npm run dev`

---

## 📁 Structure des fichiers

```
src/
├── api/                          # Couche d'accès API
│   ├── axios.js                  # Instance Axios + intercepteurs JWT
│   ├── authService.js            # Service d'authentification
│   ├── clientService.js          # Service client (solde, transactions)
│   ├── vendeurService.js         # Service vendeur (solde, retraits)
│   ├── qrCodeService.js          # Service QR Code (CRUD)
│   └── paymentService.js         # Service paiements
│
├── components/
│   ├── common/                   # Composants UI réutilisables
│   │   ├── Badge.jsx             # Badge de statut coloré
│   │   ├── Button.jsx            # Bouton avec variantes
│   │   ├── Card.jsx              # Carte avec ombre
│   │   ├── EmptyState.jsx        # État vide
│   │   ├── Input.jsx             # Input avec label et icône
│   │   ├── Loader.jsx            # Spinner de chargement
│   │   ├── Modal.jsx             # Modale avec overlay
│   │   ├── StatCard.jsx          # Carte de statistique
│   │   └── ThemeToggle.jsx       # Toggle dark/light mode
│   └── layout/
│       ├── AuthLayout.jsx        # Layout split-screen (login/register)
│       └── DashboardLayout.jsx   # Layout dashboard (sidebar + header)
│
├── context/
│   ├── AuthContext.jsx           # Contexte d'authentification
│   └── ThemeContext.jsx          # Contexte de thème
│
├── hooks/
│   ├── useAuth.js                # Hook d'authentification
│   └── useTheme.js               # Hook de thème
│
├── modules/
│   ├── auth/
│   │   ├── LoginPage.jsx         # Page de connexion
│   │   ├── RegisterPage.jsx      # Page d'inscription
│   │   ├── ForgotPasswordPage.jsx# Mot de passe oublié
│   │   └── ResetPasswordPage.jsx # Réinitialisation
│   ├── dashboard/
│   │   └── DashboardPage.jsx     # Dashboard principal
│   ├── clients/
│   │   └── ClientDashboard.jsx   # Espace client
│   ├── vendeurs/
│   │   ├── VendeurDashboard.jsx  # Espace vendeur
│   │   └── GenerateQrPage.jsx    # Génération de QR code
│   └── payments/
│       ├── PaymentPage.jsx       # Effectuer un paiement
│       └── PaymentStatusPage.jsx # Suivi de paiement
│
├── utils/
│   ├── constants.js              # Constantes (API URL, opérateurs, etc.)
│   └── formatters.js             # Formateurs (monnaie, date, etc.)
│
├── App.jsx                       # Routes et configuration
├── main.jsx                      # Point d'entrée
└── index.css                     # Thème Tailwind + animations
```

---

## 📱 Modules et fonctionnalités

### 🔐 Module Auth (`/src/modules/auth/`)

| Page | Route | Fonctionnalité |
|------|-------|----------------|
| LoginPage | `/login` | Connexion email/password avec JWT |
| RegisterPage | `/register` | Inscription Client ou Vendeur (toggle) |
| ForgotPasswordPage | `/forgot-password` | Envoi de code de réinitialisation |
| ResetPasswordPage | `/reset-password` | Saisie code 6 chiffres + nouveau mot de passe |

**Caractéristiques :**
- Layout split-screen inspiré AangaraaPay
- Toggle Client/Vendeur avec champs dynamiques
- Validation côté client
- Gestion d'erreurs avec toast notifications

---

### 📊 Module Dashboard (`/src/modules/dashboard/`)

| Composant | Fonctionnalité |
|-----------|----------------|
| StatCards | 4 cartes : Solde, Transactions, QR/Paiements, Taux de succès |
| AreaChart | Graphique des transactions sur 7 jours (Recharts) |
| Recent Transactions | Liste des 5 dernières transactions |

**Caractéristiques :**
- Adaptatif selon le rôle (CLIENT/VENDEUR)
- Animations staggerées au chargement
- Données temps réel depuis le backend

---

### 👤 Module Clients (`/src/modules/clients/`)

| Composant | Fonctionnalité |
|-----------|----------------|
| Balance Card | Affichage du solde avec gradient bleu |
| Transaction History | Tableau paginé avec filtre |
| Recharge Modal | Recharge via Orange Money / MTN MoMo |

---

### 🏪 Module Vendeurs (`/src/modules/vendeurs/`)

| Composant | Fonctionnalité |
|-----------|----------------|
| Balance Card | Solde avec gradient orange |
| QR Code Grid | Grille des QR codes (actif/utilisé) |
| Generate QR | Formulaire produits dynamique + aperçu QR |
| Withdrawal Modal | Retrait via Orange Money / MTN MoMo |

---

### 💳 Module Payments (`/src/modules/payments/`)

| Composant | Fonctionnalité |
|-----------|----------------|
| PaymentPage | 3 étapes : Scan QR → Choisir mode → Confirmer |
| PaymentStatusPage | Suivi en temps réel (polling 3s) |

**Modes de paiement :**
- **Solde Virtuel** : Paiement instantané
- **Mobile Money** : Orange Money / MTN MoMo via Aangaraa Pay

---

## 🎨 Composants UI

| Composant | Description | Variantes |
|-----------|-------------|-----------|
| `Button` | Bouton avec icône et loading | primary, secondary, orange, yellow, danger, ghost |
| `Input` | Champ avec label, icône, toggle password | text, email, password, number, date |
| `Card` | Carte avec ombre et hover | padding, hover |
| `StatCard` | Statistique avec tendance | primary, orange, yellow, success, danger |
| `Modal` | Modale avec backdrop blur | sm, md, lg, xl |
| `Badge` | Statut coloré | SUCCESS, PENDING, FAILED, EXPIRED, ACTIVE |
| `ThemeToggle` | Toggle dark/light avec animation | — |
| `Loader` | Spinner animé | sm, md, lg |
| `EmptyState` | État vide avec illustration | — |

---

## 🔌 Endpoints API consommés

**Base URL** : `https://backend-qr-code-u2kx.onrender.com`

### Auth

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/login` | POST | ❌ | Connexion |
| `/api/auth/register/client` | POST | ❌ | Inscription client |
| `/api/auth/register/vendeur` | POST | ❌ | Inscription vendeur |
| `/api/auth/me` | GET | ✅ JWT | Infos utilisateur connecté |
| `/api/auth/forgot-password` | POST | ❌ | Demande réinitialisation |
| `/api/auth/reset-password` | POST | ❌ | Réinitialisation mot de passe |

### QR Code

| Endpoint | Méthode | Auth | Rôle | Description |
|----------|---------|------|------|-------------|
| `/api/qr/generate` | POST | ✅ | VENDEUR | Générer un QR code |
| `/api/qr/my-qrs` | GET | ✅ | VENDEUR | Liste des QR codes |
| `/api/qr/validate/{id}` | GET | ✅ | ANY | Valider un QR code |
| `/api/qr/mark-as-used/{id}` | PUT | ✅ | VENDEUR | Marquer QR comme utilisé |

### Paiements

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/payments/initiate` | POST | ✅ | Initier paiement Aangaraa |
| `/api/payments/virtual` | POST | ✅ | Paiement par solde virtuel |
| `/api/payments/status/{id}` | GET | ✅ | Statut paiement (Aangaraa) |
| `/api/payments/status/local/{id}` | GET | ✅ | Statut local |

### Client

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/client/solde` | GET | ✅ | Solde du client |
| `/api/client/transactions` | GET | ✅ | Historique (paginé) |
| `/api/client/recharger` | POST | ✅ | Recharger le solde |

### Vendeur

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/vendeur/solde` | GET | ✅ | Solde du vendeur |
| `/api/vendeur/transactions` | GET | ✅ | Historique des ventes |
| `/api/vendeur/retraits` | POST | ✅ | Demander un retrait |

---

## 🎨 Thème et Design System

### Palette de couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| 🔵 Bleu | `#3B82F6` | Couleur principale |
| 🟠 Orange | `#EA580C` | Style Orange Money |
| 🟡 Jaune | `#EAB308` | Style MTN MoMo |
| 🟢 Vert | `#10B981` | Succès |
| 🔴 Rouge | `#EF4444` | Erreur |
| ⬜ Blanc | `#F8FAFC` | Fond clair |
| ⬛ Sombre | `#0F172A` | Fond sombre |

### Mode Sombre

- Toggle via icône soleil/lune dans le header
- Classe `dark` sur `<html>`
- Persistance dans `localStorage`
- Transition fluide (0.3s)

### Animations

- `animate-fade-in` : Apparition avec translation
- `animate-slide-left` / `animate-slide-right` : Slide latéral
- `animate-scale-in` : Scale pour modales
- `animate-pulse-glow` : Effet lumineux pulsant
- Stagger delays pour les stat cards

### Glassmorphism

- Header avec `backdrop-blur-xl` et transparence
- Sidebar avec bordures subtiles
- Modales avec overlay blur

---

## 🧪 Comptes de test

| Email | Password | Rôle |
|-------|----------|------|
| client@gmail.com | password123 | CLIENT |
| vendeur@gmail.com | password123 | VENDEUR |

---

## 📄 Licence

Projet académique — ICT300 Soutenance

**Dernière mise à jour** : 30 Avril 2026
