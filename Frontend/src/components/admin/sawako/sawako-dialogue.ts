import type { SawakoLine } from './types';

export const POKE_LINES: SawakoLine[] = [
  {
    text: "Eep! D-Did you just poke me...?",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "Kyaa! S-Surprise attack...? >///<",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "M-My face is getting warm... baka!",
    expression: "shy",
    symbol: "sweat",
  },
  {
    text: "A-Admin-san, no teasing while on duty...",
    expression: "shy",
    symbol: "sweat",
  },
  {
    text: "M-My cheeks are not squish toys!",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "B-Baka! Don't poke me~",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "W-What is it, Admin-san...?",
    expression: "normal",
    symbol: "sparkle",
  },
];

export const STAR_CLIP_LINES: SawakoLine[] = [
  {
    text: "Eep! Hands off my star clip, it's precious!",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "Kyaa! D-Don't touch my hairpins, baka~!",
    expression: "shy",
    symbol: "sweat",
  },
  {
    text: "W-Wait! Nobody touches my star clip!",
    expression: "pout",
    symbol: "heart",
  },
  {
    text: "Does... does the star clip look pretty on me?",
    expression: "shy",
    symbol: "sparkle",
  },
];

export const HEADPAT_LINES: SawakoLine[] = [
  {
    text: "Ehehe... it feels so warm... Kazehaya-kun... wait, Admin-san?! >///<",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "Are you praising me...? I-I will do my absolute best today!",
    expression: "happy",
    symbol: "sparkle",
  },
  {
    text: "H-Headpats are unfair... my heart won't stop fluttering...",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "Does my hair feel soft...? T-Thank you, Admin-san~",
    expression: "happy",
    symbol: "sparkle",
  },
];

export const HAND_POKE_LINES: SawakoLine[] = [
  {
    text: "E-Eep! Don't hold my hands, baka~!",
    expression: "pout",
    symbol: "heart",
  },
  {
    text: "Kyaa! My hands are cold like a ghost...!",
    expression: "pout",
    symbol: "sweat",
  },
  {
    text: "H-Hey! Hands to yourself, Admin-san!",
    expression: "pout",
    symbol: "anger",
  },
];

export const FOOT_POKE_LINES: SawakoLine[] = [
  {
    text: "Wahh! Ticklish! Don't touch my feet~!",
    expression: "pout",
    symbol: "sweat",
  },
  {
    text: "Eep! G-Ghosts don't like tickles!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "M-My dress hem is fluttering... baka!",
    expression: "pout",
    symbol: "heart",
  },
];

export const DIZZY_LINES: SawakoLine[] = [
  {
    text: "Wahh! S-Spinning... @.@",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "M-Mercy! My star clip is spinning! @.@",
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
    text: "Kyaa! P-Please put me down gently...",
    expression: "shy",
    symbol: "heart",
  },
  {
    text: "W-Where are you taking me?!",
    expression: "shy",
    symbol: "sweat",
  },
  {
    text: "M-My dress is fluttering... don't look!",
    expression: "shy",
    symbol: "heart",
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
    {
      text: "Let's monitor today's live auctions together!",
      expression: "happy",
      symbol: "sparkle",
    },
  ],
  "/admin/trash": [
    {
      text: "Eep! The recycle bin... let's be careful with deletions!",
      expression: "pout",
      symbol: "sweat",
    },
    {
      text: "W-Wait, are you sure about discarding these items...?",
      expression: "shy",
      symbol: "question",
    },
  ],
  "/admin/product": [
    {
      text: "So many shiny treasures up for auction~",
      expression: "happy",
      symbol: "sparkle",
    },
    {
      text: "Check item reserve prices carefully, hmph!",
      expression: "pout",
      symbol: "none",
    },
    {
      text: "Ooh, rare collectibles! Can I bid? Just kidding~",
      expression: "happy",
      symbol: "heart",
    },
  ],
  "/admin/category": [
    {
      text: "Keep the catalog neat and pretty~",
      expression: "normal",
      symbol: "none",
    },
    {
      text: "Organizing auction aisles is like tidying a library!",
      expression: "happy",
      symbol: "sparkle",
    },
  ],
  "/admin/user": [
    {
      text: "Keep our bidders safe and verified, okay?",
      expression: "normal",
      symbol: "none",
    },
    {
      text: "No suspicious accounts allowed on our watch!",
      expression: "smug",
      symbol: "sparkle",
    },
    {
      text: "Sawako guardian protocol: Protect honest users!",
      expression: "happy",
      symbol: "sparkle",
    },
  ],
  "/admin/seller": [
    {
      text: "New merchant applications waiting for review!",
      expression: "pout",
      symbol: "question",
    },
    {
      text: "Be a fair and righteous auditor, Admin-san~",
      expression: "normal",
      symbol: "sparkle",
    },
    {
      text: "Strict inspection! Only trustworthy merchants pass!",
      expression: "smug",
      symbol: "sparkle",
    },
  ],
  "/admin/visitor-analytics": [
    {
      text: "Look at all those visitors! Wow~",
      expression: "happy",
      symbol: "sparkle",
    },
    {
      text: "The auction platform is bustling with energy today!",
      expression: "happy",
      symbol: "sparkle",
    },
  ],
  "/admin/profile": [
    {
      text: "A-Admin-san's profile... looking great today >///<",
      expression: "shy",
      symbol: "heart",
    },
    {
      text: "Keeping your admin credentials safe and secure!",
      expression: "normal",
      symbol: "sparkle",
    },
  ],
};

export const SIPPING_TEA_LINES: SawakoLine[] = [
  {
    text: "*Sip*... Warm green tea is the best, Admin-san~ 🍵",
    expression: "happy",
    symbol: "sparkle",
  },
  {
    text: "Need some green tea, Admin-san? It calms the mind ✨",
    expression: "happy",
    symbol: "heart",
  },
  {
    text: "Rest a bit, Admin-san... *sips tea gently* 🍵",
    expression: "happy",
    symbol: "sparkle",
  },
  {
    text: "The tea steam smells so soothing... ehehe~",
    expression: "shy",
    symbol: "heart",
  },
];

export const IDLE_LINES: SawakoLine[] = [
  {
    text: "*Sip*... Warm green tea is the best, Admin-san~ 🍵",
    expression: "happy",
    symbol: "sparkle",
  },
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
    expression: "happy",
    symbol: "sparkle",
  },
  {
    text: "Admin-san is focused... I'll watch quietly~",
    expression: "normal",
    symbol: "sparkle",
  },
];
