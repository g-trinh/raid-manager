# Système 05 — Le système de membres

## Contexte

### Idée de base
La guilde est composée de **8 membres fixes** pour toute la durée d'une run. Chaque membre doit être suffisamment distinct et attachant pour que son dysfonctionnement soit vécu comme un vrai problème. L'objectif est de créer des personnages procéduraux auxquels le joueur s'attache émotionnellement sans avoir à écrire des histoires à la main.

La contrainte de taille (8 membres fixes) est volontaire : elle rend chaque membre précieux et chaque conflit sérieux — personne n'est remplaçable.

### Itérations
Version initiale : membres comme unités purement mécaniques (stat DPS, stat survie). Efficace mais sans âme — le joueur gère des chiffres, pas des personnages.

Version intermédiaire : ajout de noms et de classes WoW. Plus de personnalité, mais pas assez de comportement distinct.

Version retenue : **trois couches par membre** (rôle, stats, personnalité) avec un système de traits et de relations inter-membres qui génère du drama organique.

---

## Anatomie d'un membre

### Couche 1 — Le rôle
Chaque membre occupe un rôle fonctionnel dans le raid :
- **Tank** : absorbe les dégâts, positionne le boss
- **Healer** : maintient la guilde en vie
- **DPS** : inflige des dégâts, tue le boss

La composition de rôles doit être équilibrée — manquer d'un rôle crée des pénalités mécaniques sévères sur les tentatives.

### Couche 2 — Les quatre statistiques

| Stat | Description | Évolution |
|---|---|---|
| Skill | Performance brute sur un boss | Monte avec l'expérience des raids |
| Fiabilité | Présence et constance | Variable selon l'état du membre |
| Moral | Satisfaction dans la guilde | Volatile — monte/descend selon les événements |
| Expérience | Vécu des raids | Lente mais permanente, débloque des passifs |

### Couche 3 — Les traits de personnalité

Chaque membre est généré avec **2 traits positifs et 1 trait négatif** :

| Trait | Effet mécanique |
|---|---|
| Enthousiaste | +moral après les victoires, déception amplifiée après les wipes |
| Loyal | Résiste mieux aux effets de conflit sur le moral |
| Drama Queen | Ses événements impactent toute la guilde |
| AFK fréquent | Fiabilité aléatoire sur chaque try |
| Main Froide | Meilleures performances sur les boss difficiles |
| Looter | Réclame du loot en priorité, génère du ressentiment |
| Mentor | Augmente le Skill des membres proches de lui |

---

## La progression double

Après chaque boss tué, deux types de progression sont distribués :

### Équipement (progression immédiate)
- Le loot du boss est distribué entre les membres
- Augmente les points d'équipement = puissance immédiate
- **Arbitrage clé** : donner au plus faible (équilibrer) / au plus fort (optimiser) / au plus mécontent (apaiser)

### Expérience (progression lente)
- Distribuée à tous les membres présents après chaque tentative, victoire ou non
- Débloque des capacités passives au fil du temps
- Indépendante de l'équipement — un vétéran mal équipé reste précieux

Ce double système crée des décisions de distribution qui sont parmi les plus chargées émotionnellement du jeu.

---

## Le système de relations inter-membres

Chaque membre a une **valeur de relation** avec chaque autre membre (0 à 100), générée à la création et qui évolue selon les événements.

### Effets mécaniques
- **Relation haute** : synergies de raid — deux membres proches jouent mieux ensemble
- **Relation basse** : peut évoluer vers un conflit actif, générant des événements en Salle du Conseil

Les relations créent des **dépendances émotionnelles** qui compliquent les décisions de management — résoudre un conflit entre A et B peut dégrader la relation de C avec A.

---

## Pourquoi c'est une bonne idée

- **8 membres fixes** : assez petit pour s'attacher à chacun, les dysfonctionnements sont des problèmes à gérer pas à contourner
- Les **traits générés procéduralement** créent des personnages uniques à chaque run sans écriture à la main
- Le **système de relations** génère du drama organique sans événements scriptés — les histoires émergent du jeu lui-même
- La **progression double** crée des dilemmes de distribution récurrents et émotionnellement chargés

---

## Ce à quoi il faut faire attention

- **Lisibilité des stats** : avec 4 stats par membre et 8 membres, c'est potentiellement 32 valeurs à gérer. L'interface doit permettre de comparer rapidement sans noyer le joueur.
- **Équilibre des traits négatifs** : un trait comme "AFK fréquent" doit être frustrant mais pas rédhibitoire. Les traits négatifs doivent avoir des compensations implicites ou des synergies possibles.
- **Distribution du loot** : cette décision doit rester rapide. Si elle devient un calcul complexe, elle ralentit le rythme. Proposer une suggestion automatique que le joueur peut modifier.

---

## Schémas et prototypes

Une fiche membre complète a été prototypée, incluant :
- En-tête avec avatar, nom, rôle et niveau d'équipement moyen
- Tags de traits (positifs en violet, négatifs en rouge)
- Barres de statistiques (Skill, Fiabilité, Moral, Expérience)
- Slots d'équipement avec nom et valeur de chaque pièce
- Indicateur de relations avec les autres membres

[Fiche membre](fiche_membre.html)

---

## Évolutions possibles

- **Arcs narratifs de membres** : certains membres ont des histoires personnelles qui se déroulent sur plusieurs runs (ex : Kévin qui progresse de mage AFK à héros de la guilde)
- **Rivalités et amitiés déblocables** : certaines paires de membres ont des relations pré-définies qui se révèlent progressivement via des événements
- **Mémoire inter-runs** : via la méta-progression, certains membres légendaires peuvent réapparaître dans les runs suivants, avec leur histoire conservée
- **Spécialisations** : à partir d'un certain niveau d'expérience, un membre débloque une spécialisation de son rôle (ex : Tank Défensif vs Tank Agressif) qui modifie sa contribution aux tentatives
