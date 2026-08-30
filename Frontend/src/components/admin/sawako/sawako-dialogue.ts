import type { SawakoLine } from './types';

export const POKE_LINES: SawakoLine[] = [
  {
    text: "B-Baka! Don't poke me~",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "Eep! Hands off my ribbon!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "Y-You're teasing me again...!",
    expression: "pout",
    symbol: "sweat",
  },
  {
    text: "Hmph! Look at the dashboard, not me!",
    expression: "smug",
    symbol: "question",
  },
  {
    text: "M-My cheeks are not squish toys!",
    expression: "pout",
    symbol: "heart",
  },
  {
    text: "W-What is it, Admin-san...?",
    expression: "normal",
    symbol: "sparkle",
  },
];

export const DIZZY_LINES: SawakoLine[] = [
  {
    text: "Wahh! S-Spinning... @.@",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "M-Mercy! My ribbon is tangled! @.@",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "Too fast! Everything is floating... @.@",
    expression: "dizzy",
    symbol: "sweat",
  },
];

export const DRAG_LINES: SawakoLine[] = [
  {
    text: "Kyaa! Put me down gently!",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "W-Where are you taking me?!",
    expression: "pout",
    symbol: "anger",
  },
];

export const DROP_LINES: SawakoLine[] = [
  {
    text: "Oof! Safe landing~",
    expression: "happy",
    symbol: "sparkle",
  },
  {
    text: "Hmph, I'll watch you from here!",
    expression: "smug",
    symbol: "sparkle",
  },
];

export const ROUTE_LINES: Record<string, SawakoLine[]> = {
  "/admin/dashboard": [
    {
      text: "Admin-san, ganbatte!",
      expression: "happy",
      symbol: "sparkle",
    },
    {
      text: "Dashboard looks tidy today~",
      expression: "normal",
      symbol: "none",
    },
  ],
  "/admin/users": [
    {
      text: "Keep our bidders safe, okay?",
      expression: "normal",
      symbol: "none",
    },
    {
      text: "No suspicious accounts allowed!",
      expression: "smug",
      symbol: "sparkle",
    },
  ],
  "/admin/products": [
    {
      text: "So many shiny treasures today~",
      expression: "happy",
      symbol: "sparkle",
    },
    {
      text: "Check item reserve prices, hmph!",
      expression: "pout",
      symbol: "none",
    },
  ],
  "/admin/seller-applications": [
    {
      text: "New merchants waiting for review!",
      expression: "pout",
      symbol: "question",
    },
    {
      text: "Be a fair auditor, Admin-san~",
      expression: "normal",
      symbol: "sparkle",
    },
  ],
  "/admin/categories": [
    {
      text: "Keep the catalog neat and pretty~",
      expression: "normal",
      symbol: "none",
    },
  ],
  "/admin/visitor-analytics": [
    {
      text: "Look at all those visitors! Wow~",
      expression: "happy",
      symbol: "sparkle",
    },
  ],
};

export const IDLE_LINES: SawakoLine[] = [
  {
    text: "Staring again? G-Get to work!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "*Yawn*... I-I wasn't napping!",
    expression: "sleepy",
    symbol: "zzz",
  },
  {
    text: "You're doing great today... maybe.",
    expression: "happy",
    symbol: "heart",
  },
  {
    text: "Need some green tea, Admin-san?",
    expression: "normal",
    symbol: "sparkle",
  },
];
