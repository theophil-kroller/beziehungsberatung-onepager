export const imagePresets = [
  {
    "id": "circle-floor",
    "label": "Sharing Circle · am Boden",
    "url": "public/landingpage/circle-floor.webp",
    "alt": "Sechs Menschen sitzen im Kreis am Boden und tauschen sich aus."
  },
  {
    "id": "duo-women",
    "label": "Duo · zwei Frauen",
    "url": "public/landingpage/duo-women.webp",
    "alt": "Zwei Frauen sitzen einander zugewandt im Gespräch."
  },
  {
    "id": "duo-woman-man",
    "label": "Duo · Frau und Mann",
    "url": "public/landingpage/duo-woman-man.webp",
    "alt": "Eine Frau und ein Mann sitzen am Boden im Gespräch."
  },
  {
    "id": "duo-abstract",
    "label": "Duo · abstrakt",
    "url": "public/landingpage/duo-abstract.webp",
    "alt": "Zwei abstrakte menschliche Silhouetten wenden sich einander zu."
  },
  {
    "id": "circle-chairs",
    "label": "Sharing Circle · Stühle",
    "url": "public/landingpage/circle-chairs.webp",
    "alt": "Sechs Menschen sitzen auf Stühlen in einem Gesprächskreis."
  },
  {
    "id": "movement",
    "label": "Bewegung & Tanz",
    "url": "public/landingpage/movement.webp",
    "alt": "Eine Gruppe bewegt sich frei und tänzerisch."
  }
];
export const defaultImage = imagePresets[0];
export const isPresetUrl = value => imagePresets.some(p => p.url === value);
