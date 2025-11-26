# 🎓 School Management SaaS

Un système de gestion scolaire multi-tenant moderne et complet, construit avec React, TypeScript, Node.js et MongoDB.

## 📋 Table des Matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du Projet](#-structure-du-projet)
- [Technologies Utilisées](#-technologies-utilisées)
- [API Documentation](#-api-documentation)
- [Rôles et Permissions](#-rôles-et-permissions)

## 🎯 Présentation

School Management SaaS est une plateforme complète de gestion d'établissements scolaires qui permet de :
- Gérer plusieurs écoles (multi-tenant)
- Administrer les utilisateurs avec différents rôles
- Suivre les performances académiques des étudiants
- Gérer les classes, matières et années académiques
- Générer des bulletins et rapports
- Gérer la facturation et les paiements

## ✨ Fonctionnalités

### 🏫 Multi-Tenant
- Gestion de multiples écoles avec sous-domaines
- Système de billing intégré (FREE, BASIC, PRO)
- Gestion des membres par école
- Demandes d'adhésion et invitations

### 👥 Gestion des Utilisateurs
- Authentification JWT sécurisée
- Rôles multiples : DIRECTOR, SECRETARY, TEACHER, ADMIN
- Multi-membership (un utilisateur peut appartenir à plusieurs écoles)
- Système de sécurité avancé (2FA, tentatives de connexion, verrouillage de compte)

### 📚 Gestion Académique
- Années académiques avec trimestres et séquences
- Gestion des classes et assignation des matières
- Suivi des performances et génération de bulletins
- Statistiques et analyses détaillées
- Support des niveaux : Form 1-5, Lower Sixth, Upper Sixth

### 👨‍🎓 Gestion des Étudiants
- Profils complets avec photos
- Contacts d'urgence et informations détaillées
- Historique académique
- Import/Export Excel et CSV
- Statuts : active, suspended, graduated, withdrawn

### 💰 Facturation
- Calcul automatique basé sur l'utilisation
- Tarification par étudiant, personnel, classe
- Génération de factures
- Gestion des périodes d'essai

### 📊 Reporting & Analytics
- Tableaux de bord par rôle
- Statistiques en temps réel
- Export de rapports PDF
- Logs d'audit complets

## 🏗️ Architecture

### Stack Technique

**Frontend:**
- React 18.3 avec TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Query pour la gestion d'état
- React Router v6
- React Hook Form + Zod

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT pour l'authentification
- Bcrypt pour le hashage des mots de passe

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** >= 6.x (local ou Atlas)
- **Git**

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/gessyken/school-management-saas.git
cd school-management-saas
```

### 2. Installer les dépendances

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

## ⚙️ Configuration

### Frontend

1. Copier le fichier d'exemple des variables d'environnement :
```bash
cp .env.example .env
```

2. Modifier `.env` si nécessaire :
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="School Management SaaS"
VITE_APP_VERSION=1.0.0
VITE_ENV=development
```

### Backend

1. Le fichier `.env` existe déjà dans `backend/`, mais vérifiez les paramètres :
```env
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=8000
MONGODB_URI=mongodb://localhost:27017/mit_project_saas
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081,http://localhost:3000,http://localhost:3001,http://localhost:3002
EMAIL_SERVICE=gmail
```

⚠️ **Important :** Changez le `JWT_SECRET` en production !

### Base de données

Si vous utilisez MongoDB en local, assurez-vous qu'il est démarré :

```bash
# macOS (avec Homebrew)
brew services start mongodb-community

# Ou manuellement
mongod
```

Pour MongoDB Atlas, remplacez `MONGODB_URI` par votre chaîne de connexion.

## 🎬 Démarrage

### Développement

Ouvrez deux terminaux :

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Le frontend démarre sur `http://localhost:8080`

### Production

**Build:**
```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

## 📁 Structure du Projet

```
school-management-saas/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Logique métier
│   │   ├── models/           # Modèles Mongoose
│   │   ├── routes/           # Routes API
│   │   ├── middleware/       # Middlewares (auth, logging)
│   │   ├── database/         # Configuration DB
│   │   └── utils/            # Utilitaires (JWT, logs)
│   ├── .env
│   ├── package.json
│   └── index.js
│
├── src/
│   ├── components/           # Composants React
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── layout/          # Layout components
│   │   ├── dashboard/       # Dashboard components
│   │   └── modals/          # Modales
│   ├── pages/               # Pages par rôle
│   │   ├── director/        # Pages du directeur
│   │   ├── secretary/       # Pages du secrétaire
│   │   ├── teacher/         # Pages du professeur
│   │   └── school/          # Pages de gestion d'école
│   ├── context/             # Contexts React
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitaires et services
│   │   └── services/        # Services API
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── .env
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

## 🛠️ Technologies Utilisées

### Frontend
| Technologie | Description |
|------------|-------------|
| React 18.3 | Bibliothèque UI |
| TypeScript | Typage statique |
| Vite | Build tool ultra-rapide |
| Tailwind CSS | Framework CSS utility-first |
| shadcn/ui | Composants UI modernes |
| React Query | Gestion des données serveur |
| React Router | Routing |
| React Hook Form | Gestion des formulaires |
| Zod | Validation de schémas |
| Recharts | Graphiques |
| jsPDF | Génération de PDF |
| Axios | Client HTTP |

### Backend
| Technologie | Description |
|------------|-------------|
| Node.js | Runtime JavaScript |
| Express | Framework web |
| MongoDB | Base de données NoSQL |
| Mongoose | ODM pour MongoDB |
| JWT | Authentification |
| Bcrypt | Hashing de mots de passe |
| Joi | Validation des données |
| Nodemailer | Envoi d'emails |

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints Principaux

#### Authentication
```
POST   /api/auth/login          # Connexion
POST   /api/auth/register       # Inscription
POST   /api/auth/logout         # Déconnexion
GET    /api/auth/me             # Utilisateur actuel
```

#### Schools
```
GET    /api/schools             # Liste des écoles
POST   /api/schools             # Créer une école
GET    /api/schools/:id         # Détails d'une école
PUT    /api/schools/:id         # Modifier une école
DELETE /api/schools/:id         # Supprimer une école
```

#### Students
```
GET    /api/students            # Liste des étudiants
POST   /api/students            # Créer un étudiant
GET    /api/students/:id        # Détails d'un étudiant
PUT    /api/students/:id        # Modifier un étudiant
DELETE /api/students/:id        # Supprimer un étudiant
```

#### Classes
```
GET    /api/classes             # Liste des classes
POST   /api/classes             # Créer une classe
GET    /api/classes/:id         # Détails d'une classe
PUT    /api/classes/:id         # Modifier une classe
DELETE /api/classes/:id         # Supprimer une classe
```

#### Academic Years
```
GET    /api/academic-years      # Liste des années académiques
POST   /api/academic-years      # Créer une année académique
GET    /api/academic-years/:id  # Détails d'une année
PUT    /api/academic-years/:id  # Modifier une année
```

#### Subjects
```
GET    /api/subjects            # Liste des matières
POST   /api/subjects            # Créer une matière
PUT    /api/subjects/:id        # Modifier une matière
DELETE /api/subjects/:id        # Supprimer une matière
```

#### Users
```
GET    /api/users               # Liste des utilisateurs
POST   /api/users               # Créer un utilisateur
GET    /api/users/:id           # Détails d'un utilisateur
PUT    /api/users/:id           # Modifier un utilisateur
DELETE /api/users/:id           # Supprimer un utilisateur
```

### Authentication

Toutes les requêtes (sauf login/register) nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## 👤 Rôles et Permissions

### DIRECTOR (Directeur)
- Accès complet à toutes les fonctionnalités de l'école
- Gestion des classes, étudiants, professeurs
- Accès aux statistiques et rapports
- Gestion des paramètres de l'école

### SECRETARY (Secrétaire)
- Gestion des étudiants
- Gestion des paiements
- Consultation des classes
- Génération de documents

### TEACHER (Professeur)
- Consultation des classes assignées
- Saisie et modification des notes
- Génération de bulletins

### ADMIN (Administrateur système)
- Gestion des écoles
- Gestion du billing
- Accès aux logs système

## 🔒 Sécurité

- **JWT** pour l'authentification
- **Bcrypt** pour le hashing des mots de passe (salt rounds: 10)
- **Tentatives de connexion limitées** (verrouillage après 5 échecs)
- **Validation des données** avec Joi et Zod
- **CORS** configuré pour les origines autorisées
- **Protection contre les injections** via Mongoose

## 📝 Scripts Disponibles

### Frontend
```bash
npm run dev         # Démarrer le serveur de développement
npm run build       # Build de production
npm run preview     # Prévisualiser le build
npm run lint        # Linter le code
```

### Backend
```bash
npm run dev         # Démarrer avec nodemon (hot reload)
npm start          # Démarrer en production
```

## 🐛 Débogage

### Problèmes courants

**MongoDB ne se connecte pas :**
```bash
# Vérifier que MongoDB est démarré
brew services list | grep mongodb

# Redémarrer MongoDB
brew services restart mongodb-community
```

**Erreur CORS :**
- Vérifiez que le frontend utilise le bon `VITE_API_URL`
- Vérifiez les `ALLOWED_ORIGINS` dans le backend

**Token expiré :**
- Supprimez le localStorage et reconnectez-vous
```javascript
localStorage.clear()
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

**gessyken** - [GitHub](https://github.com/gessyken)

## 🙏 Remerciements

- shadcn/ui pour les composants UI
- La communauté React et Node.js
- Tous les contributeurs

---

Made with ❤️ by gessyken
