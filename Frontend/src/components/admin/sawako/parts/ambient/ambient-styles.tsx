import React from "react";

export function AmbientStyles() {
  return (
    <style>{`
        /* ===================== CARTOON SQUASH-AND-STRETCH & CLICK BURST ===================== */
        @keyframes cartoonIdleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes cartoonClickPop {
          0% { transform: scale(1, 1); }
          25% { transform: scale(1.3, 0.72) translateY(8px); }
          50% { transform: scale(0.8, 1.32) translateY(-14px) rotate(-6deg); }
          75% { transform: scale(1.12, 0.92) translateY(2px) rotate(3deg); }
          100% { transform: scale(1, 1) translateY(0) rotate(0deg); }
        }
        @keyframes shockwaveRingExp {
          0% { r: 12px; opacity: 1; stroke-width: 5px; }
          100% { r: 88px; opacity: 0; stroke-width: 1px; }
        }
        @keyframes sparkleFireworkFly {
          0% { transform: translate(0, 0) scale(1.2); opacity: 1; }
          100% { transform: translate(var(--tw-fx, 40px), var(--tw-fy, -40px)) scale(0); opacity: 0; }
        }

        /* 00:00 - Sleeping Full Moon with Nightcap & Cloud Pillow */
        @keyframes nightcapBellSway {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes zzzCleanFloat {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          35% { opacity: 0.9; }
          100% { transform: translate(16px, -32px) scale(1.3) rotate(12deg); opacity: 0; }
        }
        @keyframes moonSleepBreathing {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }

        /* 01:00 - Cloud Nest Slumber Moon Floating */
        @keyframes cloudNestFloat {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-4px) rotate(1.5deg); }
        }
        @keyframes cloudPillowBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, 0.98); }
        }
        @keyframes zzzPopFly {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(18px, -32px) scale(1.3) rotate(12deg); opacity: 0; }
        }

        /* 02:00 - Chibi Saturn Planet with Floating Ring */
        @keyframes saturnChibiFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-7px) rotate(4deg); }
        }
        @keyframes saturnEyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes saturnRingShimmer {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }

        /* 03:00 - Magical Shooting Star & Rainbow Stardust Tail */
        @keyframes cometSoar {
          0%, 100% { transform: translate(0, 0) rotate(-16deg); }
          50% { transform: translate(6px, -8px) rotate(-12deg); }
        }
        @keyframes cometTailWave {
          0%, 100% { transform: scaleX(1) scaleY(1); opacity: 0.85; }
          50% { transform: scaleX(1.15) scaleY(0.92); opacity: 1; }
        }

        /* 04:00 - Hummingbird Angel Star Flap */
        @keyframes hummingbirdWingFlapL {
          0%, 100% { transform: rotate(-30deg) scaleX(0.7); }
          50% { transform: rotate(40deg) scaleX(1.2); }
        }
        @keyframes hummingbirdWingFlapR {
          0%, 100% { transform: rotate(30deg) scaleX(0.7); }
          50% { transform: rotate(-40deg) scaleX(1.2); }
        }
        @keyframes hoverJitterBody {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          25% { transform: translateY(-4px) rotate(2deg); }
          75% { transform: translateY(3px) rotate(-1deg); }
        }

        /* 05:00 - Peek-a-Boo Dawn */
        @keyframes peekABooHop {
          0%, 35% { transform: translateY(22px) scale(0.95); }
          45% { transform: translateY(-16px) scale(1.1, 0.95) rotate(-5deg); }
          65% { transform: translateY(-12px) scale(1) rotate(5deg); }
          80%, 100% { transform: translateY(22px) scale(0.95); }
        }

        /* 06:00 - Gentle Morning Sun Stretching & Yawn */
        @keyframes sunStretchWake {
          0%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(-6px) scale(1.05, 1.08); }
          60% { transform: translateY(-4px) scale(1.03, 1.05); }
        }
        @keyframes sunRayGentleRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes stretchArmsReach {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40%, 60% { transform: translateY(-4px) rotate(-6deg) scale(1.1); }
        }

        /* 07:00 - Bouncy Slime Dewdrop Squash & Stretch */
        @keyframes slimeSquashBounce {
          0%, 100% { transform: translateY(18px) scale(1.35, 0.65); }
          20% { transform: translateY(-18px) scale(0.78, 1.3); }
          45% { transform: translateY(-26px) scale(1.05, 0.96) rotate(6deg); }
          65% { transform: translateY(-8px) scale(0.9, 1.15); }
          85% { transform: translateY(16px) scale(1.2, 0.8); }
        }

        /* 08:00 - Cool DJ Sunglasses Headbang */
        @keyframes headbangDJ {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(8px) rotate(-6deg) scale(1.08, 0.92); }
          50% { transform: translateY(-10px) rotate(6deg) scale(0.95, 1.08); }
          75% { transform: translateY(6px) rotate(-4deg) scale(1.05, 0.95); }
        }

        /* 09:00 - Halo Hula Hoop Spin */
        @keyframes hulaHoopHalo {
          0% { transform: rotate(-12deg) scaleX(1) translateX(-6px); }
          25% { transform: rotate(0deg) scaleX(0.8) translateY(-4px); }
          50% { transform: rotate(12deg) scaleX(1) translateX(6px); }
          75% { transform: rotate(0deg) scaleX(0.8) translateY(4px); }
          100% { transform: rotate(-12deg) scaleX(1) translateX(-6px); }
        }
        @keyframes hipWiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        /* 10:00 - Gentle Sakura Crown & Drifting Petals */
        @keyframes sakuraSunSway {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes sakuraPetalDrift1 {
          0% { transform: translate(-34px, -20px) rotate(0deg); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translate(-14px, 36px) rotate(120deg); opacity: 0; }
        }
        @keyframes sakuraPetalDrift2 {
          0% { transform: translate(32px, -18px) rotate(0deg); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translate(14px, 40px) rotate(-110deg); opacity: 0; }
        }

        /* 11:00 - Boba Milk Tea Sun Sips */
        @keyframes bobaSipJoy {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes bobaPearlRise {
          0% { transform: translate(3px, 12px) scale(0.8); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(-5px, -6px) scale(1); opacity: 0; }
        }
        @keyframes sunRaySlowTurn {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 12:00 - Royal Sun King Crown Gleam & Float */
        @keyframes royalCrownFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes crownGleam {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
        @keyframes royalRaysRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 13:00 - Siesta Sun Sleeping Tucked in Cloud Blanket */
        @keyframes siestaNapBreathing {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.02); }
        }
        @keyframes snotBubblePulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.9; }
        }
        @keyframes cloudBlanketSway {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(2px); }
        }

        /* 14:00 - Dunking Onsen Cookie Bath & Heart Steam */
        @keyframes onsenBathBob {
          0%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(12px) scale(1.08, 0.9); }
          75% { transform: translateY(-5px) scale(0.95, 1.05); }
        }
        @keyframes bigHeartSteamFly {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: translate(-8px, -42px) scale(1.5) rotate(-15deg); opacity: 0; }
        }

        /* 15:00 - Maple Leaf Parasol & Autumn Breeze */
        @keyframes sunAutumnSway {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes leafParasolWave {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes autumnLeafDrift1 {
          0% { transform: translate(-30px, -20px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translate(32px, 30px) rotate(140deg); opacity: 0; }
        }
        @keyframes autumnLeafDrift2 {
          0% { transform: translate(-20px, 20px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translate(40px, -15px) rotate(-120deg); opacity: 0; }
        }

        /* 16:00 - Gentle Afternoon Breeze & Chubby Cheeks Sway */
        @keyframes gentleBreezeSway {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2.5deg); }
        }
        @keyframes gentleCheekBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.04, 0.98); }
        }
        @keyframes windRibbonGentle {
          0%, 100% { transform: translateX(0px) scaleY(1); opacity: 0.6; }
          50% { transform: translateX(8px) scaleY(1.1); opacity: 0.95; }
        }
        @keyframes sproutLeafSway {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
        }

        /* 17:00 - Sunset Horizon Sun Dip & Waving Hand */
        @keyframes sunsetDipSway {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(3px) rotate(1deg); }
        }
        @keyframes sunsetCloudDrift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes sunsetWaveHand {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(18deg); }
        }

        /* 18:00 - First Evening Star & Twilight Glow */
        @keyframes duskGlowFloat {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes firstStarGlowFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3.5px) scale(1.08); }
        }

        /* 19:00 - Golden Crescent Moon Rocking in Evening Sky */
        @keyframes crescentRocking {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(4deg) translateY(-3px); }
        }
        @keyframes crescentStarGlow {
          0%, 100% { transform: translateY(0px) rotate(-5deg) scale(1); }
          50% { transform: translateY(-4px) rotate(8deg) scale(1.08); }
        }

        /* 20:00 - Mochi Smash & Giant Stretch */
        @keyframes malletSmashLoop {
          0%, 100% { transform: rotate(-10deg) translateY(0); }
          30% { transform: rotate(-55deg) translateY(-8px); }
          50% { transform: rotate(15deg) translateY(6px); }
          75% { transform: rotate(-5deg) translateY(-2px); }
        }
        @keyframes mochiGooeyStretch {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.35, 0.65); }
          70% { transform: scale(0.8, 1.4) translateY(-10px); }
        }

        /* 21:00 - Cozy Warm Tea Moon & Steam Heart Rise */
        @keyframes cozyTeaMoonFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-3px) rotate(1deg); }
        }
        @keyframes steamHeartRise {
          0% { transform: translateY(2px) scale(0.85); opacity: 0.2; }
          50% { opacity: 0.9; }
          100% { transform: translateY(-6px) scale(1.15); opacity: 0.15; }
        }

        /* 22:00 - Jellyfish Jet Propulsion */
        @keyframes jellyfishJetPulse {
          0%, 100% { transform: translateY(10px) scale(1.2, 0.8); }
          35% { transform: translateY(-16px) scale(0.8, 1.3); }
          70% { transform: translateY(-4px) scale(1.05, 0.95); }
        }
        @keyframes tentacleLagWave {
          0%, 100% { transform: rotate(-12deg) scaleY(0.9); }
          50% { transform: rotate(16deg) scaleY(1.2); }
        }

        /* 23:00 - Dream Fisher Moon Animations */
        @keyframes fishingRodBob {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes starFishFlop {
          0%, 100% { transform: rotate(-14deg) translateY(0); }
          30% { transform: rotate(18deg) translateY(-4px) scaleX(1.1); }
          60% { transform: rotate(-8deg) translateY(2px) scaleY(1.1); }
          85% { transform: rotate(12deg) translateY(-2px); }
        }
        @keyframes fishBobberFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes ripplePulseCosmic {
          0% { rx: 4px; ry: 2px; opacity: 0.9; }
          100% { rx: 22px; ry: 8px; opacity: 0; }
        }
      `}</style>
  );
}
