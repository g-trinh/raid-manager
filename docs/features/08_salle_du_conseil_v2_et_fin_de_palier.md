# Système 08 — Salle du Conseil (v2) et fin de palier

## Contexte

### Idée de base
Suite à la suppression du budget d'actions, la Salle du Conseil devient **l'unique lieu de décision** de l'inter-raid. Toute la gestion de la guilde — conflits, ressources, stratégie, événements externes — passe par elle.

La fin de palier est conçue comme une **respiration** dans la tension : un moment de récompense émotionnelle qui reset partiellement l'état de la guilde avant d'attaquer la difficulté suivante.

### Itérations
Version initiale : 2 à 3 événements en Salle du Conseil + budget d'actions séparé pour les actions proactives.

Version intermédiaire : suppression du budget d'actions, la Salle du Conseil couvre tout — mais avec un seul choix par événement, trop limité.

Version retenue : **3 événements par inter-raid**, certains avec des choix enchaînés, la Salle du Conseil comme seul et unique lieu de décision.

---

## La Salle du Conseil (v2)

### Format
À chaque inter-raid, le joueur reçoit exactement **3 événements** à résoudre, dans l'ordre de son choix.

### Sélection des événements
La sélection est **contextuellement pondérée** :
- Si un conflit niveau 3+ est actif → un événement de conflit est garanti
- Si le moral collectif est bas → priorité aux événements Membre
- Si la banque est vide → priorité aux événements Ressources
- Sinon → pioche aléatoire pondérée entre les 4 catégories

### Ce qui change par rapport à la v1
- **Seul lieu de décision** : plus de phase de préparation séparée. Tout ce que le joueur peut faire pour sa guilde passe par un événement de la Salle du Conseil
- **Choix enchaînés** : certains événements proposent un premier choix qui ouvre ou ferme des options dans le même événement
- **Ordre de résolution stratégique** : résoudre un événement peut modifier les options disponibles dans les suivants
- **Inaction par défaut** : ce que le Salle du Conseil ne couvre pas ce tour-ci empire seul — pas besoin d'une option "ignorer" explicite

### Exemple de choix enchaîné
> *"Flamius et Kévin ont eu une altercation en vocal. Flamius demande à te parler en privé."*
>
> **Choix 1** : Écouter Flamius / Ignorer la demande
>
> Si "Écouter Flamius" :
> → Donner raison à Flamius (+moral Flamius, -moral Kévin)
> → Rester neutre (conflit −1 niveau, personne satisfait)
> → Promettre d'y réfléchir (rien maintenant, événement garanti au prochain inter-raid)
>
> Si "Ignorer la demande" :
> → Conflit +1 niveau automatiquement
> → Flamius gagne le trait temporaire "Ignoré par le GM"

---

## La fin de palier

### Déclencheur
La fin de palier se déclenche après la mort du **dernier boss d'un palier** (Normal, Héroïque ou Mythique).

### Ce qui se passe automatiquement
- **Moral** : +20 flat pour tous les membres, sans exception
- **Conflits** : tous les conflits actifs descendent d'un niveau (niveau 1 → résolu, niveau 4 → niveau 3)
- Ces effets sont appliqués avant la Salle du Conseil de fin de palier

### La Salle du Conseil de fin de palier
Un unique événement de célébration remplace les 3 événements habituels. Il est toujours comique, jamais stressant, et marque narrativement la transition vers la difficulté suivante.

> *"La guilde fête la victoire en Normale. Kévin a commandé une pizza pour tout le monde. Il a oublié que Flamius est végétalien. Flamius mange la pizza quand même. Quelque chose a changé entre eux."*

Pas de choix difficile — juste un moment narratif qui récompense le joueur émotionnellement.

### Le dilemme des synergies de conflit
Le reset automatique des conflits crée une tension stratégique pour les joueurs qui exploitent des synergies de conflit :

- Un conflit niveau 2 exploité depuis 3 raids redescend à niveau 1 → synergie désactivée
- Le joueur peut avoir délibérément ignoré des événements de réconciliation pour maintenir le conflit actif
- La fin de palier "récompense" donc parfois contre la volonté du joueur — c'est un coût caché de la stratégie de conflit

---

## Pourquoi c'est une bonne idée

**Salle du Conseil unifiée :**
- Un seul lieu de décision = **lisibilité maximale** pour le joueur
- L'inaction par défaut (ce qui n'est pas couvert empire) crée une pression naturelle sans compteur artificiel
- Les choix enchaînés ajoutent de la profondeur sans multiplier les écrans
- La pondération contextuelle fait que le jeu **répond aux crises** avec des événements pertinents

**Fin de palier :**
- La respiration est **méritée et ressentie** — le joueur arrive souvent épuisé avec des conflits accumulés
- Le reset partiel (pas total) préserve les conséquences des décisions passées
- L'événement de célébration crée un **pic émotionnel positif** avant de relancer la tension
- Le dilemme des synergies de conflit ajoute une couche stratégique à ce moment de récompense

---

## Ce à quoi il faut faire attention

**Salle du Conseil :**
- **3 événements doivent toujours sembler insuffisants** : si le joueur a l'impression de tout couvrir confortablement, la tension disparaît. Calibrer la fréquence et la gravité des événements en conséquence
- **Pas de bonne réponse évidente** : chaque choix doit être un trade-off réel. Un choix dominant retire tout intérêt à la décision
- **Volume du pool d'événements** : avec 3 événements par inter-raid sur une run de 1 à 2h, le joueur peut voir les mêmes événements. Le pool doit être suffisamment large
- **Les choix enchaînés ne doivent pas être trop longs** : 2 niveaux de profondeur maximum par événement, sinon la phase devient lourde

**Fin de palier :**
- **Le +20 moral doit être significatif mais pas trivialement réparateur** : si le reset est trop puissant, le joueur joue de façon laxiste en fin de palier sachant que tout sera réparé
- **L'événement de célébration doit varier** : voir le même texte à chaque fin de palier Normal brise l'immersion. Pool d'événements de célébration suffisamment large
- **Communiquer clairement le reset** : le joueur doit savoir exactement ce qui va se passer avant la fin de palier, pas le découvrir après coup

---

## Schémas et prototypes

Un prototype de 4 cartes d'événements (une par catégorie) illustrant le format v1 de la Salle du Conseil, toujours valide pour la v2. *(voir widget "salle_du_conseil_event_cards" généré en session)*

---

## Évolutions possibles

- **Événements multi-tours** : certains événements créent une "situation en suspens" qui revient aux inter-raids suivants avec des options évoluées selon ce qui s'est passé entre-temps
- **Événements de fin de palier avec choix** : pour les joueurs avancés, proposer un choix narratif même en fin de palier — une décision de guilde importante qui influence le patch suivant
- **Reliques de fin de palier** : récompense supplémentaire à sélectionner parmi 3 options, chacune modifiant une règle du jeu pour le reste de la run (système en attente de design)
- **Événements cross-palier** : une situation commencée en Normal peut avoir des répercussions en Héroïque si elle n'a pas été résolue
- **Salle du Conseil d'urgence** : en cas de crise critique (conflit niveau 4 + moral collectif critique simultanément), déclencher un 4ème événement exceptionnel — hors du quota normal — qui force une résolution immédiate
