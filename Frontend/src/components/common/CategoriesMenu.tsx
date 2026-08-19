import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Ronaldo from "@/assets/images/Cristiano.jpg";
import SafeImage from "@/components/common/SafeImage";
import { toast } from "sonner";
import { slugify } from "@/utils/make_slug";
import { ChevronRight, Grid3X3, ArrowRight } from "lucide-react";
import { categoryService } from "@/services/category.service.ts";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

interface catData {
  id: number;
  name: string;
  children: any[];
}

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

function CatagoriesButton({ name = "Categories" }: { name?: string }) {
  const navigate = useNavigate();
  const [open, handleOpen] = useState(false);

  const handleClick = () => {
    navigate("/categories");
  };

  const domRefHover = HoverDropMenu(() => {
    handleOpen((o) => !o);
  });

  return (
    <div
      ref={domRefHover}
      className="flex w-fit relative py-2 px-1 self-center"
    >
      {/* Category button trigger */}
      <div className="flex relative w-full font-semibold text-foreground justify-center items-center px-4 py-2.5 rounded-full hover:cursor-pointer hover:bg-muted border border-border bg-background/50 backdrop-blur-md transition-all duration-300 text-sm shadow-sm hover:shadow-md">
        <div onClick={handleClick} className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-muted-foreground" />
          <span>{name}</span>
        </div>
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
        {/* Dropdown container */}
        {open && (
          <div className="animate__animated animate__fadeInUp absolute top-[110%] left-0 bg-glass text-foreground w-fit shadow-gold-glow rounded-xl border border-border p-1 z-50">
            <CatagoriesDropdownMenu />
          </div>
        )}
      </div>
    </div>
  );
}

function CatagoriesDropdownMenu() {
  const navigate = useNavigate();
  const [catData, setCatData] = useState<catData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await categoryService.getAllClient();
        setCatData(data.data);
      } catch (error: any) {
        console.error("Error loading categories: ", error);
        toast.error("Failed to load categories from the server");
      }
    };
    loadData();
  }, []);

  const handleClickCat1 = (cat1_id: number, cat1_name: string) => {
    const slug = slugify(cat1_name);
    navigate(`/categories/${slug}-${cat1_id}`);
  };

  return catData.length === 0 ? null : (
    <NavigationMenu className="min-w-[240px] z-50">
      <NavigationMenuList className="flex-col w-full flex bg-transparent p-1">
        {catData.map((category, i) => (
          <div key={i} className="w-full">
            <NavigationMenuItem className="w-full flex">
              <NavigationMenuTrigger
                className="bg-transparent w-full font-semibold min-w-[230px] py-2.5 px-3 h-fit cursor-pointer hover:bg-muted transition-all duration-200 rounded-lg text-foreground border border-transparent hover:border-border flex items-center justify-between"
                onClick={() => handleClickCat1(category.id, category.name)}
              >
                <span>{category.name}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="animate__animated animate__fadeIn animate__faster w-full flex bg-glass shadow-gold-glow border border-border rounded-xl overflow-hidden">
                <CatagoriesDetailContent
                  title={category.name}
                  items={category.children}
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {i !== catData.length - 1 && (
              <div className="block h-[1px] w-[90%] bg-gradient-to-r from-transparent via-border to-transparent mx-auto my-1"></div>
            )}
          </div>
        ))}
      </NavigationMenuList>
      <NavigationMenuViewport outerClassName="-top-1 left-[100%]" />
    </NavigationMenu>
  );
}

function CatagoriesDetailContent({
  title,
  items,
}: {
  title: string;
  items: { id: number; name: string; cat_image: string }[];
}) {
  const navigate = useNavigate();
  const handleClickCat2 = (cat2_id: number) => {
    navigate(`/products?cat2_id=${cat2_id}&page=${1}`);
  };

  return (
    <div className="bg-transparent w-[500px] h-[300px] flex flex-col overflow-y-auto scrollbar-hide rounded-2xl z-50 p-4 cursor-auto animate__animated animate__fadeInUp">
      {/* Detail header */}
      <div className="font-heading font-bold text-xl text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
        <Grid3X3 className="w-5 h-5 text-accent" />
        <span>{title}</span>
      </div>

      {/* Grid contents */}
      <div className="grid grid-cols-3 gap-4 pb-2">
        {items.map((item, i) => (
          <CatagoriesMiniItem
            key={i}
            image={item?.cat_image}
            name={item.name}
            handleClick={() => handleClickCat2(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CatagoriesMiniItem({
  image,
  name,
  handleClick,
}: {
  image?: string;
  name?: string;
  handleClick: any;
}) {
  if (!name) name = "Category";
  return (
    <div className="group relative flex flex-col items-center select-none">
      <div
        className="h-[110px] aspect-square flex flex-col shrink-0 items-center justify-center rounded-xl border border-border hover:shadow-gold-glow hover:scale-105 hover:cursor-pointer transition-all duration-300 bg-muted/50 hover:bg-muted backdrop-blur-sm transform hover:-translate-y-0.5 relative overflow-hidden mb-2"
        onClick={handleClick}
      >
        <SafeImage
          className="object-cover h-[90%] aspect-square rounded-lg border border-border group-hover:border-accent/40 transition-all duration-300"
          src={image || Ronaldo}
          fallbackSrc={Ronaldo}
          optimizeWidth={200}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          alt={name}
        />
        <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
          <ArrowRight className="w-5 h-5 text-accent transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-300" />
        </div>
      </div>
      <div className="text-center font-medium text-muted-foreground group-hover:text-accent transition-colors duration-200 text-xs tracking-wide truncate max-w-full">
        {name}
      </div>
    </div>
  );
}

export default CatagoriesButton;
