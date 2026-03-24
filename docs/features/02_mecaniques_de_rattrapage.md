# Système 02 — Mécaniques de rattrapage (Rubber Band)

## Contexte

### Idée de base
Dans tout roguelike avec des systèmes interconnectés, une suite de défaites peut créer un "death spiral" — une spirale descendante dont il est impossible de sortir. Le joueur perd non pas parce qu'il joue mal, mais parce que le système s'emballe contre lui.

Il fallait donc intégrer des mécaniques qui s'activent **précisément quand le joueur est en difficulté**, sans pour autant le sauver automatiquement.

### Itérations
La première approche envisagée était des bonus mécaniques purs (ressources bonus, tentatives supplémentaires). Fonctionnel mais sans âme.

La version retenue tire parti du **ton humoristique du jeu** : les mécaniques de rattrapage sont des événements absurdes et comiques qui émergent naturellement du chaos de la guilde en déroute. La difficulté devient du contenu narratif.

---

## Les quatre mécaniques de rattrapage

### 1 — Le Héros du Désespoir
Quand la guilde est en difficulté, un membre aléatoire "pète un câble dans le bon sens" et devient temporairement surpuissant.

> *"Kévin3000, le mage AFK depuis 3 raids, se réveille soudainement et one-shot le boss par accident."*

- **Déclencheur** : X wipes consécutifs sur le même boss
- **Effet mécanique** : bonus massif sur une tentative
- **Contrepartie** : le membre retombe à son niveau normal après

### 2 — Le Recrutement Désespéré
Sous le seuil critique de membres actifs, des candidats improbables apparaissent — impossibles à recruter en temps normal.

> *"Un chasseur niveau 12 postule. Son message de candidature est juste : 'jai un chat'."*
> *"Un ancien membre banni revient avec des excuses (peut-être)."*

- **Déclencheur** : guilde sous le seuil de masse critique
- **Effet mécanique** : profils risqués mais potentiellement game-changing
- **Contrepartie** : ces membres ont souvent des traits négatifs marqués

### 3 — Le Rage Quit inversé
Quand le moral collectif est au plus bas, certains membres deviennent irrationnellement motivés par la honte plutôt que de partir.

> *"Après le 8ème wipe, Pandapower écrit 'ON Y RETOURNE' en majuscules. Le groupe est galvanisé."*

- **Déclencheur** : moral collectif sous un seuil critique
- **Effet mécanique** : regain temporaire de moral pour toute la guilde
- **Contrepartie** : effet de courte durée, n'empêche pas la chute si rien ne change

### 4 — L'Événement Externe Absurde
Des événements aléatoires arrivent uniquement en situation de crise.

> *"Un streamer mentionne votre guilde par erreur. Vous recevez 5 candidatures dont une semble compétente."*
> *"La banque a été vidée par erreur. Le coupable rembourse le double par culpabilité."*
> *"Un boss bug et meurt tout seul. Les membres débattent encore si ça compte."*

- **Déclencheur** : combinaison de conditions défavorables simultanées
- **Effet mécanique** : variable — peut résoudre une crise ou en créer une nouvelle
- **Contrepartie** : totalement imprévisible, pas fiable comme plan de secours

---

## Pourquoi c'est une bonne idée

- Les mécaniques de rattrapage sont **visibles avant la crise** : le joueur sait qu'elles existent et garde espoir
- Leur forme est **aléatoire** : la surprise reste entière à chaque run
- Elles sont **insuffisantes seules** : elles donnent une chance, pas une victoire automatique — la victoire reste méritée
- Le ton comique transforme les moments de crise en **pics d'émotion positifs** plutôt qu'en frustration pure
- Elles créent des **histoires mémorables** que le joueur voudra raconter ("ma guilde s'est sauvée grâce à Kévin")

---

## Ce à quoi il faut faire attention

- **Ne pas les rendre trop puissantes** : si le rubber band sauve systématiquement le joueur, il n'y a plus de tension. Ce sont des bouées, pas des hélicoptères de secours.
- **Ne pas les déclencher trop tôt** : si elles apparaissent au premier wipe, elles perdent leur caractère exceptionnel. Les seuils de déclenchement doivent être calibrés finement.
- **Cohérence narrative** : le ton absurde doit rester cohérent. Un événement trop sérieux au milieu des mécaniques comiques casserait l'ambiance.
- **Lisibilité** : le joueur doit comprendre pourquoi l'événement s'est déclenché. Un rubber band qui arrive "de nulle part" sera perçu comme du hasard pur, pas comme un système.

---

## Schémas et prototypes

Les mécaniques de rattrapage sont intégrées dans la boucle de jeu principale :
- Le chemin "Wipe → Événement comique → Salle du Conseil" représente leur point d'insertion dans le flux
- Elles ne court-circuitent pas la boucle — elles s'y greffent comme une branche conditionnelle

*(voir diagramme interactif "guild_game_loop" généré en session)*

---

## Évolutions possibles

- **Rubber band mémorisé** : si Kévin a déjà sauvé la guilde une fois, il devient un personnage récurrent avec une "légende" qui grandit à chaque run
- **Choix du rubber band** : présenter deux options de rattrapage au joueur (ex : "Le Héros du Désespoir" ou "Le Recrutement Désespéré") pour garder de l'agentivité
- **Rubber band négatif** : une mécanique symétrique qui complique les runs trop faciles — le jeu détecte que le joueur est en avance et crée des événements déstabilisants
- **Débloquer des rubber bands via la méta-progression** : certains types d'événements de rattrapage se débloquent avec les Legs de Guilde entre les runs
