# Système 04 — La Salle du Conseil

## Contexte

### Idée de base
La Salle du Conseil est la phase centrale de l'inter-raid. C'est le moteur narratif et stratégique du jeu — le moment où le joueur prend des décisions qui façonnent l'identité de sa guilde et créent des histoires mémorables.

L'inspiration vient des jeux de cartes à événements (Reigns, FTL) mais adaptée à une guilde WoW, avec un ton délibérément comique.

### Itérations
Version initiale : événements purement mécaniques sans habillage narratif. Efficace mais sans personnalité.

Version intermédiaire : textes humoristiques sans conséquences cachées — les choix étaient trop lisibles et le joueur optimisait sans réfléchir.

Version retenue : **textes comiques + effets visibles + effets cachés + ordre de résolution qui compte**. Le joueur rit, réfléchit, et est parfois surpris.

---

## Structure d'un événement

Chaque carte d'événement suit un format fixe :

1. **Tag de catégorie** (Membre / Ressources / Externe / Stratégie)
2. **Titre** : la situation en une phrase, ton absurde
3. **Description** : contexte en 2 lignes, détail comique inclus
4. **2 à 3 choix** avec :
   - Libellé de l'action
   - Effet visible immédiat
   - Effet caché possible (non affiché)

---

## Les quatre catégories d'événements

### Membre
Concerne le recrutement, les rôles, les demandes personnelles des membres.

> *"Flamius veut changer de rôle. Il était tank, il veut DPS. Il a l'air confiant. Trop confiant."*

Choix types : Accepter / Refuser / Essai conditionnel

### Ressources
Concerne la banque de guilde, les marchands, le loot, les dépenses imprévues.

> *"Un marchand propose des potions premium à -60%. Elles sentent bizarre. Son cheval aussi."*

Choix types : Acheter en gros / Acheter prudemment / Ignorer

### Externe
Concerne les autres guildes, les événements du serveur, les personnages extérieurs.

> *"Zerkitos a parlé de votre guilde en stream. Il a dit 'ils existent encore ?'. 3 candidatures arrivent."*

Choix types : Recruter le meilleur / Recruter tous / Ignorer

### Stratégie
Concerne la préparation du prochain boss, les tactiques, l'analyse des échecs passés.

> *"Votre éclaireur revient du raid adverse. Il a pris des notes. Sur une serviette en papier. Au stylo bille."*

Choix types : Séance de strat / Tutoriel vidéo / Y aller au feeling

---

## La mécanique de sélection

Le jeu pioche 2 à 3 événements par inter-raid avec une **pondération contextuelle** :

- Si le moral est bas → priorité aux événements Membre
- Si la banque est vide → priorité aux événements Ressources
- Sinon → pioche aléatoire pondérée entre les 4 catégories

Le joueur voit tous les événements simultanément et choisit l'ordre de résolution — cet ordre peut modifier les options disponibles sur les événements suivants.

---

## Pourquoi c'est une bonne idée

- **Toujours 3 choix, jamais un bon et un mauvais** : chaque option est un trade-off réel entre différentes ressources ou valeurs (moral vs efficacité, court terme vs long terme)
- **Les effets cachés récompensent l'expérience** : le joueur expérimenté anticipe ce que le novice subit — courbe d'apprentissage organique
- **L'ordre de résolution crée de la profondeur tactique** sans complexité apparente
- **Le ton comique** rend les mauvaises nouvelles plaisantes à recevoir — on attend les événements de crise avec curiosité plutôt qu'appréhension
- **La pondération contextuelle** fait que le jeu répond aux états de crise avec des événements pertinents — renforce la cohérence narrative

---

## Ce à quoi il faut faire attention

- **Équilibre des choix** : si un choix domine systématiquement, le joueur mémorise la bonne réponse et la phase perd son intérêt. Chaque option doit rester viable selon le contexte.
- **Lisibilité des effets cachés** : ils doivent être devinables par un joueur attentif, pas aléatoires. Une potion qui "sent bizarre" doit pouvoir empoisonner — c'est un signal, pas une surprise injuste.
- **Volume du pool** : avec 2 à 3 événements par inter-raid et des runs de 1 à 2h, le joueur peut voir les mêmes événements souvent. Le pool doit être suffisamment large pour éviter la répétition perçue.
- **Cohérence du ton** : un événement trop sérieux parmi des événements absurdes brise l'ambiance. Même les crises graves doivent être présentées avec une touche d'humour.

---

## Schémas et prototypes

Un prototype de 4 cartes d'événements (une par catégorie) a été créé, illustrant :
- Le format visuel complet (tag, titre, description, choix avec effets)
- La hiérarchie d'information dans la carte
- Le ton et le niveau d'humour cible

*(voir widget interactif "salle_du_conseil_event_cards" généré en session)*

---

## Évolutions possibles

- **Événements multi-tours** : certains événements ne se résolvent pas immédiatement — ils créent une "situation en suspens" qui évolue sur plusieurs inter-raids
- **Événements liés aux membres** : si Flamius est dans la guilde, certains événements le mentionnent spécifiquement, renforçant l'attachement aux personnages
- **Synergies d'événements** : résoudre l'événement Externe avant l'événement Membre peut modifier les options du second (ex : si tu as recruté 3 nouveaux membres, un événement de "conflit d'intégration" peut apparaître)
- **Événements de saison** : événements spéciaux liés au patch en cours, qui récompensent les guildes qui progressent vite ou pénalisent celles qui stagnent
- **Mode "Chaos"** : variante roguelike où les effets de tous les choix sont cachés — pour les joueurs qui veulent une expérience plus imprévisible
