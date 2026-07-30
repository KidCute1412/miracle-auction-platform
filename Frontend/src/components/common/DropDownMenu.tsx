import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const HoverDropMenu = (handler: any) => {
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    node.addEventListener("mouseenter", handler);
    node.addEventListener("mouseleave", handler);
    return () => {
      node.removeEventListener("mouseenter", handler);
      node.removeEventListener("mouseleave", handler);
    };
  }, [handler]);
  return domRef;
};

function DropDownMenuAlpha({
  items = [
    { link: "#", option: "Option 1" },
    { link: "#", option: "Option 2" },
    { link: "#", option: "Option 3" },
  ],
  name = "My dropdown menu",
  className = "",
}) {
  const [open, handleOpen] = useState(false);

  const domRefHover = HoverDropMenu(() => {
    handleOpen((o) => !o);
  });

  return (
    <div ref={domRefHover} className="flex w-fit p-2">
      <div
        className={cn(
          "flex relative w-full bg-background/50 border border-border text-foreground font-semibold justify-center items-center px-4 py-2.5 rounded-full backdrop-blur-md transition-all duration-300 text-sm hover:cursor-pointer select-none",
          className
        )}
      >
        <button className="cursor-pointer">{name}</button>
        <span className="pl-1">
          <svg
            width={16}
            height={16}
            viewBox="0 0 20 20"
            fill="none"
            className={`fill-current text-muted-foreground ${
              open ? "rotate-180" : "rotate-0"
            } transition-transform duration-300`}
          >
            <path d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4063 5.65625 17.6875 5.9375C17.9687 6.21875 17.9687 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1563 10.1875 14.25 10 14.25Z" />
          </svg>
        </span>
        <div
          className={cn(
            `flex flex-col absolute bg-glass border border-border shadow-gold-glow w-full mt-2 p-1 ${
              open ? "top-full visible opacity-100" : "top-[120%] invisible opacity-0"
            } transition-all duration-300 rounded-xl z-50`,
            className
          )}
        >
          {items.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="px-3 py-2 w-full text-muted-foreground font-medium hover:text-accent hover:bg-muted/50 rounded-lg transition-colors duration-200 text-xs text-left"
            >
              {item.option}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DropDownMenuAlpha;
