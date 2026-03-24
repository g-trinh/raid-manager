# Système 06 — Création de deck (début de run)

## Contexte

### Idée de base
Avant le premier raid, le joueur compose son équipe de 8 membres. C'est son unique moment de contrôle total sur la composition de la guilde — une fois la run lancée, l'équipe est fixe pour toute la durée.

L'inspiration vient des phases de draft dans les roguelikes de deckbuilding : le joueur construit son run avant de le jouer, avec une information incomplète et des contraintes de choix.

### Itérations
Version initiale : le joueur choisit librement parmi un grand pool de membres disponibles. Trop peu de contrainte, pas de tension dans la sélection.

Version retenue : **tirages successifs par paquets de 3**, avec un nombre limité de skips. Le joueur ne voit jamais tout le pool — il doit décider avec l'information disponible maintenant.

---

## La mécanique de draft

La phase se déroule en 8 tirages successifs (un par slot à remplir). À chaque tirage :
- 3 profils aléatoires sont proposés
- Le joueur en choisit un, ou passe
- Il dispose de **3 skips maximum** sur toute la phase

### La tension du skip
Le joueur ne sait pas ce que les prochains tirages proposeront. Garder ses skips pour plus tard est une assurance — mais les dépenser tôt libère des choix difficiles maintenant. C'est une ressource à gérer avant même le début du raid.

### Ce qui est visible au draft
- Nom, classe, rôle (Tank / Healer / DPS)
- Skill, Moral (affichés)
- Traits de personnalité (2 positifs, 1 négatif)

### Ce qui est caché au draft
- Ses synergies de conflit potentielles avec les membres déjà sélectionnés
- Ses relations avec les autres membres déjà recrutés
- Le détail de ses capacités passives débloquées à l'expérience

---

## Pourquoi c'est une bonne idée

- La **contrainte de 3 skips** force des décisions imparfaites — le joueur ne peut pas attendre le profil parfait
- **L'information incomplète** (synergies inconnues, relations cachées) crée de la rejouabilité — chaque run révèle des surprises
- La **composition finale** appartient entièrement au joueur — il ne peut pas blâmer le jeu pour ses choix
- La phase de draft est un **moment de projection** : le joueur imagine déjà comment sa guilde va fonctionner avant de jouer
- Chaque run commence avec une **identité différente** selon les profils disponibles et les choix effectués

---

## Ce à quoi il faut faire attention

- **Équilibre des rôles** : si le tirage ne propose que des DPS sur les premiers slots, le joueur peut se retrouver sans tank ni healer. Il faut pondérer les tirages pour garantir une exposition minimale à chaque rôle.
- **Lisibilité du skip** : le joueur doit toujours savoir combien de skips il lui reste et ce que ça implique. Le compteur doit être visible et permanent pendant la phase.
- **Durée de la phase** : 8 tirages peuvent sembler longs au début. Envisager une option "draft rapide" pour les joueurs qui relancent fréquemment.

---

## Schémas et prototypes

Un prototype interactif de l'écran de draft a été créé, illustrant :
- L'en-tête avec le numéro de tirage et les slots restants
- Le compteur de skips visuels (points actifs / dépensés)
- Les 3 cartes de profil côte à côte avec stats, traits et bouton de recrutement
- La composition en cours de construction en bas de l'écran
- Le bouton skip et son comportement (désactivé à 0 skip restant)

*(voir widget interactif "deck_creation_screen" généré en session)*

---

## Évolutions possibles

- **Draft rapide** : pour les runs suivantes, proposer une composition aléatoire pré-générée que le joueur peut accepter ou modifier partiellement
- **Contraintes de draft imposées** : certains modes de jeu imposent des restrictions (ex : "draft uniquement des membres avec un trait négatif", "pas de healer au départ")
- **Membres méta-progressifs** : via les Legs de Guilde, certains membres légendaires de runs précédentes peuvent apparaître dans le pool de draft
- **Relations pré-existantes** : certains profils arrivent avec une relation déjà établie avec un autre membre du pool — visible pendant le draft, ce qui influence les choix de composition
- **Draft adversarial** : en mode avancé, certains profils "bannis" par le patch en cours ne peuvent pas être sélectionnés
