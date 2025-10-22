export type ScoringItem = {
  id: string;
  label: string;
  points: number; // positive for bonuses, negative for penalties if you use them
};

export const STARTING_POINTS = 2000;

export const basePoints = {
  pungKong: [
    {
      combo: "Eenvoudige stenen (2 t/m 8)",
      pungOpen: 2,
      pungClosed: 4,
      kongOpen: 8,
      kongClosed: 16,
    },
    {
      combo: "Hoekstenen (1 en 9)",
      pungOpen: 4,
      pungClosed: 8,
      kongOpen: 16,
      kongClosed: 32,
    },
  ],
  singles: [
    {
      label: "Een paar van draken, eigen wind of wind van de ronde",
      points: 2,
    },
    { label: "Mahjong", points: 20 },
    { label: "Mahjong met een zelf uit de muur gepakte steen", points: 2 },
    { label: "Mahjong met de enig mogelijke steen", points: 2 },
    {
      label: "Mahjong met de laatste steen een paar te completeren",
      points: 2,
    },
    {
      label:
        "Vogel (Pe-ling) — Mahjong met Kringen 1 indien men daarmee een paar met Bamboe 1 maakt",
      points: 10,
    },
  ],
} as const;

export const irregularLimits = [
  {
    name: "Negen poorten",
    description:
      "1,1,1,2,3,4,5,6,7,8,9,9,9 van één soort met één van deze dertien dubbel",
    points: 2000,
  },
  {
    name: "Dertien wezen",
    description:
      "Eén van alle enen, negens, winden en draken met één van deze dertien dubbel",
    points: 2000,
  },
  {
    name: "Windenslang",
    description:
      "1 t/m 9 van één soort, één van elke wind, met één van deze dertien dubbel",
    points: 1000,
  },
  {
    name: "Drakenslang",
    description: "1 t/m 9 van één soort, één van elke draak en één paar winden",
    points: 1000,
  },
  {
    name: "Hof van Peking",
    description:
      "1 t/m 7 van één soort, één van elke wind en één van elke draak",
    points: 1000,
  },
  {
    name: "Tweelingen van troefstenen",
    description: "Zeven paren van winden en/of draken",
    points: 2000,
  },
  {
    name: "Zuivere tweelingen",
    description: "Zeven paren van één soort",
    points: 1000,
  },
  {
    name: "Zeer schone tweelingen",
    description:
      "Zeven paren enen en negens van één soort plus winden en/of draken",
    points: 1000,
  },
  {
    name: "Schone tweelingen",
    description: "Zeven paren van één soort plus winden en/of draken",
    points: 500,
  },
  {
    name: "Zeven tweelingen",
    description: "Zeven willekeurige paren",
    points: 250,
  },
];

export const regularLimits = [
  {
    name: "Vier winden",
    description:
      "Mahjong met 4 pungs en/of kongs van winden met een willekeurig paar",
    points: 2000,
  },
  {
    name: "Drie draken",
    description:
      "Mahjong met 3 pungs en/of kongs van draken met een willekeurige chow of pung en een willekeurig paar",
    points: 2000,
  },
  {
    name: "Jade spel",
    description:
      "Mahjong met pungs/kongs/chows van uitsluitend groen gekleurde stenen (Bamboe 2,3,4,6,8 en Groene draak)",
    points: 2000,
  },
  {
    name: "Spel van de hemel",
    description: "Oost wint direct met de 14 gedeelde stenen",
    points: 2000,
  },
  {
    name: "Vier dichte kongs",
    description: "Mahjong met 4 dichte kongs met een willekeurig paar",
    points: 2000,
  },
  {
    name: "Kop en staart",
    description:
      "Mahjong met pungs/kongs van hoekstenen met een paar van hoekstenen",
    points: 2000,
  },
  {
    name: "Spel van de aarde",
    description: "Mahjong met de eerste door Oost weggelegde steen",
    points: 1000,
  },
  {
    name: "Kronkelende slang",
    description:
      "Mahjong met 1,1,1 + 2,2 + 3,4,5 + 6,7,8 + 9,9,9 of 1,1,1 + 2,3,4 + 5,5 + 6,7,8 + 9,9,9 of 1,1,1 + 2,3,4 + 5,6,7 + 8,8 + 9,9,9 — alle van één soort",
    points: 1000,
  },
] as const;

export const doublesWinner = [
  { name: "Vier chows", description: "Mahjong met 4 chows en een paar", x: 1 },
  { name: "Vier pungs", description: "Mahjong met 4 pungs en een paar", x: 1 },
  {
    name: "Pure eenvoud",
    description: "Mahjong met alleen stenen 2 t/m 8",
    x: 1,
  },
  {
    name: "Kleine vier winden",
    description:
      "Mahjong met 3 pungs/kongs winden met een paar winden en een willekeurige pung of chow",
    x: 1,
  },
  {
    name: "Kleine drie draken",
    description:
      "Mahjong met 2 pungs/kongs draken met een paar draken en willekeurige chows en/of pungs",
    x: 1,
  },
  {
    name: "Winnen van de bodem van de zee",
    description: "Mahjong met de laatste, zelf gepakte, steen van de muur",
    x: 1,
  },
  {
    name: "De maan van de bodem van de zee vissen",
    description:
      "Mahjong met de laatste, zelf gepakte, steen van de muur en deze steen is Kringen 1 (Circles 1)",
    x: 3,
  },
  {
    name: "Kongroof",
    description:
      "Mahjong met een steen die door een andere speler gebruikt wordt om een open pung te promoveren tot een kong",
    x: 1,
  },
  {
    name: "Kong met bloeiende bloemen",
    description:
      "Mahjong met de losse steen verkregen na het maken van een kong",
    x: 1,
  },
  {
    name: "De pruimenbloesem van het dak plukken",
    description:
      "Mahjong met de losse steen verkregen na het maken van een kong en deze steen is Kringen 5 (Circles 5)",
    x: 3,
  },
  {
    name: "Kong op kong",
    description: "Mahjong met de losse steen bij twee kongs in één beurt",
    x: 2,
  },
  {
    name: "Verborgen schat",
    description: "Mahjong met alleen zelf gepakte stenen",
    x: 2,
  },
] as const;

export const doublesAll: { name: string; x: number; note?: number }[] = [
  { name: "Pung of kong draken, eigen wind of wind van de ronde", x: 1 },
  { name: "3 dichte pungs (kong telt als dichte pung)", x: 1, note: 3 },
  { name: "4 dichte pungs (kong telt als dichte pung)", x: 2, note: 3 },
  { name: "3 dichte kongs", x: 2 },
  { name: "4 kongs", x: 3 },
  {
    name: "Schoon spel — stenen van één soort met winden en/of draken",
    x: 4,
    note: 1,
  },
  {
    name: "Zeer schoon — enen en/of negens van één soort met winden en/of draken",
    x: 4,
    note: 2,
  },
  { name: "Zuiver — alleen stenen van één soort", x: 4, note: 3 },
  { name: "Alleen winden en draken", x: 4, note: 3 },
] as const;

export const notes: Record<number, string> = {
  1: "Deze verdubbelingen mogen niet worden opgeteld.",
  2: "Deze verdubbelingen mogen niet worden opgeteld.",
  3: "Deze verdubbelingen mogen niet worden opgeteld.",
};
