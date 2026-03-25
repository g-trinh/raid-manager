# Système 01 — Conditions de défaite

## Contexte

### Idée de base
Le jeu est un roguelike de gestion de guilde. Il fallait définir ce que signifie "perdre" dans un contexte où le joueur gère des humains (virtuels), des ressources et une progression raid par raid.

### Itérations
La première version envisagée était un système de défaite en entonnoir à trois niveaux (défaite locale → défaite de patch → dissolution), pour amortir les échecs et éviter les game over brutaux.

Cette approche a été abandonnée : trop complexe à calibrer, et elle diluait l'enjeu de chaque tentative. Si rater un boss n'arrête pas la run, le joueur finit par ne plus ressentir la tension des dernières tentatives.

La version retenue est une **condition de défaite unique et directe** : si la guilde échoue à tuer un boss après 5 tentatives, les membres gquit et la guilde se dissout. Game over.

---

## La condition de défaite

### Dissolution par abandon collectif
- La guilde dispose de **5 tentatives** pour tuer chaque boss
- Chaque wipe érode le moral, consomme des ressources et fait monter la frustration
- Si le boss n'est pas tué au bout de 5 tentatives, les membres perdent foi dans la guilde
- Ils décident collectivement de **gquit** — la guilde se dissout

La dissolution est une **conclusion narrative** : ce n'est pas un écran de game over abstrait, c'est la fin logique d'une guilde qui n'a pas réussi à se transcender.

---

## Pourquoi c'est une bonne idée

- Chaque tentative a un **enjeu réel** — il n'y a pas de filet de sécurité en dessous
- La tension monte naturellement sur les tentatives 4 et 5, sans mécanique artificielle
- Le joueur comprend immédiatement les règles : **tuer le boss ou mourir**
- La dissolution par gquit est narrativement cohérente avec l'univers WoW parodié

---

## Ce à quoi il faut faire attention

**Le mur infranchissable.** Un boss trop difficile peut bloquer le joueur définitivement sans qu'il ait les outils pour s'en sortir. Les mécaniques de rattrapage (Système 02) sont le garde-fou — elles doivent se déclencher avant que la 5ème tentative soit consommée.

- Les événements de rattrapage doivent être **visibles avant la crise** (tentative 3 ou 4, pas 5)
- Le choix tactique pré-tentative doit toujours offrir **une option crédible**, même dans une situation dégradée
- La difficulté des boss doit être calibrée pour que 5 tentatives soient **suffisantes pour un joueur attentif**

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
- **Héritage entre runs** : Lors d'une dissolution, la guilde suivante hérite d'un vestige du run précédent (un membre survivor, une réputation résiduelle, une dette). Le game over devient un recommencement contextualisé, ce qui est cohérent avec le roguelike et donne du sens à la défaite finale.
