export type Universe = 'fire' | 'police';
export type Story = {
  id: string; universe: Universe; title: string; subtitle: string;
  icon: string; paragraphs: string[];
};

// Fiction originale intégrée. Aucun appel IA et aucune donnée enfant.
export const stories: Story[] = [
  {
    id: 'eclair-lanterne', universe: 'fire', icon: '🚒',
    title: 'Éclair et la petite lumière',
    subtitle: 'Une soirée toute douce à la caserne des Tilleuls.',
    paragraphs: [
      'Au village des Tilleuls, le soir colorait les maisons en rose. Dans la cour de la caserne, le camion Éclair se reposait. Ses grandes roues étaient propres, ses tuyaux bien rangés. Près de lui, Nougat, le chat roux de la caserne, faisait sa toilette.',
      'Mina, une enfant du village, arriva avec son papa. Ils venaient rendre une lanterne à Léa, la pompière. Mina aimait regarder Éclair depuis le petit banc des visiteurs. Le camion avait une étoile jaune peinte sur sa portière. « Bonsoir, Éclair », murmura-t-elle.',
      'Léa sortit de la caserne avec une boîte. « Ce soir, nous préparons la fête des lanternes. Veux-tu choisir la couleur de celle qui restera sur notre table ? » Mina choisit le jaune, comme l’étoile du camion. Son papa posa la lanterne à piles sur la table. Elle brillait sans flamme, doucement.',
      'Mais Nougat avait disparu. On apercevait seulement sa queue derrière un pot de fleurs. Puis on entendit un petit miaulement. « Il a trouvé quelque chose », dit Léa. Derrière le pot, un escargot avançait sur une feuille. Nougat le regardait avec de grands yeux ronds.',
      '« Il cherche peut-être un coin tranquille », dit Mina. Léa déplaça doucement le pot pour dégager le chemin. Mina resta avec son papa et regarda l’escargot continuer sa promenade. Il allait très lentement. Si lentement que Nougat finit par s’asseoir.',
      'La lanterne jaune éclairait maintenant la table. Léa vérifia le matériel avec son collègue, Sami. Les interventions et les outils étaient le travail des pompiers adultes. Mina, elle, avait une autre idée : dessiner une petite maison pour l’escargot. Son papa lui donna une feuille et un crayon.',
      'Elle dessina une maison ronde, un jardin et une toute petite boîte aux lettres. « Pour recevoir des lettres d’escargots ! » Léa sourit. Nougat vint se coucher près du banc, les pattes repliées. Le village devenait silencieux. Dans un arbre, un oiseau chanta une dernière fois.',
      'Il était temps de rentrer. Mina salua Léa, Sami et le camion Éclair. Son dessin resta sur le tableau de la caserne. Sur le chemin, elle marcha à côté de son papa. Une fenêtre s’alluma, puis une autre. Les maisons semblaient se souhaiter bonne nuit.',
      'À la caserne, Nougat ferma les yeux. La lanterne jaune brillait encore un peu. Éclair attendait tranquillement le lendemain. Et dans le jardin, tout près du pot de fleurs, un escargot s’endormit à l’abri d’une feuille. Bonne nuit, les Tilleuls.'
    ],
  },
  {
    id: 'enquete-doudou', universe: 'police', icon: '🚓',
    title: 'Le mystère du doudou bleu',
    subtitle: 'Une petite enquête au village des Tilleuls.',
    paragraphs: [
      'Ce matin-là, le village des Tilleuls sentait le pain chaud. Mina et son papa allaient à la bibliothèque. Sous le grand arbre de la place, un petit lapin bleu était assis tout seul. C’était un doudou, avec une oreille pliée et un ruban couleur de soleil.',
      '« Quelqu’un doit le chercher », dit Mina. Son papa resta avec elle et regarda autour de la place. Près de la mairie, Nora, la policière du village, discutait avec la bibliothécaire. Ils allèrent ensemble lui parler. Nora écouta Mina, puis regarda le petit lapin.',
      '« Nous allons le garder ici, à l’accueil de la mairie, pendant que nous cherchons sa famille », expliqua Nora. Elle posa le doudou dans une petite corbeille propre, derrière son bureau. Mina ne partit pas chercher toute seule : elle resta avec son papa. Ils avaient justement rendez-vous à la bibliothèque.',
      'Sur le chemin, Mina remarqua une plume. « Un indice ? » demanda-t-elle. Son papa sourit. « Peut-être simplement une plume de pigeon. » Un pigeon gris passa près de la fontaine, d’un pas très sérieux. Mina rit. Tout n’était pas forcément un indice dans une enquête.',
      'À la bibliothèque, la bibliothécaire installait des coussins pour la lecture du matin. Il y avait un coussin vert, un coussin rouge et un coussin jaune. Sur le jaune était assis un petit garçon avec sa maman. Il regardait dans son sac, puis sous son manteau.',
      '« Tu cherches quelque chose ? » demanda la bibliothécaire. « Mon lapin », répondit le garçon. « Il est bleu, avec une oreille qui ne tient pas droite. » Mina regarda son papa. C’était peut-être le même ! Son papa expliqua à la maman qu’un doudou attendait à l’accueil de la mairie.',
      'La maman accompagna son petit garçon à la mairie. Nora les accueillit. Le garçon reconnut tout de suite le ruban jaune de son lapin. Il serra son doudou contre lui. « Il s’appelle Biscuit », dit-il. Nora était contente que cette petite recherche se termine bien.',
      'Quand ils revinrent à la bibliothèque, Mina avait choisi un livre sur les oiseaux. Le garçon s’installa près de sa maman, avec Biscuit sur ses genoux. La bibliothécaire ouvrit un grand album. Tous les coussins avaient maintenant trouvé quelqu’un à accueillir.',
      'Plus tard, Mina et son papa passèrent devant la caserne. Nougat, le chat roux, dormait près du camion Éclair, celui qui avait une étoile jaune sur la portière. Mina raconta doucement l’aventure du doudou. Nougat remua une oreille, sans ouvrir les yeux. Le village pouvait continuer sa journée tranquillement.'
    ],
  },
];

export const approvalVersion = 2;
export const words = (story: Story) => story.paragraphs.join(' ').split(/\s+/).length;
export const estimatedMinutes = (story: Story) => Math.max(1, Math.round(words(story) / 115));
