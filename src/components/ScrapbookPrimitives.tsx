import React, { ReactNode } from "react";
import { Lightbulb, BookOpen, HelpCircle, Flame } from "lucide-react";

// Helper shade function for hex color darkening
export function shadeColor(hex: string, percent: number): string {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

// 1. Translucent adhesive washi tape
interface TapeProps {
  color?: "yellow" | "pink" | "blue" | "white";
  width?: number | string;
  height?: number | string;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Tape({
  color = "yellow",
  width = 80,
  height = 20,
  rotate = 0,
  className = "",
  style = {},
}: TapeProps) {
  const bgColors = {
    yellow: "var(--tape-y, rgba(232, 213, 130, 0.65))",
    pink: "var(--tape-p, rgba(220, 165, 165, 0.6))",
    blue: "var(--tape-b, rgba(168, 198, 232, 0.6))",
    white: "var(--tape-w, rgba(255, 255, 255, 0.55))",
  };
  const bg = bgColors[color];
  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundColor: bg,
        transform: `rotate(${rotate}deg)`,
        clipPath:
          "polygon(2% 10%, 5% 0%, 12% 8%, 20% 0%, 30% 6%, 40% 0%, 50% 8%, 60% 0%, 70% 7%, 80% 0%, 90% 6%, 98% 0%, 99% 90%, 95% 100%, 88% 92%, 78% 100%, 68% 93%, 58% 100%, 48% 92%, 38% 100%, 28% 92%, 18% 100%, 8% 92%, 1% 100%)",
        boxShadow: "inset 0 0 8px rgba(0,0,0,0.08)",
        backgroundImage: `repeating-linear-gradient(${rotate * 0.3}deg, transparent 0 8px, rgba(255,255,255,0.18) 8px 10px)`,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

// 2. High-fidelity glass pushing pin
interface PushPinProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function PushPin({ size = 18, color = "var(--red, #8B2C1E)", style = {} }: PushPinProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <circle cx="12" cy="11" r="8" fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
      <circle cx="9" cy="8" r="2.5" fill="rgba(255,255,255,0.55)" />
      <circle cx="12" cy="11" r="2" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

// 3. Illustrative Heart drawing vector style
interface CustomDoodleProps {
  size?: number;
  color?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function HeartDoodle({
  size = 36,
  color = "var(--red, #8B2C1E)",
  fill = false,
  style = {},
  className = "",
}: CustomDoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={style} fill="none" className={className}>
      <path
        d="M5 14.5 C 5 9, 9.5 6, 13 6.5 C 16 7, 18.5 9, 20 12.5 C 21.5 9, 24.5 6.6, 28 6.5 C 32 6.4, 35 9.5, 35 14.5 C 35 21, 26 28, 20 33.5 C 14 28.5, 5 21.3, 5 14.5 Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill ? color : "none"}
      />
    </svg>
  );
}

// 4. Illustrative Star drawing vector style
export function StarDoodle({
  size = 36,
  color = "var(--ochre, #C9A961)",
  style = {},
  className = "",
}: CustomDoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={style} fill="none" className={className}>
      <path
        d="M20 4 L23.5 15.5 L35.5 16 L26 23.5 L29.5 35 L20 28 L10.5 35 L14 23.5 L4.5 16 L16.5 15.5 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// 5. Illustrative Sparkle drawing vector style
export function SparkleDoodle({
  size = 24,
  color = "var(--ink-strong, #1A1A1A)",
  style = {},
  className = "",
}: CustomDoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none" className={className}>
      <path
        d="M12 2 L13 10.5 L21.5 12 L13 13.5 L12 22 L11 13.5 L2.5 12 L11 10.5 Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 6. Curvy handwriting annotation arrow
interface ArrowDoodleProps extends CustomDoodleProps {
  dir?: "down-right" | "down-left" | "up-left" | "up-right" | "right" | "down";
}

export function ArrowDoodle({
  size = 60,
  color = "var(--ink-muted, #7A6A55)",
  dir = "down-right",
  style = {},
  className = "",
}: ArrowDoodleProps) {
  const orientations = {
    "down-right": 0,
    "down-left": 90,
    "up-left": 180,
    "up-right": 270,
    right: 315,
    down: 45,
  };
  const rot = orientations[dir] ?? 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      style={{ transform: `rotate(${rot}deg)`, ...style }}
      fill="none"
      className={className}
    >
      <path
        d="M8 8 C 12 22, 20 32, 32 38 C 38 41, 44 43, 50 44"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M50 44 L 42 38 M50 44 L 44 50" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// 7. Handwriting underline scribble marker
interface UnderlineProps {
  width?: number | string;
  color?: string;
  variant?: "wave" | "double" | "straight";
  style?: React.CSSProperties;
}

export function UnderlineDoodle({
  width = 120,
  color = "var(--ink-strong, #1A1A1A)",
  variant = "wave",
  style = {},
}: UnderlineProps) {
  const w = typeof width === "number" ? width : 120;
  if (variant === "double") {
    return (
      <svg width={width} height={10} viewBox={`0 0 ${w} 10`} style={style} fill="none">
        <path
          d={`M2 3 Q ${w * 0.3} 1, ${w * 0.5} 3 T ${w - 2} 4`}
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M4 8 Q ${w * 0.4} 7, ${w * 0.6} 8 T ${w - 4} 7`}
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </svg>
    );
  }
  if (variant === "straight") {
    return (
      <svg width={width} height={6} viewBox={`0 0 ${w} 6`} style={style} fill="none">
        <path d={`M2 3 L ${w - 3} 3.5`} stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  return (
    <svg width={width} height={10} viewBox={`0 0 ${w} 10`} style={style} fill="none">
      <path
        d={`M2 6 Q ${w * 0.15} 1, ${w * 0.3} 5 T ${w * 0.6} 6 T ${w - 3} 4`}
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 8. Dynamic oval outline circle scribble highlight
interface CircleHighlightProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function CircleHighlight({
  width = 80,
  height = 32,
  color = "var(--red, #8B2C1E)",
  strokeWidth = 2.2,
  style = {},
}: CircleHighlightProps) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} fill="none">
      <path
        d={`M ${width * 0.15} ${height * 0.5}
            C ${width * 0.05} ${height * 0.1}, ${width * 0.55} ${height * 0.05}, ${width * 0.92} ${height * 0.3}
            C ${width * 1.02} ${height * 0.7}, ${width * 0.55} ${height * 1.02}, ${width * 0.1} ${height * 0.75}
            C ${-width * 0.03} ${height * 0.55}, ${width * 0.12} ${height * 0.35}, ${width * 0.4} ${height * 0.4}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 9. Handsketched Scribble Checkbox "X" path
export function ScribbleX({
  size = 24,
  color = "var(--ink-strong, #1A1A1A)",
  style = {},
}: CustomDoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
      <path d="M5 6 C 9 9, 14 13, 19 18" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M19 6 C 15 10, 9 14, 5 18" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// 10. Handsketched Checkmark scribble icon
export function CheckDoodle({
  size = 22,
  color = "var(--ink-strong, #1A1A1A)",
  style = {},
}: CustomDoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
      <path
        d="M4 13 C 6 14, 8 15, 10 18 C 13 13, 16 7, 21 4"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// 11. Custom tactile scrapbook polaroid wrap
interface PolaroidProps {
  width?: number;
  ratio?: number;
  caption?: string | null;
  captionFont?: "zh" | "en";
  rotate?: number;
  children: ReactNode;
  bg?: string;
  pin?: "pin" | "tape-yellow" | "tape-pink" | null;
  deep?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function Polaroid({
  width = 200,
  ratio = 1,
  caption,
  captionFont = "en",
  rotate = 0,
  children,
  bg = "#FFFDF7",
  pin = null,
  deep = false,
  style = {},
  className = "",
  onClick,
}: PolaroidProps) {
  const innerH = width * ratio;
  const shadowClass = deep ? "polaroid-shadow-deep" : "polaroid-shadow";

  return (
    <div
      onClick={onClick}
      className={`${shadowClass} ${className} transition-all duration-200 select-none pb-4`}
      style={{
        width,
        padding: "12px 12px 4px",
        background: bg,
        transform: `rotate(${rotate}deg)`,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {pin === "pin" && (
        <div
          style={{
            position: "absolute",
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <PushPin size={18} />
        </div>
      )}
      {pin === "tape-yellow" && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%) rotate(-3deg)",
            zIndex: 10,
          }}
        >
          <Tape color="yellow" width={70} height={18} rotate={-1} />
        </div>
      )}
      {pin === "tape-pink" && (
        <div style={{ position: "absolute", top: -8, left: -6, transform: "rotate(-22deg)", zIndex: 10 }}>
          <Tape color="pink" width={55} height={18} />
        </div>
      )}

      {/* Embedded photo frame container */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          height: innerH,
          backgroundImage: "linear-gradient(160deg, #ECE5D3, #C9B89A)",
        }}
      >
        {children}
      </div>

      {caption && (
        <div
          style={{
            textAlign: "center",
            paddingTop: "10px",
            paddingBottom: "2px",
            fontFamily: captionFont === "zh" ? "var(--font-zh-hand)" : "var(--font-en-hand)",
            fontSize: captionFont === "zh" ? "17px" : "21px",
            color: "var(--ink, #3D2B1A)",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

// 12. Initial polaroid designed for Giants
interface InitialPolaroidProps {
  initials: string;
  name: string;
  color?: string;
  width?: number;
  rotate?: number;
  pin?: "pin" | "tape-yellow" | "tape-pink" | null;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function InitialPolaroid({
  initials,
  name,
  color = "#C9A961",
  width = 130,
  rotate = -3,
  pin = "tape-yellow",
  style = {},
  onClick,
}: InitialPolaroidProps) {
  return (
    <Polaroid
      width={width}
      ratio={1}
      caption={name}
      captionFont="en"
      rotate={rotate}
      pin={pin}
      onClick={onClick}
      style={style}
    >
      <div
        className="absolute inset-0 flex items-center justify-center select-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 25%, ${color}, ${shadeColor(color, -25)})`,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-en-hand)",
            fontSize: width * 0.52,
            color: "#FFFDF7",
            fontWeight: 700,
            textShadow: "1.5px 2.5px 0 rgba(0,0,0,0.18)",
            lineHeight: 0.9,
          }}
        >
          {initials}
        </span>
      </div>
    </Polaroid>
  );
}

// 13. Content card polaroid representation
export const MOCK_THUMBS: { [key: string]: { bg: string; el: ReactNode } } = {
  "youtube.com": {
    bg: "linear-gradient(135deg, #1a1410 0%, #3a2818 50%, #5a3a20 100%)",
    el: (
      <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 select-none">
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
          <svg width="12" height="14" viewBox="0 0 14 16">
            <polygon points="2,2 2,14 13,8" fill="#fff" />
          </svg>
        </div>
        <span className="absolute bottom-1 right-1.5 bg-black/75 text-[9px] text-white font-mono px-1 rounded">
          1:56:20
        </span>
      </div>
    ),
  },
  "github.com": {
    bg: "#0d1117",
    el: (
      <div className="relative w-full h-full bg-[#0d1117] text-[#c9d1d9] p-3 font-mono text-[9px] space-y-1.5 flex flex-col justify-start leading-tight text-left select-none">
        <div className="flex items-center gap-1.5 text-[10.5px]">
          <span className="text-[#58a6ff]">★ 38.2k</span>
          <span className="text-[#8b949e]">nanoGPT</span>
        </div>
        <div className="text-[#7ee787]">def train():</div>
        <div className="pl-2.5 opacity-80">x, y = get_batch(...)</div>
        <div className="pl-2.5 opacity-80">logits, loss = model(x)</div>
      </div>
    ),
  },
  "paulgraham.com": {
    bg: "#FAF6EC",
    el: (
      <div className="relative w-full h-full bg-[#FAF6EC] p-3 flex flex-col gap-1 text-left select-none border-b">
        <span className="font-serif font-bold text-[#1a1a1a] text-[11px] leading-snug">
          The spelled-out intro to neural networks
        </span>
        <div className="h-[1px] bg-zinc-400 w-12 my-1" />
        <div className="space-y-1">
          <div className="h-1 bg-zinc-300 w-full rounded" />
          <div className="h-1 bg-zinc-300 w-11/12 rounded" />
          <div className="h-1 bg-zinc-300 w-5/6 rounded" />
        </div>
      </div>
    ),
  },
  "karpathy.github.io": {
    bg: "#FAF6EC",
    el: (
      <div className="relative w-full h-full bg-[#FAF6EC] p-3 flex flex-col gap-1 text-left select-none border-b">
        <span className="font-serif font-bold text-[#1a1a1a] text-[11px] leading-snug">
          The spelled-out intro to neural networks
        </span>
        <div className="h-[1px] bg-zinc-400 w-12 my-1" />
        <div className="space-y-1">
          <div className="h-1 bg-zinc-300 w-full rounded" />
          <div className="h-1 bg-zinc-300 w-11/12 rounded" />
          <div className="h-1 bg-zinc-300 w-5/6 rounded" />
        </div>
      </div>
    ),
  },
  "twitter.com": {
    bg: "#ffffff",
    el: (
      <div className="relative w-full h-full bg-white p-2.5 flex flex-col gap-1.5 text-left select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 shadow-sm shrink-0" />
          <div className="leading-none">
            <div className="text-[9.5px] font-bold text-zinc-800">Andrej Karpathy</div>
            <span className="text-[8px] text-zinc-400 font-mono">@karpathy</span>
          </div>
        </div>
        <p className="text-[9px] text-zinc-700 leading-normal line-clamp-3">
          The best teachers are the ones who make you feel like the subject chose you. Failure is cheap and intuition
          is inevitable.
        </p>
      </div>
    ),
  },
  "subpixel.design": {
    bg: "#ffffff",
    el: (
      <div className="relative w-full h-full bg-white p-2.5 flex flex-col gap-1.5 text-left select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 shadow-sm shrink-0" />
          <div className="leading-none">
            <span className="text-[8px] text-zinc-400 font-mono">subpixel.design</span>
          </div>
        </div>
        <p className="text-[9px] text-[#8e8e93] leading-normal line-clamp-2">
          Why standard typography always wins. Clean margins make human readers comfortable.
        </p>
      </div>
    ),
  },
};

// Default fallback thumb generator
function getThumbnailForDomain(domain: string = "clipping"): { bg: string; el: ReactNode } {
  const norm = domain.toLowerCase().trim();
  if (norm.includes("youtube")) return MOCK_THUMBS["youtube.com"];
  if (norm.includes("github")) return MOCK_THUMBS["github.com"];
  if (norm.includes("twitter") || norm.includes("x.com")) return MOCK_THUMBS["twitter.com"];
  if (norm.includes("paulgraham")) return MOCK_THUMBS["paulgraham.com"];
  if (norm.includes("karpathy")) return MOCK_THUMBS["karpathy.github.io"];
  if (norm.includes("subpixel")) return MOCK_THUMBS["subpixel.design"];

  // Default beautiful gradient
  return {
    bg: "linear-gradient(135deg, #FF6B8B 0%, #FFB3C1 100%)",
    el: (
      <div className="relative w-full h-full flex items-center justify-center font-bold text-white text-[18px] tracking-widest font-serif shadow-sm">
        文摘
      </div>
    ),
  };
}

interface ContentPolaroidProps {
  width?: number;
  rotate?: number;
  pin?: "pin" | "tape-yellow" | "tape-pink" | null;
  source?: string;
  sourceIcon?: string;
  title: string;
  emoji?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function ContentPolaroid({
  width = 240,
  rotate = 0,
  pin = "tape-yellow",
  source = "youtube.com",
  sourceIcon,
  title,
  emoji,
  style = {},
  onClick,
}: ContentPolaroidProps) {
  const thumb = getThumbnailForDomain(source);

  return (
    <Polaroid width={width} ratio={0.62} caption={null} rotate={rotate} pin={pin} onClick={onClick} style={style}>
      {/* Background container photo */}
      <div 
        className="absolute inset-0 select-none shadow-inner" 
        style={thumb.bg.includes("gradient") ? { backgroundImage: thumb.bg } : { backgroundColor: thumb.bg }}
      >
        {thumb.el}
      </div>

      {/* Detail overlay overlay text section on top */}
      <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur px-2 py-1 flex flex-col justify-end border-t border-zinc-100 select-none">
        <div className="text-[10.5px] font-bold text-zinc-800 leading-tight line-clamp-1 py-0.5">{title}</div>
        <div className="flex items-center justify-between text-[8px] text-zinc-400 font-mono pt-0.5">
          <div className="flex items-center gap-1 select-none font-sans font-bold">
            {sourceIcon && <span className="transform scale-90">{sourceIcon}</span>}
            <span>{source}</span>
          </div>
          {emoji && <span className="text-[10px] select-none scale-105">{emoji}</span>}
        </div>
      </div>
    </Polaroid>
  );
}

// 14. Ovoid Scribble Button component
interface InkButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  color?: string;
  filled?: boolean;
  width?: number | string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  id?: string;
  disabled?: boolean;
}

export function InkButton({
  children,
  onClick,
  color = "var(--ink-strong, #1A1A1A)",
  filled = false,
  width,
  size = "md",
  style = {},
  id,
  disabled = false,
}: InkButtonProps) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-bold rounded-lg",
    md: "px-4.5 py-2.5 text-sm font-bold rounded-xl",
    lg: "px-6 py-3.5 text-base font-bold rounded-2xl",
  };

  const cClass = filled ? "text-[#F5F0EA] bg-[#1A1A1A] hover:bg-black" : "text-inherit hover:bg-zinc-100/50";

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-1.5 leading-none transition-transform active:scale-95 duration-100 cursor-pointer select-none font-zh-hand ${sizeStyles[size]} ${cClass} disabled:opacity-40 disabled:pointer-events-none`}
      style={{
        minWidth: width,
        fontFamily: "var(--font-zh-hand), var(--font-en-hand), sans-serif",
        ...style,
      }}
    >
      <span className="relative z-10 whitespace-nowrap">{children}</span>

      {/* Scribbled Border overlay if not filled */}
      {!filled && (
        <svg
          className="absolute -inset-1.5 z-0 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 200 60"
        >
          <path
            d="M8 12 C 4 4, 30 4, 60 5 C 100 6, 150 4, 192 8 C 198 14, 196 35, 194 50 C 180 56, 120 54, 70 55 C 30 56, 6 54, 4 48 C 2 32, 6 18, 8 12 Z"
            stroke={color}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

// 15. Circled Emoji stickers for quick reviews
interface EmojiStickerProps {
  key?: React.Key;
  emoji: string;
  label?: string;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
  style?: React.CSSProperties;
}

// 14.5 InkStamp for beautifully sketched, colorful vintage seals
interface InkStampProps {
  emoji?: string;
  className?: string;
}

export function InkStamp({ emoji, className = "w-5 h-5" }: InkStampProps) {
  if (!emoji) return null;
  
  switch (emoji) {
    case "💡":
      return (
        <span 
          className={`inline-flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-900/30 p-1 text-amber-800 shrink-0 ${className}`} 
          title="启发"
        >
          <Lightbulb className="w-full h-full stroke-[2.2]" />
        </span>
      );
    case "🔁":
      return (
        <span 
          className={`inline-flex items-center justify-center rounded-full bg-[#E5F3FF] border border-[#2B6CB0]/30 p-1 text-[#2B6CB0] shrink-0 ${className}`} 
          title="复看"
        >
          <BookOpen className="w-full h-full stroke-[2.2]" />
        </span>
      );
    case "❓":
      return (
        <span 
          className={`inline-flex items-center justify-center rounded-full bg-orange-500/10 border border-orange-900/30 p-1 text-orange-900 shrink-0 ${className}`} 
          title="疑问"
        >
          <HelpCircle className="w-full h-full stroke-[2.2]" />
        </span>
      );
    case "🔥":
      return (
        <span 
          className={`inline-flex items-center justify-center rounded-full bg-red-500/10 border border-red-900/30 p-1 text-red-700 shrink-0 ${className}`} 
          title="高燃"
        >
          <Flame className="w-full h-full stroke-[2.2]" />
        </span>
      );
    default:
      return <span className={`shrink-0 select-none ${className}`}>{emoji}</span>;
  }
}

export function EmojiSticker({
  emoji,
  label,
  selected = false,
  onClick,
  color = "var(--ink-strong, #1A1A1A)",
  style = {},
}: EmojiStickerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-col items-center gap-1 transition-transform cursor-pointer select-none`}
      style={style}
    >
      <div className="w-11 h-11 relative flex items-center justify-center">
        <div
          className={`transition-all duration-200 flex items-center justify-center ${selected ? "scale-110 rotate-3" : "opacity-70 hover:opacity-100"}`}
        >
          <InkStamp emoji={emoji} className="w-8 h-8" />
        </div>
        {selected && (
          <svg className="absolute -inset-1 w-13 h-13 pointer-events-none animate-pulse" viewBox="0 0 48 48" fill="none">
            <path
              d="M8 24 C 8 12, 16 6, 24 6 C 34 6, 42 14, 42 24 C 42 36, 32 42, 22 42 C 14 42, 6 36, 8 24 Z"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>

      {label && (
        <span
          style={{ fontFamily: "var(--font-zh-hand)" }}
          className={`text-[10px] uppercase tracking-wide font-bold transition-colors ${
            selected ? "text-[#1A1A1A]" : "text-[#7A6A55]"
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
}
