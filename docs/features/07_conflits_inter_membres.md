# Système 07 — Conflits inter-membres

## Contexte

### Idée de base
Avec une équipe fixe de 8 membres (aucun départ, aucun recrutement en cours de run), le drama entre membres ne peut plus se résoudre par le départ d'un personnage. Il fallait un système où les tensions persistent et ont des conséquences mécaniques réelles — sans pour autant bloquer le jeu.

La contrainte de taille (8 membres fixes) rend chaque conflit précieux : il n'y a personne à remplacer, donc chaque dysfonctionnement est un problème à gérer, pas à contourner.

### Itérations
Version initiale : les conflits font partir les membres — trop punitif avec une équipe fixe, et retire toute possibilité de gestion à long terme.

Version intermédiaire : les conflits réduisent simplement le moral — trop peu d'impact, le joueur les ignore.

Version retenue : **4 niveaux de conflit progressifs** avec des pénalités mécaniques distinctes et cumulables, résolubles via la Salle du Conseil. Les conflits peuvent aussi devenir des **synergies exploitables** pour les joueurs avancés.

---

## Les 4 niveaux de conflit

### Niveau 1 — Perte d'efficacité
Le membre est distrait, démotivé. Son investissement baisse sans que ce soit visible de l'extérieur.

- **Pénalité** : −15% skill sur les tentatives
- **Résolution** : Salle du Conseil
- **Ton** : *"Sardoche joue bien mais son cœur n'y est plus."*

### Niveau 2 — Refus de coordination
Deux membres refusent de travailler ensemble sur des mécaniques qui requièrent de la coopération.

- **Pénalité** : certaines compositions de boss bloquées, synergies de duo impossibles
- **Résolution** : Salle du Conseil
- **Ton** : *"Flamius et Kévin ne se parlent plus depuis le wipe du mardi."*

### Niveau 3 — Grève partielle
Le membre est présent physiquement mais ne fait aucun effort. Il consomme des ressources sans contribuer.

- **Pénalité** : −40% skill + consomme des consommables sans contrepartie
- **Résolution** : Salle du Conseil (événement prioritaire)
- **Ton** : *"Pandapower est là. Techniquement."*

### Niveau 4 — Sabotage passif
Le membre génère activement des erreurs qui affectent les autres — non par malice, mais par démotivation totale.

- **Pénalité** : peut déclencher des wipes sur des boss déjà maîtrisés
- **Résolution** : Salle du Conseil uniquement (événement critique)
- **Ton** : *"Kévin vient de marcher dans la zone rouge pour la 5ème fois. Il sourit."*

---

## L'escalade automatique

Un conflit non traité monte d'un niveau à chaque inter-raid où aucun événement ne le résout. C'est la pression structurelle du système — le joueur ne peut pas tout ignorer indéfiniment.

Un conflit niveau 4 entre le tank et le healer représente une dissolution en sursis.

---

## La résolution via la Salle du Conseil

Les conflits génèrent des événements spécifiques en Salle du Conseil, dont la gravité correspond au niveau du conflit. Le joueur choisit parmi plusieurs approches, chacune avec des trade-offs :

> *"Flamius et Kévin ont eu une altercation en vocal."*
> - Donner raison à Flamius → résout le conflit, Kévin perd du moral
> - Rester neutre → réduit le conflit d'un niveau, personne n'est satisfait
> - Convoquer les deux → résout totalement le conflit, déclenche un événement narratif secondaire

Certains choix de résolution déclenchent une **médiation** — un événement narratif au prochain inter-raid qui reflète les conséquences sociales de l'intervention du GM.

---

## Les synergies de conflit

Certains membres possèdent un trait spécial (**Rivalité productive**, **Solitaire**, **Rancunier**) qui transforme un conflit actif en avantage mécanique sous conditions précises.

### Mécanique de découverte
La synergie est **cachée au départ**. Elle se révèle après X raids où les conditions sont réunies — le membre en conflit, assigné à un groupe sans le membre adverse. Le jeu déclenche alors un événement narratif de révélation :

