import { useState, useEffect } from "react";

export const dialogues = [
  "Welcome to Miracle Auction. Shall we begin? :D",
  "An outstanding piece! Browse our catalog :>",
  "Do I hear a new bid? Don't miss out! ^^",
  "Going once... Going twice... =))",
  "Got a bid? Let's take it to the moon! xD",
  "Hehehe, you clicked me! Wink! ;)",
  "Hey! That tickles! :-P"
];

interface UseDialoguesResult {
  bubbleText: string;
  setBubbleText: React.Dispatch<React.SetStateAction<string>>;
  isAutoShowing: boolean;
}

export const useDialogues = (
  isSmiling: boolean,
  isHovered: boolean,
  isCheeksHovered: boolean,
  winkEye: "left" | "right" | null,
  isCharging: boolean
): UseDialoguesResult => {
  const [bubbleText, setBubbleText] = useState(dialogues[0]);
  const [isAutoShowing, setIsAutoShowing] = useState(false);

  // Update bubble text when isSmiling changes
  useEffect(() => {
    if (isSmiling) {
      setBubbleText(dialogues[1]);
    } else {
      setBubbleText(dialogues[0]);
    }
  }, [isSmiling]);

  // Periodic idle auto-pop-up dialogue
  useEffect(() => {
    const autoShowInterval = setInterval(() => {
      if (!isHovered && !isCheeksHovered && !winkEye && !isCharging) {
        const rand = Math.floor(Math.random() * 5);
        setBubbleText(dialogues[rand]);
        setIsAutoShowing(true);
        setTimeout(() => {
          setIsAutoShowing(false);
        }, 4000);
      }
    }, 7000);

    return () => clearInterval(autoShowInterval);
  }, [isHovered, isCheeksHovered, winkEye, isCharging]);

  return {
    bubbleText,
    setBubbleText,
    isAutoShowing
  };
};
