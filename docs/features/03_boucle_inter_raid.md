# Système 03 — La boucle inter-raid

## Contexte

### Idée de base
Dans un jeu de gestion de guilde roguelike, les moments entre les tentatives de boss sont aussi importants que les tentatives elles-mêmes. C'est là que se prennent les vraies décisions stratégiques — et que le joueur forge une relation avec sa guilde.

L'objectif était de créer une phase inter-raid rapide (adaptée aux sessions mobiles d'1 à 2h), riche en choix significatifs, et cohérente avec le ton humoristique du jeu.

### Itérations
Version initiale : un écran de gestion libre où le joueur peut tout faire dans n'importe quel ordre. Trop ouvert, trop long, crée de l'anxiété décisionnelle.

Version intermédiaire : trois phases séquentielles dont une phase de préparation avec budget d'actions. Trop de friction, trop de comptage.

Version retenue : **deux phases séquentielles et courtes** — Debriefing puis Salle du Conseil. La Salle du Conseil est le seul et unique lieu de décision.

---

## Les deux phases de l'inter-raid

### Phase 1 — Le Debriefing
Juste après un wipe ou une victoire, le jeu génère un compte-rendu automatique absurde qui contient des informations stratégiques réelles.

> *"Analyse du wipe : Sardoche3000 a marché dans la même zone rouge 4 fois. Il assure que c'était intentionnel."*

- Révèle quel membre a sous-performé
- Indique quelle ressource manque
- Identifie quel rôle était défaillant
- **Ton** : l'humour habille des données mécaniques utiles

### Phase 2 — La Salle du Conseil
Le joueur reçoit exactement **3 événements** à résoudre, dans l'ordre de son choix, piochés dans un pool de 4 catégories :

| Catégorie | Exemple |
|---|---|
| Membre | "Flamius veut changer de rôle" |
| Ressources | "Un marchand propose des potions discount" |
| Conflit | "Deux membres ne se parlent plus depuis le wipe" |
| Externe | "Une guilde adverse se dissout — récupérer sa banque ?" |

Chaque événement propose 2 à 3 choix avec des conséquences visibles **et** cachées. Certains événements proposent des **choix enchaînés** — un premier choix qui ouvre ou ferme des options dans le même événement. L'ordre de résolution peut influencer les options disponibles sur les événements suivants.

**Ce que la Salle du Conseil ne couvre pas ce tour-ci empire seul** — l'inaction est une conséquence par défaut, pas une option explicite.

---

## Pourquoi c'est une bonne idée

- La **structure en 2 phases** réduit l'anxiété décisionnelle : le joueur sait toujours où il en est
- Le **debriefing** transforme l'analyse post-mortem (souvent ennuyeuse) en moment comique et informatif
- La **Salle du Conseil** est le moteur narratif et émotionnel du jeu — elle génère des histoires uniques à chaque run
- **Un seul lieu de décision** = lisibilité maximale, pas de friction entre deux systèmes parallèles
- L'ensemble est calibré pour tenir en **5 à 10 minutes** par inter-raid, adapté au rythme mobile

---

## Ce à quoi il faut faire attention

- **Pas de bonne réponse évidente en Salle du Conseil** : si un choix domine clairement les autres, le joueur ne réfléchit plus. Chaque option doit être un trade-off réel.
- **Les effets cachés doivent être devinables** : le joueur doit pouvoir les anticiper avec l'expérience, pas les subir aléatoirement. Ils récompensent l'apprentissage.
- **3 événements doivent toujours sembler insuffisants** : si le joueur a l'impression de tout couvrir confortablement, la tension disparaît.
- **Limiter la fatigue décisionnelle** : 3 événements est le bon équilibre. Les choix enchaînés ne doivent pas dépasser 2 niveaux de profondeur.

---

## Schémas et prototypes

La structure complète a été modélisée dans deux supports :

**Diagramme de flux** — boucle complète incluant les deux phases inter-raid, leurs connexions avec les tentatives de boss et les sorties (patch terminé / dissolution). *(voir diagramme interactif "guild_game_loop" généré en session)*

**Prototype de cartes d'événements** — 4 exemples de cartes (une par catégorie) avec leur mise en page, leurs choix et leurs effets affichés/cachés. *(voir widget interactif "salle_du_conseil_event_cards" généré en session)*

---

## Évolutions possibles

- **Événements en chaîne** : un événement résolu dans un inter-raid peut déclencher un événement différent au suivant
- **Mémoire narrative** : le debriefing fait référence à des événements passés ("C'est la troisième fois que Kévin marche dans la zone rouge. Il commence à avoir l'air fier.")
- **Événements de guilde rares** : 1 fois par patch, un événement "grande décision" remplace la Salle du Conseil normale — conséquences beaucoup plus lourdes, choix plus complexes
- **Débloquer des catégories d'événements** via la méta-progression — certains événements ne sont disponibles qu'après plusieurs runs