> *"Depuis leur dispute, Sardoche et Kévin semblent se surpasser chacun de leur côté. Comme s'ils se prouvaient quelque chose mutuellement."*

### Affichage post-découverte
Une fois révélée, la synergie est affichée explicitement sur la fiche du membre :
- Nom de la synergie
- Condition d'activation (niveau de conflit minimum, assignation séparée)
- Effets positifs et négatifs chiffrés
- Citation narrative

### Exemple — L'Effet Rancune (Sardoche)
- **Condition** : en conflit niveau 2+ avec un membre, assigné à un groupe sans ce membre
- **Effet positif** : +25% skill en solo
- **Effet négatif** : −20% coordination avec le membre en conflit
- **Contrainte** : le conflit doit rester actif (niveau 2 minimum)

---

## La tension avec les fins de palier

Les fins de palier réduisent automatiquement tous les conflits d'un niveau. Pour un joueur qui exploite une synergie de conflit niveau 2, cette "récompense" devient un **dilemme** :

- Laisser le conflit redescendre à niveau 1 désactive la synergie
- Ignorer délibérément des événements de réconciliation en Salle du Conseil pour maintenir le conflit est un choix de style de jeu assumé
- C'est moralement ambigu pour le GM que le joueur incarne — et c'est voulu

---

## Pourquoi c'est une bonne idée

- Les conflits créent une **pression continue et visible** sans retirer des membres du jeu
- Les 4 niveaux progressifs donnent au joueur **le temps de réagir** avant la crise totale
- Les synergies de conflit transforment un système punitif en **système stratégique** — les conflits ne sont plus toujours des problèmes à résoudre
- La découverte progressive des synergies **récompense l'observation** et crée de la rejouabilité
- L'ambiguïté morale (maintenir un conflit délibérément) est cohérente avec le rôle de GM que le joueur incarne

---

## Ce à quoi il faut faire attention

- **Lisibilité de l'état des conflits** : avec 8 membres et potentiellement plusieurs conflits simultanés, l'interface doit permettre de visualiser l'état de toutes les relations d'un coup d'œil
- **Pas trop de conflits simultanés** : si 4 paires sont en conflit en même temps, le jeu devient ingérable. Envisager un plafond de conflits actifs simultanés, ou des événements qui en résolvent plusieurs à la fois
- **Les synergies ne doivent pas rendre les conflits souhaitables par défaut** : elles doivent rester conditionnelles et risquées, pas systématiquement meilleures que la résolution
- **La médiation** (résolution totale d'un conflit) doit avoir des conséquences narratives claires — sinon le joueur la perçoit comme l'option dominante et ne réfléchit plus

---

## Schémas et prototypes

Deux prototypes ont été créés :

**Les 4 états de conflit** — cards visuelles présentant chaque niveau avec sa pénalité, son ton narratif et ses modes de résolution. *(voir widget "conflict_states" généré en session)*

**La fiche de synergie de conflit** — fiche membre augmentée avec le bloc synergie post-découverte, incluant condition d'activation, effets chiffrés, indicateur de niveau de conflit actuel. *(voir widget "conflict_synergy_reveal" généré en session)*

---

## Évolutions possibles

- **Conflits triangulaires** : un conflit entre A et B qui implique C comme arbitre — C doit choisir un camp, ce qui crée de nouvelles relations
- **Conflits positifs** : à l'inverse des conflits négatifs, une relation très haute (80+) entre deux membres crée une synergie de coopération avec ses propres conditions et effets
- **Historique des conflits** : un conflit résolu laisse une trace — "Ancien conflit" — qui peut se réactiver plus facilement si les conditions se reproduisent
- **Conflits de génération** : certains traits rendent un membre plus susceptible d'entrer en conflit avec des profils spécifiques (ex: "Looter" entre systématiquement en conflit avec "Équitable")
