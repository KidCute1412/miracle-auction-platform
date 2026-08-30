import type { SawakoLine } from './types';

export const POKE_LINES: SawakoLine[] = [
  {
    text: "H-Hey! Don't touch me so casually, b-baka!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "I'm busy auditing the auction records! Stop poking my cheeks!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "Keep poking me and I'll revoke your admin privileges... j-just kidding, but stop!",
    expression: "pout",
    symbol: "sweat",
  },
  {
    text: "Myaah?! My ears are sensitive, watch where your cursor goes!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "It's not like I enjoy you clicking on me or anything... hmph!",
    expression: "pout",
    symbol: "heart",
  },
  {
    text: "Are you inspecting the merchandise or inspecting me?! Focus on the dashboard!",
    expression: "smug",
    symbol: "question",
  },
];

export const DIZZY_LINES: SawakoLine[] = [
  {
    text: "Wh-whoaaaa! Stop clicking so fast, the whole room is spinning! @.@",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "M-Mercy! My cat ears are tangled up! Have some decorum, admin!",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "A-Auctions... bids... gold coins... everything is floating away...",
    expression: "dizzy",
    symbol: "sweat",
  },
];

export const DRAG_LINES: SawakoLine[] = [
  {
    text: "Kyaa! Put me down! You're dragging Chief Auditor Sawako like a ragdoll!",
    expression: "dizzy",
    symbol: "sweat",
  },
  {
    text: "W-Where are we relocating my audit desk?! Don't drop me!",
    expression: "pout",
    symbol: "anger",
  },
];

export const DROP_LINES: SawakoLine[] = [
  {
    text: "Oof! Safe landing... A-Any other place would be fine, I guess!",
    expression: "smug",
    symbol: "sparkle",
  },
  {
    text: "Hmph, good spot. I have an even better angle to monitor your work now.",
    expression: "happy",
    symbol: "sparkle",
  },
];

export const ROUTE_LINES: Record<string, SawakoLine[]> = {
  "/admin/dashboard": [
    {
      text: "Revenue analytics looking sharp! Don't get arrogant just because numbers are green!",
      expression: "smug",
      symbol: "sparkle",
    },
    {
      text: "Checking the overview? Good, an attentive admin is slightly less troublesome.",
      expression: "normal",
      symbol: "none",
    },
  ],
  "/admin/users": [
    {
      text: "Reviewing users? Keep an eye out for shady bidders and banned accounts!",
      expression: "normal",
      symbol: "none",
    },
    {
      text: "Hmph, make sure our community stays prestigious. No low-ballers allowed!",
      expression: "smug",
      symbol: "sparkle",
    },
  ],
  "/admin/products": [
    {
      text: "Look at all these luxury auctions... N-Not that I want any rare antiques, hmph!",
      expression: "pout",
      symbol: "sparkle",
    },
    {
      text: "Ensure all auction reserve prices and descriptions meet Vanguard standards!",
      expression: "normal",
      symbol: "none",
    },
  ],
  "/admin/seller-applications": [
    {
      text: "Seller applications are waiting! Don't leave eager merchants hanging!",
      expression: "pout",
      symbol: "question",
    },
    {
      text: "Audit their business documents carefully. Sawako's reputation is on the line!",
      expression: "smug",
      symbol: "sparkle",
    },
  ],
  "/admin/categories": [
    {
      text: "Organizing categories? Keep it tidy, a messy catalog gives me a headache!",
      expression: "normal",
      symbol: "none",
    },
  ],
  "/admin/visitor-analytics": [
    {
      text: "Look at that traffic! If servers crash under high bids, you're explaining it to the boss!",
      expression: "pout",
      symbol: "sweat",
    },
  ],
};

export const IDLE_LINES: SawakoLine[] = [
  {
    text: "Are you staring at me? G-Get back to managing the auctions!",
    expression: "pout",
    symbol: "anger",
  },
  {
    text: "*Yawn*... N-No, I wasn't napping on duty! My eyes were merely resting!",
    expression: "sleepy",
    symbol: "zzz",
  },
  {
    text: "If you work extra hard today, maybe I'll praise you... m-maybe!",
    expression: "happy",
    symbol: "heart",
  },
  {
    text: "Everything is running smoothly so far. Don't jinx it!",
    expression: "normal",
    symbol: "sparkle",
  },
];
