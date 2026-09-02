import React from "react";
import type { CelestialArchetype, HourlyTheme } from "../../sawako-hourly-theme";
import { Hour00MidnightMoon } from "./Hour00MidnightMoon";
import { Hour01CloudMoon } from "./Hour01CloudMoon";
import { Hour02Nebula } from "./Hour02Nebula";
import { Hour03Comet } from "./Hour03Comet";
import { Hour04Venus } from "./Hour04Venus";
import { Hour05DawnHorizon } from "./Hour05DawnHorizon";
import { Hour06Sunrise } from "./Hour06Sunrise";
import { Hour07MorningDew } from "./Hour07MorningDew";
import { Hour08JoyfulSun } from "./Hour08JoyfulSun";
import { Hour09HaloSun } from "./Hour09HaloSun";
import { Hour10SakuraSun } from "./Hour10SakuraSun";
import { Hour11ZenithDiamond } from "./Hour11ZenithDiamond";
import { Hour12SolarisCrown } from "./Hour12SolarisCrown";
import { Hour13SiestaCloud } from "./Hour13SiestaCloud";
import { Hour14TeatimeSun } from "./Hour14TeatimeSun";
import { Hour15AmberLeaf } from "./Hour15AmberLeaf";
import { Hour16ApricotSun } from "./Hour16ApricotSun";
import { Hour17SunsetEmber } from "./Hour17SunsetEmber";
import { Hour18CoralDusk } from "./Hour18CoralDusk";
import { Hour19EveningStar } from "./Hour19EveningStar";
import { Hour20SilverMoon } from "./Hour20SilverMoon";
import { Hour21LanternMoon } from "./Hour21LanternMoon";
import { Hour22AzureMoon } from "./Hour22AzureMoon";
import { Hour23DreamMoon } from "./Hour23DreamMoon";

interface HourlyArchetypeSwitchProps {
  archetype: CelestialArchetype;
  theme: HourlyTheme;
}

export function HourlyArchetypeSwitch({ archetype, theme }: HourlyArchetypeSwitchProps) {
  switch (archetype) {
    case "midnight_moon":
      return <Hour00MidnightMoon theme={theme} />;
    case "cloud_moon":
      return <Hour01CloudMoon theme={theme} />;
    case "nebula":
      return <Hour02Nebula theme={theme} />;
    case "comet":
      return <Hour03Comet theme={theme} />;
    case "venus":
      return <Hour04Venus theme={theme} />;
    case "dawn_horizon":
      return <Hour05DawnHorizon theme={theme} />;
    case "sunrise":
      return <Hour06Sunrise theme={theme} />;
    case "morning_dew":
      return <Hour07MorningDew theme={theme} />;
    case "joyful_sun":
      return <Hour08JoyfulSun theme={theme} />;
    case "halo_sun":
      return <Hour09HaloSun theme={theme} />;
    case "sakura_sun":
      return <Hour10SakuraSun theme={theme} />;
    case "zenith_diamond":
      return <Hour11ZenithDiamond theme={theme} />;
    case "solaris_crown":
      return <Hour12SolarisCrown theme={theme} />;
    case "siesta_cloud":
      return <Hour13SiestaCloud theme={theme} />;
    case "teatime_sun":
      return <Hour14TeatimeSun theme={theme} />;
    case "amber_leaf":
      return <Hour15AmberLeaf theme={theme} />;
    case "apricot_sun":
      return <Hour16ApricotSun theme={theme} />;
    case "sunset_ember":
      return <Hour17SunsetEmber theme={theme} />;
    case "coral_dusk":
      return <Hour18CoralDusk theme={theme} />;
    case "evening_star":
      return <Hour19EveningStar theme={theme} />;
    case "silver_moon":
      return <Hour20SilverMoon theme={theme} />;
    case "lantern_moon":
      return <Hour21LanternMoon theme={theme} />;
    case "azure_moon":
      return <Hour22AzureMoon theme={theme} />;
    case "dream_moon":
      return <Hour23DreamMoon theme={theme} />;
    default:
      return <Hour08JoyfulSun theme={theme} />;
  }
}

export { AmbientStyles } from "./ambient-styles";
export type { HourlyArchetypeProps } from "./types";
