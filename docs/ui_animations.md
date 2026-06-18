# Vanguard Elite UI Animations Specifications

This document outlines the micro-interactions and animations designed to elevate the Online Auction platform to the **Vanguard Elite** aesthetic.

---

## 1. Product Cards (`ProductCard.tsx`)
*   **Metallic Shine Sweep:**
    *   **Trigger:** Hover.
    *   **Effect:** A diagonal highlight band (`linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)`) sweeps across the card surface from left to right.
    *   **Duration:** `0.7s` ease-in-out.
*   **Smooth Lift & Glow:**
    *   **Trigger:** Hover.
    *   **Effect:** Card scales up slightly (`scale-[1.015]`) and transitions to a soft gold glow border shadow (`shadow-gold-glow`).
    *   **Transition:** `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`.

## 2. Countdown Timer
*   **Heartbeat Pulse (Urgent State):**
    *   **Trigger:** Remaining time is less than 5 minutes.
    *   **Effect:** The numbers turn to amber-red and pulse gently in scale (`scale(1.03)`) and opacity (`0.8` to `1`).
    *   **Duration:** Infinite looping `@keyframes heartbeat` at `1.2s` intervals.

## 3. Quick Bid Button
*   **Gradient Slide Fill:**
    *   **Trigger:** Hover.
    *   **Effect:** A brushed gold gradient background slides or expands to fill the outline-only button.
    *   **Transition:** `background-position 0.4s ease-out` or scale-in overlay.

## 4. Bidding Panel (Detail Page)
*   **Current Bid Update Pulse:**
    *   **Trigger:** Receive a new bid in real-time.
    *   **Effect:** Scale pulse (`scale-[1.08]`) accompanied by an emerald-green glow flash.
    *   **Duration:** `0.4s` bounce-back.
*   **Timeline Flow:**
    *   **Trigger:** Mount or update.
    *   **Effect:** Connector lines in the bidding history timeline flow forward using SVG `stroke-dashoffset` animation.

## 5. Theme Toggle Button
*   **Solar/Lunar Rotation:**
    *   **Trigger:** Click.
    *   **Effect:** Sun icon rotates and scales down while the Moon icon scales up and rotates into position.
    *   **Transition:** `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`.
