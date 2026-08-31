import type { SawakoLine, SawakoTimeOfDay } from "./types";

export type CelestialArchetype =
  | "midnight_moon"
  | "cloud_moon"
  | "nebula"
  | "comet"
  | "venus"
  | "dawn_horizon"
  | "sunrise"
  | "morning_dew"
  | "joyful_sun"
  | "halo_sun"
  | "sakura_sun"
  | "zenith_diamond"
  | "solaris_crown"
  | "siesta_cloud"
  | "teatime_sun"
  | "amber_leaf"
  | "apricot_sun"
  | "sunset_ember"
  | "coral_dusk"
  | "evening_star"
  | "silver_moon"
  | "lantern_moon"
  | "azure_moon"
  | "dream_moon";

export interface HourlyTheme {
  hour: number;
  timeLabel: string;
  name: string;
  category: SawakoTimeOfDay;
  archetype: CelestialArchetype;
  haloColors: [string, string, string];
  coreColors: [string, string];
  strokeColor: string;
  accentColor: string;
  glowRgba: string;
  dialogue: SawakoLine;
}

export const HOURLY_THEMES: Record<number, HourlyTheme> = {
  0: {
    hour: 0,
    timeLabel: "00:00",
    name: "Midnight Zenith Moon",
    category: "night",
    archetype: "midnight_moon",
    haloColors: ["#C7D2FE", "#818CF8", "#4338CA"],
    coreColors: ["#FFFFFF", "#C7D2FE"],
    strokeColor: "#A5B4FC",
    accentColor: "#E0E7FF",
    glowRgba: "rgba(165, 180, 252, 0.75)",
    dialogue: {
      text: "0h đêm rồi! Trăng rằm nửa đêm và sao Bắc Cực đang canh gác cùng Admin-san nè~ 🌙",
      expression: "sleepy",
      symbol: "zzz",
    },
  },
  1: {
    hour: 1,
    timeLabel: "01:00",
    name: "Slumber Cloud Moon",
    category: "night",
    archetype: "cloud_moon",
    haloColors: ["#DDD6FE", "#A78BFA", "#6D28D9"],
    coreColors: ["#F5F3FF", "#DDD6FE"],
    strokeColor: "#C4B5FD",
    accentColor: "#EDE9FE",
    glowRgba: "rgba(196, 181, 253, 0.7)",
    dialogue: {
      text: "1h sáng rồi, trăng cũng đang tựa gối mây ngủ khì... Admin-san đừng thức khuya quá nha! ☁️",
      expression: "sleepy",
      symbol: "zzz",
    },
  },
  2: {
    hour: 2,
    timeLabel: "02:00",
    name: "Witching Hour Nebula",
    category: "night",
    archetype: "nebula",
    haloColors: ["#E879F9", "#818CF8", "#312E81"],
    coreColors: ["#F0ABFC", "#6366F1"],
    strokeColor: "#C084FC",
    accentColor: "#F472B6",
    glowRgba: "rgba(192, 132, 252, 0.8)",
    dialogue: {
      text: "2h sáng... Tinh vân vũ trụ huyền bí đang tỏa sáng kỳ ảo! Admin-san vẫn còn code sao? ✨",
      expression: "shy",
      symbol: "sparkle",
    },
  },
  3: {
    hour: 3,
    timeLabel: "03:00",
    name: "Shooting Star Comet",
    category: "night",
    archetype: "comet",
    haloColors: ["#67E8F9", "#06B6D4", "#0E7490"],
    coreColors: ["#ECFEFF", "#67E8F9"],
    strokeColor: "#22D3EE",
    accentColor: "#A5F3FC",
    glowRgba: "rgba(34, 211, 238, 0.8)",
    dialogue: {
      text: "Oa, 3h sáng có sao băng vút qua kìa! Admin-san mau ước một điều ước đi nào~ 🌠",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  4: {
    hour: 4,
    timeLabel: "04:00",
    name: "Pre-Dawn Venus",
    category: "night",
    archetype: "venus",
    haloColors: ["#A7F3D0", "#34D399", "#059669"],
    coreColors: ["#ECFDF5", "#6EE7B7"],
    strokeColor: "#10B981",
    accentColor: "#D1FAE5",
    glowRgba: "rgba(52, 211, 153, 0.75)",
    dialogue: {
      text: "4h sáng rồi! Sao Mai (Venus) lấp lánh báo hiệu bình minh sắp ghé thăm rồi đó! 💎",
      expression: "normal",
      symbol: "sparkle",
    },
  },
  5: {
    hour: 5,
    timeLabel: "05:00",
    name: "Dawn Horizon Glow",
    category: "day",
    archetype: "dawn_horizon",
    haloColors: ["#FED7AA", "#F472B6", "#818CF8"],
    coreColors: ["#FFF7ED", "#FDBA74"],
    strokeColor: "#FB923C",
    accentColor: "#F472B6",
    glowRgba: "rgba(251, 146, 60, 0.75)",
    dialogue: {
      text: "5h sáng rạng đông hé rạng... Bầu trời chuyển sắc cam tím tuyệt đẹp, chào ngày mới! 🌅",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  6: {
    hour: 6,
    timeLabel: "06:00",
    name: "Sunrise Awakening",
    category: "day",
    archetype: "sunrise",
    haloColors: ["#FEF08A", "#F97316", "#DC2626"],
    coreColors: ["#FEF9C3", "#F97316"],
    strokeColor: "#EA580C",
    accentColor: "#FDE047",
    glowRgba: "rgba(234, 88, 12, 0.8)",
    dialogue: {
      text: "6h sáng bình minh bừng sáng! Vươn vai hít thở không khí trong lành cùng Sawako nào! ☀️",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  7: {
    hour: 7,
    timeLabel: "07:00",
    name: "Morning Dew Sparkle",
    category: "day",
    archetype: "morning_dew",
    haloColors: ["#BAE6FD", "#38BDF8", "#0284C7"],
    coreColors: ["#F0F9FF", "#7DD3FC"],
    strokeColor: "#0284C7",
    accentColor: "#FDE047",
    glowRgba: "rgba(56, 189, 248, 0.75)",
    dialogue: {
      text: "7h sáng sớm mai trong trẻo, giọt sương mai lấp lánh như ngọc! Admin-san ăn sáng chưa? 💧",
      expression: "happy",
      symbol: "heart",
    },
  },
  8: {
    hour: 8,
    timeLabel: "08:00",
    name: "Joyful Energetic Sun",
    category: "day",
    archetype: "joyful_sun",
    haloColors: ["#FEF08A", "#FBBF24", "#F59E0B"],
    coreColors: ["#FEF9C3", "#FBBF24"],
    strokeColor: "#F59E0B",
    accentColor: "#F472B6",
    glowRgba: "rgba(245, 158, 11, 0.75)",
    dialogue: {
      text: "8h sáng bắt đầu phiên làm việc tràn đầy năng lượng! Cố gắng hết mình nha Admin-san! 💪",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  9: {
    hour: 9,
    timeLabel: "09:00",
    name: "Golden Halo Sun",
    category: "day",
    archetype: "halo_sun",
    haloColors: ["#FEF9C3", "#FDE047", "#CA8A04"],
    coreColors: ["#FFFFFF", "#FACC15"],
    strokeColor: "#EAB308",
    accentColor: "#FEF08A",
    glowRgba: "rgba(234, 179, 8, 0.8)",
    dialogue: {
      text: "9h sáng ánh kim vàng rực rỡ! Hào quang thái dương đang tiếp thêm may mắn cho bạn đó! 👑",
      expression: "smug",
      symbol: "sparkle",
    },
  },
  10: {
    hour: 10,
    timeLabel: "10:00",
    name: "Spring Sakura Sun",
    category: "day",
    archetype: "sakura_sun",
    haloColors: ["#FCE7F3", "#F472B6", "#DB2777"],
    coreColors: ["#FFF1F2", "#FBCFE8"],
    strokeColor: "#EC4899",
    accentColor: "#F472B6",
    glowRgba: "rgba(236, 72, 153, 0.75)",
    dialogue: {
      text: "10h sáng nắng ấm thơm ngát... Những cánh hoa anh đào phấn hồng đang lượn bay theo gió nè~ 🌸",
      expression: "happy",
      symbol: "heart",
    },
  },
  11: {
    hour: 11,
    timeLabel: "11:00",
    name: "Zenith Solar Diamond",
    category: "day",
    archetype: "zenith_diamond",
    haloColors: ["#E0E7FF", "#A5B4FC", "#6366F1"],
    coreColors: ["#FFFFFF", "#C7D2FE"],
    strokeColor: "#6366F1",
    accentColor: "#FDE047",
    glowRgba: "rgba(99, 102, 241, 0.75)",
    dialogue: {
      text: "11h trưa ánh sáng hội tụ lấp lánh như kim cương lăng kính! Sắp đến giờ nghỉ trưa rồi! 💎",
      expression: "normal",
      symbol: "sparkle",
    },
  },
  12: {
    hour: 12,
    timeLabel: "12:00",
    name: "High Noon Solaris Crown",
    category: "day",
    archetype: "solaris_crown",
    haloColors: ["#FEF08A", "#F59E0B", "#B45309"],
    coreColors: ["#FEF9C3", "#F59E0B"],
    strokeColor: "#D97706",
    accentColor: "#FBBF24",
    glowRgba: "rgba(217, 119, 6, 0.8)",
    dialogue: {
      text: "12h trưa tròn bóng, vương miện mặt trời chói lọi! Admin-san đi ăn trưa nạp lại năng lượng nhé! 🍱",
      expression: "happy",
      symbol: "heart",
    },
  },
  13: {
    hour: 13,
    timeLabel: "13:00",
    name: "Lazy Afternoon Cloud",
    category: "day",
    archetype: "siesta_cloud",
    haloColors: ["#CFFAFE", "#7DD3FC", "#38BDF8"],
    coreColors: ["#F0FDFA", "#BAE6FD"],
    strokeColor: "#0284C7",
    accentColor: "#FDE047",
    glowRgba: "rgba(56, 189, 248, 0.7)",
    dialogue: {
      text: "13h chiều nắng êm dịu, mây trắng lơ lửng... Sawako cũng thấy hơi buồn ngủ rồi nga~ 😴",
      expression: "sleepy",
      symbol: "zzz",
    },
  },
  14: {
    hour: 14,
    timeLabel: "14:00",
    name: "Teatime Honey Sun",
    category: "day",
    archetype: "teatime_sun",
    haloColors: ["#FEF3C7", "#F59E0B", "#92400E"],
    coreColors: ["#FFFBEB", "#FCD34D"],
    strokeColor: "#B45309",
    accentColor: "#F59E0B",
    glowRgba: "rgba(180, 83, 9, 0.75)",
    dialogue: {
      text: "14h chiều trà ấm mật ong thơm phức! Uống một tách matcha cùng Sawako cho tỉnh táo nhé! 🍵",
      expression: "happy",
      symbol: "heart",
    },
  },
  15: {
    hour: 15,
    timeLabel: "15:00",
    name: "Amber Leaf Sun",
    category: "day",
    archetype: "amber_leaf",
    haloColors: ["#FFEDD5", "#FB923C", "#C2410C"],
    coreColors: ["#FFF7ED", "#FDBA74"],
    strokeColor: "#EA580C",
    accentColor: "#FBBF24",
    glowRgba: "rgba(234, 88, 12, 0.75)",
    dialogue: {
      text: "15h chiều nắng màu hổ phách dịu êm, lá phong vàng bay bay... Thơ mộng quá Admin-san ơi! 🍂",
      expression: "normal",
      symbol: "sparkle",
    },
  },
  16: {
    hour: 16,
    timeLabel: "16:00",
    name: "Apricot Horizon Breeze",
    category: "day",
    archetype: "apricot_sun",
    haloColors: ["#FFE4E6", "#FB7185", "#E11D48"],
    coreColors: ["#FFF1F2", "#FDA4AF"],
    strokeColor: "#F43F5E",
    accentColor: "#FB7185",
    glowRgba: "rgba(244, 63, 94, 0.75)",
    dialogue: {
      text: "16h chiều sắc mơ đào dịu ngọt, báo hiệu sắp đến giờ tan sở rồi! Cố nốt hôm nay nào! 🍑",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  17: {
    hour: 17,
    timeLabel: "17:00",
    name: "Sunset Ember Horizon",
    category: "sunset",
    archetype: "sunset_ember",
    haloColors: ["#FDE047", "#FB7185", "#C084FC"],
    coreColors: ["#FEF08A", "#FB7185"],
    strokeColor: "#F43F5E",
    accentColor: "#FDE047",
    glowRgba: "rgba(251, 113, 133, 0.8)",
    dialogue: {
      text: "17h hoàng hôn buông xuống rồi... Tàn lửa chiều tà ấm áp vỗ về bạn sau một ngày dài! 🌇",
      expression: "shy",
      symbol: "heart",
    },
  },
  18: {
    hour: 18,
    timeLabel: "18:00",
    name: "Coral Twilight Dusk",
    category: "sunset",
    archetype: "coral_dusk",
    haloColors: ["#F472B6", "#C084FC", "#7E22CE"],
    coreColors: ["#FDE047", "#C084FC"],
    strokeColor: "#A855F7",
    accentColor: "#F472B6",
    glowRgba: "rgba(168, 85, 247, 0.8)",
    dialogue: {
      text: "18h bầu trời chạng vạng tím hồng san hô vi diệu! Admin-san đã hoàn thành công việc chưa? 🌆",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  19: {
    hour: 19,
    timeLabel: "19:00",
    name: "Evening First Star",
    category: "night",
    archetype: "evening_star",
    haloColors: ["#C084FC", "#6366F1", "#312E81"],
    coreColors: ["#EDE9FE", "#818CF8"],
    strokeColor: "#6366F1",
    accentColor: "#FDE047",
    glowRgba: "rgba(99, 102, 241, 0.8)",
    dialogue: {
      text: "19h tối bầu trời tím thẫm xuất hiện ngôi Sao Hôm đầu tiên! Thắp sáng bàn làm việc nào! ⭐",
      expression: "normal",
      symbol: "sparkle",
    },
  },
  20: {
    hour: 20,
    timeLabel: "20:00",
    name: "Silver Moonrise & Stardust",
    category: "night",
    archetype: "silver_moon",
    haloColors: ["#E0F2FE", "#93C5FD", "#3B82F6"],
    coreColors: ["#FFFFFF", "#BAE6FD"],
    strokeColor: "#60A5FA",
    accentColor: "#FFFFFF",
    glowRgba: "rgba(96, 165, 250, 0.8)",
    dialogue: {
      text: "20h tối vầng trăng bạc kiêu sa nhô cao cùng bụi sao lấp lánh! Buổi tối thật yên bình~ 🌙",
      expression: "happy",
      symbol: "sparkle",
    },
  },
  21: {
    hour: 21,
    timeLabel: "21:00",
    name: "Lantern Moon Warmth",
    category: "night",
    archetype: "lantern_moon",
    haloColors: ["#FEF08A", "#F59E0B", "#B45309"],
    coreColors: ["#FFFBEB", "#FCD34D"],
    strokeColor: "#F59E0B",
    accentColor: "#FEF08A",
    glowRgba: "rgba(245, 158, 11, 0.8)",
    dialogue: {
      text: "21h tối vầng trăng tròn vàng dịu như chiếc đèn lồng ấm áp thắp sáng đêm tĩnh lặng! 🏮",
      expression: "happy",
      symbol: "heart",
    },
  },
  22: {
    hour: 22,
    timeLabel: "22:00",
    name: "Luminous Azure Moon",
    category: "night",
    archetype: "azure_moon",
    haloColors: ["#A5F3FC", "#38BDF8", "#1E40AF"],
    coreColors: ["#ECFEFF", "#7DD3FC"],
    strokeColor: "#0284C7",
    accentColor: "#BAE6FD",
    glowRgba: "rgba(56, 189, 248, 0.8)",
    dialogue: {
      text: "22h đêm mặt trăng xanh ngọc bích êm đềm... Đêm đã sâu rồi, Admin-san nhớ nghỉ ngơi nhé! 🌌",
      expression: "sleepy",
      symbol: "zzz",
    },
  },
  23: {
    hour: 23,
    timeLabel: "23:00",
    name: "Dreamscape Slumber Moon",
    category: "night",
    archetype: "dream_moon",
    haloColors: ["#E9D5FF", "#A855F7", "#581C87"],
    coreColors: ["#FAF5FF", "#D8B4FE"],
    strokeColor: "#A855F7",
    accentColor: "#F3E8FF",
    glowRgba: "rgba(168, 85, 247, 0.8)",
    dialogue: {
      text: "23h khuya ánh trăng khép mi cùng đốm đom đóm mộng... Chúc Admin-san có giấc mơ thật đẹp! 💫",
      expression: "sleepy",
      symbol: "zzz",
    },
  },
};

export function getHourlyTheme(hour?: number, fallbackCategory?: SawakoTimeOfDay): HourlyTheme {
  if (typeof hour === "number" && hour >= 0 && hour <= 23) {
    return HOURLY_THEMES[Math.floor(hour)] ?? HOURLY_THEMES[8];
  }

  if (fallbackCategory === "sunset") return HOURLY_THEMES[17];
  if (fallbackCategory === "night") return HOURLY_THEMES[0];
  if (fallbackCategory === "day") return HOURLY_THEMES[8];

  const currentHour = new Date().getHours();
  return HOURLY_THEMES[currentHour] ?? HOURLY_THEMES[8];
}
