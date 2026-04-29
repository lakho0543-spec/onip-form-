# 🇨🇩 ONIP - Fiche Nationale d'Identification

Application officielle d'identification de la population pour l'Office National d'Identification de la Population (ONIP) en RDC.

##  Fonctionnalités

-  Formulaire d'inscription en 7 étapes
-  12 catégories de requérants (Majeur, Élève, Militaire, Policier, etc.)
-  Identité complète (nom, naissance, taille, yeux, groupe sanguin)
-  Adresses de résidence et domicile
-  Situation familiale (conjoint, enfants jusqu'à 6)
-  Identité des parents (père et mère)
-  Tuteur (si applicable)
-  Niveau d'études (P6 à Doctorat)
-  Profession
-  Handicap
-  Pièce présentée (acte naissance, carte identité, passeport, etc.)
-  Témoins (2)
-  Déclaration et signature
-  Authentification
-  Base de données PostgreSQL

##  Technologies

- React 18
- Supabase (authentification + base de données)
- PostgreSQL
- CSS3

##  Installation

```bash
npm install
npm start
 Structure du formulaire
Étape	Contenu
1	Catégorie du requérant
2	Identité
3	Adresses
4	Situation familiale
5	Parents
6	Tuteur, études, profession, handicap
7	Document, témoins, signature
Lien de test