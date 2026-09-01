import React from "react";
import type { SawakoWalkDirection } from "../types";

interface SawakoFeetProps {
  isDragging: boolean;
  isWalking?: boolean;
  walkDirection?: SawakoWalkDirection;
  isSippingTea?: boolean;
  hoveredZone?: "hand" | "foot" | null;
  onPokeFoot?: (e: React.MouseEvent | React.TouchEvent) => void;
  setHoveredZone: (zone: "hand" | "foot" | null) => void;
}

/**
 * SawakoFeet - Articulated Anime Chibi Legs with Stylish Black High-Top Boots
 * Features:
 * - Stylish black high-top boots (giày đen cao cổ) with polished leather gloss and silver eyelets
 * - Delicate ruffled white lace socks peeking out just above the boot collar
 * - Positioned behind the white muse dress skirt
 * - Dynamic kinematics: airborne pendular dangling when dragged, shy fluttering when hovered
 * - Authentic directional walking (Left & Right strides without mirroring/flipping)
 * - Cozy folded legs pose when sitting and sipping tea (isSippingTea)
 * - Interactive hotspot with `sawako-feet-target`
 */
export function SawakoFeet({
  isDragging,
  isWalking = false,
  walkDirection = "left",
  isSippingTea = false,
  onPokeFoot,
  setHoveredZone,
}: SawakoFeetProps) {
  const isSitting = isSippingTea && !isDragging;

  const feetClass = isDragging
    ? "animate-[airborneFeetDangle_0.42s_ease-in-out_infinite]"
    : "transition-transform duration-300 ease-out";

  const isWalkingLeft = !isDragging && !isSitting && isWalking && walkDirection === "left";
  const isWalkingRight = !isDragging && !isSitting && isWalking && walkDirection === "right";

  const leftLegClass = isWalkingLeft
    ? "animate-[gentleStrideLeftLead_1.0s_ease-in-out_infinite]"
    : isWalkingRight
      ? "animate-[gentleStrideRightFollow_1.0s_ease-in-out_infinite]"
      : "transition-transform duration-300 ease-out";

  const rightLegClass = isWalkingLeft
    ? "animate-[gentleStrideLeftFollow_1.0s_ease-in-out_infinite]"
    : isWalkingRight
      ? "animate-[gentleStrideRightLead_1.0s_ease-in-out_infinite]"
      : "transition-transform duration-300 ease-out";

  const leftLegStyle: React.CSSProperties = isSitting
    ? { transform: "translate(-8px, -2px) rotate(8deg)", transformOrigin: "329px 978px", transition: "transform 0.25s ease-out" }
    : { transformOrigin: "329px 888px" };

  const rightLegStyle: React.CSSProperties = isSitting
    ? { transform: "translate(8px, -2px) rotate(-8deg)", transformOrigin: "407px 978px", transition: "transform 0.25s ease-out" }
    : { transformOrigin: "407px 888px" };

  return (
    <g
      data-testid="sawako-feet-target"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onPokeFoot?.(e);
      }}
      onMouseEnter={() => setHoveredZone("foot")}
      onMouseLeave={() => setHoveredZone(null)}
      className={`cursor-pointer pointer-events-auto group focus:outline-hidden ${feetClass}`}
      aria-label="Interact with Sawako's feet"
      style={{
        transformOrigin: "368px 770px",
      }}
    >
      <style>{`
        /* Chibi Gentle Stride - Bước đi nhón gót khẽ khàng, đoan trang, dịu dàng */
        @keyframes gentleStrideLeftLead {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(-3px, -5px) rotate(-2.5deg); }
          50% { transform: translate(-4px, 0px) rotate(-1deg); }
          75% { transform: translate(2px, 0.5px) rotate(1.5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes gentleStrideLeftFollow {
          0% { transform: translate(-4px, 0px) rotate(-1deg); }
          25% { transform: translate(2px, 0.5px) rotate(1.5deg); }
          50% { transform: translate(0px, 0px) rotate(0deg); }
          75% { transform: translate(-3px, -5px) rotate(-2.5deg); }
          100% { transform: translate(-4px, 0px) rotate(-1deg); }
        }

        /* Chibi Gentle Stride - Đi qua phải */
        @keyframes gentleStrideRightLead {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(3px, -5px) rotate(2.5deg); }
          50% { transform: translate(4px, 0px) rotate(1deg); }
          75% { transform: translate(-2px, 0.5px) rotate(-1.5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes gentleStrideRightFollow {
          0% { transform: translate(4px, 0px) rotate(1deg); }
          25% { transform: translate(-2px, 0.5px) rotate(-1.5deg); }
          50% { transform: translate(0px, 0px) rotate(0deg); }
          75% { transform: translate(3px, -5px) rotate(2.5deg); }
          100% { transform: translate(4px, 0px) rotate(1deg); }
        }
      `}</style>
      <defs>
        {/* Black Polished Leather Boot Gradient */}
        <linearGradient id="blackBootLeather" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#252736" />
          <stop offset="35%" stopColor="#191B26" />
          <stop offset="75%" stopColor="#101118" />
          <stop offset="100%" stopColor="#08090C" />
        </linearGradient>

        {/* Boot Sole Dark Rubber Gradient */}
        <linearGradient id="bootSoleRubber" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2D303E" />
          <stop offset="100%" stopColor="#0F1016" />
        </linearGradient>

        {/* Thigh Under-Skirt Skin Tone */}
        <linearGradient id="thighSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE6D6" />
          <stop offset="100%" stopColor="#FFF2EA" />
        </linearGradient>
      </defs>

      {/* ===================== CHIBI LEGS & BLACK HIGH-TOP BOOTS ===================== */}
      {isSitting ? (
        /* ===================== DÁNG NGỒI QUỲ CHIBI (CHỈ LỘ HAI ĐẦU GỐI, TỰ NHIÊN HÒA QUYỆN CÙNG VÁY) ===================== */
        <g id="sawako-w-sitting-legs">
          {/* Lớp bóng tiếp xúc của hai đầu gối chạm sàn */}
          <ellipse cx="340" cy="968" rx="22" ry="6" fill="#451A03" opacity="0.3" />
          <ellipse cx="396" cy="968" rx="22" ry="6" fill="#451A03" opacity="0.3" />

          {/* Khối hai đầu gối tròn xinh da trắng sứ chạm sàn ở chính diện, ăn sâu lên váy */}
          <path
            id="kneeling-knees-unified"
            d="
              M 312 840
              L 312 946
              C 312 960, 324 968, 340 968
              C 356 968, 366 960, 368 948
              C 370 960, 380 968, 396 968
              C 412 968, 424 960, 424 946
              L 424 840
              Z
            "
            fill="#FFF8F3"
            stroke="#DFBBA8"
            strokeWidth={1.4}
          />

          {/* Đường tiếp xúc giữa hai đầu gối chạm sát nhau */}
          <line x1="368" y1="944" x2="368" y2="964" stroke="#DFBBA8" strokeWidth={1.2} />

          {/* Đốm sáng phản chiếu dễ thương trên hai đầu gối tròn */}
          <ellipse cx="340" cy="956" rx="5" ry="3" fill="#FFFFFF" opacity="0.65" />
          <ellipse cx="396" cy="956" rx="5" ry="3" fill="#FFFFFF" opacity="0.65" />
        </g>
      ) : (
        /* ===================== CHIBI LEGS & BLACK HIGH-TOP BOOTS (ĐỨNG / ĐI BỘ) ===================== */
        <g id="chibi-legs-render">
        {/* ==================== LEFT LEG & BLACK HIGH-TOP BOOT ==================== */}
        <g id="left-boot-leg" className={leftLegClass} style={leftLegStyle}>
          {/* Bare Leg & Calf (Thon mềm mại với đường viền da tự nhiên) */}
          <path
            d="
              M 314 770
              C 310 805, 311 850, 313 888
              L 345 888
              C 347 850, 348 805, 344 770
              Z
            "
            fill="url(#thighSkin)"
            stroke="#E2B8A2"
            strokeWidth={1}
          />

          {/* Ruffled White Lace Sock Collar peeking out from boot */}
          <g id="left-sock-frill">
            <path
              d="
                M 312 888
                Q 318 880 324 888
                Q 330 880 336 888
                Q 342 880 348 888
                L 348 896
                Q 330 900 312 896
                Z
              "
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth={1.4}
            />
          </g>

          {/* Black High-Top Boot Shaft (Cao cổ bao quanh bắp chân & cổ chân) */}
          <path
            d="
              M 314 894
              C 316 918, 318 942, 312 956
              C 306 962, 308 970, 316 974
              L 354 974
              C 356 964, 354 944, 348 918
              L 346 894
              Q 330 900 314 894
              Z
            "
            fill="url(#blackBootLeather)"
            stroke="#0A0B0E"
            strokeWidth={2}
          />

          {/* Boot Vamp & Rounded Toe Box */}
          <ellipse cx="334" cy="968" rx="24" ry="12" fill="url(#blackBootLeather)" stroke="#0A0B0E" strokeWidth={1.8} />

          {/* Leather Highlight Sheen */}
          <path
            d="M 318 906 C 322 926, 324 946, 322 962"
            stroke="#4A5068"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path d="M 326 964 Q 336 968 346 964" stroke="#5E6584" strokeWidth={1.6} fill="none" opacity="0.75" />

          {/* Boot Front Laces & Silver Eyelets */}
          <g id="left-boot-laces">
            <circle cx="326" cy="912" r="1.6" fill="#94A3B8" />
            <circle cx="336" cy="912" r="1.6" fill="#94A3B8" />
            <line x1="326" y1="912" x2="336" y2="920" stroke="#1E202B" strokeWidth={1.8} />

            <circle cx="326" cy="924" r="1.6" fill="#94A3B8" />
            <circle cx="336" cy="924" r="1.6" fill="#94A3B8" />
            <line x1="336" y1="912" x2="326" y2="924" stroke="#1E202B" strokeWidth={1.8} />
            <line x1="326" y1="924" x2="336" y2="936" stroke="#1E202B" strokeWidth={1.8} />

            <circle cx="326" cy="936" r="1.6" fill="#94A3B8" />
            <circle cx="336" cy="936" r="1.6" fill="#94A3B8" />
            <line x1="336" y1="924" x2="326" y2="936" stroke="#1E202B" strokeWidth={1.8} />
          </g>

          {/* Sturdy Boot Sole with Chunky Heel */}
          <path
            d="
              M 308 972
              Q 332 984 358 972
              L 358 978
              Q 332 990 308 978
              Z
            "
            fill="url(#bootSoleRubber)"
            stroke="#050508"
            strokeWidth={1.8}
          />
          {/* Heel block */}
          <rect x="345" y="974" width="11" height="6" rx="1.5" fill="#0A0B0E" />
        </g>

        {/* ==================== RIGHT LEG & BLACK HIGH-TOP BOOT ==================== */}
        <g id="right-boot-leg" className={rightLegClass} style={rightLegStyle}>
          {/* Bare Leg & Calf (Thon mềm mại với đường viền da tự nhiên) */}
          <path
            d="
              M 392 770
              C 388 805, 389 850, 391 888
              L 423 888
              C 425 850, 426 805, 422 770
              Z
            "
            fill="url(#thighSkin)"
            stroke="#E2B8A2"
            strokeWidth={1}
          />

          {/* Ruffled White Lace Sock Collar peeking out from boot */}
          <g id="right-sock-frill">
            <path
              d="
                M 390 888
                Q 396 880 402 888
                Q 408 880 414 888
                Q 420 880 426 888
                L 426 896
                Q 408 900 390 896
                Z
              "
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth={1.4}
            />
          </g>

          {/* Black High-Top Boot Shaft (Cao cổ bao quanh bắp chân & cổ chân) */}
          <path
            d="
              M 390 894
              C 392 918, 394 942, 388 956
              C 382 962, 384 970, 392 974
              L 430 974
              C 432 964, 430 944, 424 918
              L 422 894
              Q 406 900 390 894
              Z
            "
            fill="url(#blackBootLeather)"
            stroke="#0A0B0E"
            strokeWidth={2}
          />

          {/* Boot Vamp & Rounded Toe Box */}
          <ellipse cx="410" cy="968" rx="24" ry="12" fill="url(#blackBootLeather)" stroke="#0A0B0E" strokeWidth={1.8} />

          {/* Leather Highlight Sheen */}
          <path
            d="M 406 906 C 402 926, 400 946, 402 962"
            stroke="#4A5068"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path d="M 402 964 Q 412 968 422 964" stroke="#5E6584" strokeWidth={1.6} fill="none" opacity="0.75" />

          {/* Boot Front Laces & Silver Eyelets */}
          <g id="right-boot-laces">
            <circle cx="400" cy="912" r="1.6" fill="#94A3B8" />
            <circle cx="410" cy="912" r="1.6" fill="#94A3B8" />
            <line x1="400" y1="912" x2="410" y2="920" stroke="#1E202B" strokeWidth={1.8} />

            <circle cx="400" cy="924" r="1.6" fill="#94A3B8" />
            <circle cx="410" cy="924" r="1.6" fill="#94A3B8" />
            <line x1="410" y1="912" x2="400" y2="924" stroke="#1E202B" strokeWidth={1.8} />
            <line x1="400" y1="924" x2="410" y2="936" stroke="#1E202B" strokeWidth={1.8} />

            <circle cx="400" cy="936" r="1.6" fill="#94A3B8" />
            <circle cx="410" cy="936" r="1.6" fill="#94A3B8" />
            <line x1="410" y1="924" x2="400" y2="936" stroke="#1E202B" strokeWidth={1.8} />
          </g>

          {/* Sturdy Boot Sole with Chunky Heel */}
          <path
            d="
              M 384 972
              Q 408 984 434 972
              L 434 978
              Q 408 990 384 978
              Z
            "
            fill="url(#bootSoleRubber)"
            stroke="#050508"
            strokeWidth={1.8}
          />
          {/* Heel block */}
          <rect x="385" y="974" width="11" height="6" rx="1.5" fill="#0A0B0E" />
        </g>
      </g>
      )}

      {/* Invisible broad hotspot over feet */}
      <rect
        x={isSitting ? "130" : "260"}
        y="830"
        width={isSitting ? "476" : "216"}
        height="180"
        fill="transparent"
        className="cursor-pointer"
      />
    </g>
  );
}
