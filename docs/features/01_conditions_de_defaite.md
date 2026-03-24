# Système 01 — Conditions de défaite

## Contexte

### Idée de base
Le jeu est un roguelike de gestion de guilde. Il fallait définir ce que signifie "perdre" dans un contexte où le joueur gère des humains (virtuels), des ressources et une progression raid par raid.

### Itérations
La première version envisagée était une défaite unique : la guilde se dissout, game over. Trop brutal et peu satisfaisant pour un jeu mobile où les sessions sont courtes.

La version retenue est un **système de défaite en entonnoir à trois niveaux**, où chaque niveau alimente le suivant sans couper brutalement la session du joueur.

---

## Les trois niveaux de défaite

### Niveau 1 — Défaite locale (boss raté)
- La guilde échoue à tuer un boss après un nombre maximum de tentatives (ex : 10 tries)
- Chaque tentative ratée consomme des ressources (consommables, moral)
- La guilde **survit**, mais paie un coût

### Niveau 2 — Défaite de patch (intermédiaire)
- Le patch est perdu si le dernier boss n'est pas tué avant la fin du timer
- Ou si les ressources sont insuffisantes pour continuer à raider
- La guilde repart au patch suivant **affaiblie** : moins de membres, moins de ressources, réputation abîmée

### Niveau 3 — Dissolution (game over)
| Condition | Description |
|---|---|
| Masse critique | Moins de 5 membres actifs simultanément |
| Banque vide | Plus aucune ressource pour couvrir les frais de raid |
| Drama fatal | Le moral collectif tombe à 0, départs en masse |
| Accumulation | X patches ratés consécutifs sans progression |

---

## Pourquoi c'est une bonne idée

- Le joueur **voit venir** la dissolution — il ne perd jamais "d'un coup"
- Chaque défaite locale crée une **pression systémique** lisible : boss raté → ressources perdues → moral en baisse → risque de départ
- La dissolution est vécue comme une **conclusion narrative**, pas comme un écran de game over frustrant

---

## Ce à quoi il faut faire attention

**Le death spiral.** Si rater un boss rend automatiquement le suivant encore plus dur, le joueur entre dans une spirale dont il ne peut pas sortir. C'est le risque principal de ce système.

- Les malus de défaite locale doivent rester **absorbables** individuellement
- Le joueur doit toujours avoir au moins **une action disponible** pour tenter de renverser la tendance
- Les seuils de dissolution (moral à 0, banque vide) ne doivent **jamais se déclencher en même temps** — espacer les crises

---

## Schémas et prototypes

La boucle complète a été modélisée dans un diagramme de flux incluant :
- Les deux branches de sortie après une tentative (boss tué / wipe)
- Le chemin des événements comiques comme mécanisme de rattrapage
- Les deux sorties positives (boss tué, patch terminé) et deux négatives (wipe, dissolution)
- La boucle de retour vers la prochaine tentative via la phase de préparation

![Game loop](game_loop_macro.svg)

---

## Évolutions possibles

- **Niveaux de difficulté** : ajuster les seuils de dissolution (nombre de tries max, taille minimale de la guilde) selon le profil du joueur
