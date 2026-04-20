# LMS Frontend

Ce dépôt contient l'interface utilisateur (Frontend) de la plateforme LMS (Learning Management System).
Il est développé en React avec TypeScript et communique avec les microservices métiers via l'API Gateway.

## Fonctionnalités
- **Interface Administrateur** : Gestion des utilisateurs, des départements, classes, et de l'architecture académique.
- **Interface Professeur** : Dépôt de supports de cours, création de quiz, et notation.
- **Interface Étudiant** : Accès aux cours, passages d'évaluations, et gamification (XP, Badges).

## Prérequis
- Node.js (version 16 ou supérieure recommandée)
- npm ou yarn

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/dev-web3-project/lms-frontend.git
```

2. Installez les dépendances :
```bash
cd lms-frontend
npm install
```

## Exécution en local

Pour lancer l'application en mode développement :

```bash
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

> **Note :** Le frontend a besoin du backend pour fonctionner. Assurez-vous d'avoir cloné et lancé le projet `core` (sur le port `8080`) avant d'utiliser la plateforme.
