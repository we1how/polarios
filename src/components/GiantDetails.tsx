import { useState, useRef } from "react";
import { Giant, CapturedItem, ContentType } from "../types";
import { 
  Tape, StarDoodle, HeartDoodle, SparkleDoodle, InkButton, 
  ArrowDoodle, UnderlineDoodle, PushPin, Polaroid, CircleHighlight, 
  ContentPolaroid, EmojiSticker, InitialPolaroid, InkStamp 
} from "./ScrapbookPrimitives";
import { ArrowLeft, Trash2, ExternalLink, Dices, Eye, Edit2, Check, FolderSync, ChevronDown, ChevronUp, Bell, BellOff } from "lucide-react";

interface GiantDetailsProps {
  giant: Giant;
  items: CapturedItem[];
  otherGiants: Giant[];
  onBack: () => void;
  onUpdateItem: (itemId: string, updates: Partial<CapturedItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onEditGiantTagline: (giantId: string, newTagline: string) => void;
  onToggleMuteEcho?: (giantId: string) => void; // Support individual echo toggle
  
  // Visual props
  isNightMode?: boolean;
  photoRotation: number;
}

export default function GiantDetails({
  giant,
  items,
  otherGiants,
  onBack,
  onUpdateItem,
  onDeleteItem,
  onEditGiantTagline,
  onToggleMuteEcho,
  isNightMode = false,
  photoRotation,
}: GiantDetailsProps) {
  const [editingTagline, setEditingTagline] = useState(false);
  const [taglineDraft, setTaglineDraft] = useState(giant.description || "");
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // States for editing item thoughts inline
  const [expandedEditingThoughtsId, setExpandedEditingThoughtsId] = useState<string | null>(null);
  const [itemThoughtsDraft, setItemThoughtsDraft] = useState("");

  const listItemsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const hasThoughtsCount = items.filter(item => item.thought || item.emoji).length;

  // Calculate timespan difference
  const getTimespanText = () => {
    if (items.length === 0) return "刚设立";
    const dates = items.map(p => new Date(p.capturedAt).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffMs = Math.abs(maxDate - minDate);
    const months = Math.ceil(diffMs / (30 * 24 * 3600 * 1000));
    return months <= 1 ? "近1个月" : `${months}个月`;
  };

  const timespanText = getTimespanText();

  // Highlight handle for dice rolling inside details card
  const handleRandomRoll = () => {
    if (items.length === 0) return;
    setIsRollingDice(true);
    setHighlightedItemId(null);

    setTimeout(() => {
      setIsRollingDice(false);
      const randIndex = Math.floor(Math.random() * items.length);
      const chosen = items[randIndex];
      setHighlightedItemId(chosen.id);
      setExpandedItemId(chosen.id);

      const el = listItemsRefs.current[chosen.id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      setTimeout(() => {
        setHighlightedItemId(null);
      }, 3000);
    }, 450);
  };

  const handleSaveTagline = () => {
    onEditGiantTagline(giant.id, taglineDraft);
    setEditingTagline(false);
  };

  // Human friendly time ago
  const formatTimeAgo = (isoString: string) => {
    const passedSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (passedSeconds < 60) return "刚刚";
    const passedMins = Math.floor(passedSeconds / 60);
    if (passedMins < 60) return `${passedMins}分钟前`;
    const passedHours = Math.floor(passedMins / 60);
    if (passedHours < 24) return `${passedHours}小时前`;
    const passedDays = Math.floor(passedHours / 24);
    if (passedDays < 30) return `${passedDays}天前`;
    const passedMonths = Math.floor(passedDays / 30);
    if (passedMonths < 12) return `${passedMonths}个月前`;
    return `${Math.floor(passedMonths / 12)}年前`;
  };

  // Start inline item edit
  const startEditThoughts = (item: CapturedItem) => {
    setExpandedEditingThoughtsId(item.id);
    setItemThoughtsDraft(item.thought || "");
  };

  const saveItemThoughts = (itemId: string) => {
    onUpdateItem(itemId, { thought: itemThoughtsDraft.trim() });
    setExpandedEditingThoughtsId(null);
  };

  const quickChangeEmoji = (itemId: string, newEmoji: string | null) => {
    onUpdateItem(itemId, { emoji: newEmoji || undefined });
  };

  const moveItemToOtherGiant = (itemId: string, targetGiantId: string) => {
    onUpdateItem(itemId, { giantId: targetGiantId === "null" ? null : targetGiantId });
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
    }
  };

  // Tilt angels for items polaroids
  const getItemTiltAndTape = (idx: number) => {
    if (photoRotation === 0) return { rotate: 0, pin: "tape-yellow" as any };
    const rotations = [-1.5, 1.2, -0.8, -2, 1.8];
    const rot = rotations[idx % rotations.length];
    const tapeTypes = ["tape-yellow", "tape-pink", "pin"];
    const pinVal = tapeTypes[idx % tapeTypes.length];
    return { rotate: rot, pin: pinVal as any };
  };

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden relative font-zh-hand text-[#1D1C1B] animate-[fadeIn_0.35s_case_out]`}>
      
      {/* Scrollable Container inside device viewport */}
      <div className="flex-1 overflow-y-auto px-4.5 pt-4 pb-26 space-y-4">
        
        {/* Navigation bar headers */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[#7A6A55] hover:text-[#1A1A1A] transition-colors py-1 cursor-pointer active:scale-95 duration-100 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </button>
          
          <button
            onClick={() => {
              if (editingTagline) {
                handleSaveTagline();
              } else {
                setEditingTagline(true);
              }
            }}
            id="btn-edit-giant-description"
            className="text-xs font-bold text-[#8B2C1E] underline hover:text-[#1C1C1E] transition-colors cursor-pointer"
          >
            {editingTagline ? "保存修改" : "点击编辑描述"}
          </button>
        </div>

        {/* Simple & Elegant Handcrafted Avatar & Name Card */}
        <div className="flex flex-col items-center justify-center p-3.5 relative select-none">
          <div className="flex flex-col items-center gap-3">
            {/* Elegant Circular Avatar Profile */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white border-3 border-[#1A1A1A] relative overflow-hidden shadow-[3px_4px_0px_rgba(26,26,26,0.95)] rotate-2 transform hover:rotate-0 transition-transform duration-300"
              style={{ 
                background: giant.avatarColor,
                textShadow: "1.5px 1.5px 0px rgba(0,0,0,0.3)"
              }}
            >
              {/* Outer decorative sketch texture */}
              <div className="absolute inset-0 opacity-15 mix-blend-overlay paper-lined" />
              <span className="text-4xl font-extrabold font-zh-hand tracking-tight select-none pb-0.5">
                {giant.avatarInitials}
              </span>
            </div>

            {/* Clean Name Display */}
            <h2 className="text-2.5xl font-black tracking-tight text-[#1A1A1A] font-zh-hand pt-1.5 select-all leading-none">
              {giant.name}
            </h2>
          </div>
        </div>

          <div className="text-center mt-3.5 space-y-1.5 w-full">
            {editingTagline ? (
              <div className="flex items-center gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  value={taglineDraft}
                  onChange={(e) => setTaglineDraft(e.target.value)}
                  className="bg-[#FFFDF7] text-xs text-[#1A1A1A] border-2 border-black rounded-xl px-2.5 py-1.5 w-full focus:outline-none focus:border-[#8B2C1E] font-zh-hand font-bold"
                  autoFocus
                  onBlur={handleSaveTagline}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTagline();
                  }}
                />
              </div>
            ) : (
              <p
                onClick={() => {
                  setEditingTagline(true);
                  setTaglineDraft(giant.description || "");
                }}
                className={`text-xs italic cursor-pointer leading-relaxed text-center px-4 ${
                  giant.description ? "text-[#7A6A55]" : "text-[#8B2C1E] opacity-75 hover:opacity-100"
                }`}
              >
                {giant.description || "“✎ 他在哪一瞬间强烈地启发了你？记句话在这里”"}
              </p>
            )}
          </div>

        {/* Dynamic handpenciled Metric Statistics */}
        <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl px-3 py-3 flex items-center justify-between font-mono text-[11px] text-[#7A6A55] shadow-sm">
          <div className="flex flex-col text-center flex-1 font-zh-hand font-bold leading-normal">
            <span className="text-[#7A6A55] text-[9px] uppercase tracking-wide mb-0.5">收录总量</span>
            <span className="text-[#1A1A1A] text-sm"><span className="text-[#8B2C1E] font-extrabold text-base">{items.length}</span> 条</span>
          </div>
          <div className="h-6 w-[1.5px] bg-[#1A1A1A]/10" />
          <div className="flex flex-col text-center flex-1 font-zh-hand font-bold leading-normal">
            <span className="text-[#7A6A55] text-[9px] uppercase tracking-wide mb-0.5">收录跨度</span>
            <span className="text-[#1A1A1A] text-sm"><span className="text-[#8B2C1E] font-extrabold text-sm">{timespanText}</span></span>
          </div>
          <div className="h-6 w-[1.5px] bg-[#1A1A1A]/10" />
          <div className="flex flex-col text-center flex-1 font-zh-hand font-bold leading-normal">
            <span className="text-[#7A6A55] text-[9px] uppercase tracking-wide mb-0.5">已写思维</span>
            <span className="text-[#1A1A1A] text-sm"><span className="text-[#8B2C1E] font-extrabold text-sm">{hasThoughtsCount}</span> 条</span>
          </div>
        </div>

        {/* Individual Echo notification delivery toggler for this specific mentor */}
        <div className="px-1.5 pt-0.5 select-none">
          <button
            onClick={() => onToggleMuteEcho && onToggleMuteEcho(giant.id)}
            id="btn-toggle-echo-mentor"
            className={`w-full py-2 px-3 border-2 border-[#1C1C1E] rounded-xl font-bold font-zh-hand text-xs flex items-center justify-between transition active:scale-98 cursor-pointer shadow-sm ${
              giant.mutedEcho
                ? "bg-[#FAF6EC]/60 text-[#7A6A55]"
                : "bg-amber-500/5 text-[#8B2C1E] hover:bg-[#FAF6EC]/40"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] leading-none">
              <span className="shrink-0 flex items-center justify-center">
                {giant.mutedEcho ? (
                  <BellOff className="w-3.5 h-3.5 text-[#7A6A55]" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-[#8B2C1E]" />
                )}
              </span>
              <span className="leading-none">此导师灵感回声提醒推送</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border leading-none font-sans font-extrabold pb-0.5 ${
                giant.mutedEcho 
                  ? "bg-slate-200 border-slate-300 text-slate-600" 
                  : "bg-[#8B2C1E]/10 border-[#8B2C1E]/30 text-[#8B2C1E]"
              }`}>
                {giant.mutedEcho ? "已单独关闭" : "回声开启中"}
              </span>
            </div>
          </button>
        </div>

        {/* Scribbled roll-dice divider button */}
        <div className="flex items-center gap-2 py-1.5 relative">
          <div className="h-[1.5px] flex-1 bg-black/10" />
          <button
            onClick={handleRandomRoll}
            id="btn-roll-dice"
            disabled={items.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-black bg-[#FFFDF7] hover:bg-[#FAF6EC] disabled:opacity-35 disabled:pointer-events-none text-xs text-[#1A1A1A] font-bold select-none cursor-pointer duration-150 shadow-sm ${
              isRollingDice ? "scale-95" : "active:scale-95"
            }`}
          >
            <Dices
              className={`w-3.5 h-3.5 ${
                isRollingDice ? "animate-[spin_0.45s_linear_infinite] text-[#8B2C1E]" : "text-[#8B2C1E]"
              }`}
            />
            <span>随机摇出一条灵感</span>
          </button>
          <div className="h-[1.5px] flex-1 bg-black/10" />
        </div>

        {/* Collection items hanging polaroid grid views */}
        {items.length === 0 ? (
          <div className="text-center py-12 space-y-2 select-none">
            <p className="text-[#7A6A55] text-sm leading-none font-bold">目前此巨人的书架空荡荡</p>
            <p className="text-[10px] text-[#7A6A55]">可在外部阅读浏览器内容时，按下分享按钮收录进来~</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const isExpanded = expandedItemId === item.id;
              const isHighlighted = highlightedItemId === item.id;
              const isEditingThoughts = expandedEditingThoughtsId === item.id;
              const placement = getItemTiltAndTape(index);

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    listItemsRefs.current[item.id] = el;
                  }}
                  id={`item-card-${item.id}`}
                  style={{ 
                    animationDelay: `${index * 40}ms`,
                    transform: `rotate(${placement.rotate}deg)`
                  }}
                  className={`border-2 flex flex-col overflow-hidden transition-all duration-350 select-none bg-[#FFFDF7] rounded-2 border-[#1A1A1A] p-3 shadow-md relative ${
                    isHighlighted
                      ? "ring-2 ring-[#8B2C1E] ring-offset-2 scale-[1.02]"
                      : ""
                  }`}
                >
                  {/* Adhesive tape representation visual */}
                  {placement.pin && (
                    <div className="absolute -top-3 left-[40%]">
                      <Tape color={placement.pin === "tape-pink" ? "pink" : "yellow"} width={45} height={11} rotate={index * 2} />
                    </div>
                  )}

                  {/* Top card summary trigger header */}
                  <div
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="cursor-pointer space-y-2 text-left pt-1 px-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs md:text-[12.5px] font-black leading-relaxed font-zh-hand text-[#1A1A1A]">
                        {item.contentType === ContentType.Text && `“`}
                        {item.title}
                        {item.contentType === ContentType.Text && `”`}
                      </h4>
                      {item.emoji && (
                        <InkStamp emoji={item.emoji} className="w-5.5 h-5.5" />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-mono font-bold text-[#7A6A55]/80 pt-0.5 border-t border-dashed border-[#1A1A1A]/10 leading-none">
                      <span>{item.sourceDomain || "闪光灵感段落"}</span>
                      <span>{formatTimeAgo(item.capturedAt)}</span>
                    </div>
                  </div>

                  {/* Inline thoughts quote block (Unexpanded display only) */}
                  {!isExpanded && item.thought && (
                    <div
                      onClick={() => setExpandedItemId(item.id)}
                      className="mx-1.5 mb-1.5 mt-2 bg-[#FAF6EC] border-l-2 border-[#8B2C1E] p-2 text-[10.5px] text-[#7A6A55] leading-normal font-sans rounded-r-md truncate text-left cursor-pointer"
                    >
                      💭 {item.thought}
                    </div>
                  )}

                  {/* Detailed Expanded Actions Board */}
                  {isExpanded && (
                    <div className="border-t border-dashed border-[#1A1A1A]/15 mt-3.5 pt-3.5 px-1 space-y-4 text-left">
                      
                      {/* Original Full selection text (Text highlight mode clipboard) */}
                      {item.contentType === ContentType.Text && item.fullText && (
                        <div className="bg-[#FAF6EC] p-3.5 rounded-xl text-[#1A1A1A] leading-relaxed italic border-l-3 border-[#8B2C1E] max-h-32 overflow-y-auto select-text shadow-inner text-xs">
                          “ {item.fullText} ”
                        </div>
                      )}

                      {/* Mind diary inline editor */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-[#7A6A55] uppercase tracking-wide">
                            💭 触动心流思想记录:
                          </span>
                          {!isEditingThoughts && (
                            <button
                              onClick={() => startEditThoughts(item)}
                              id={`item-edit-thought-btn-${item.id}`}
                              className="text-[#8B2C1E] hover:underline flex items-center gap-1 font-bold text-[11px]"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              修改感叹
                            </button>
                          )}
                        </div>

                        {isEditingThoughts ? (
                          <div className="space-y-2">
                            <textarea
                              value={itemThoughtsDraft}
                              onChange={(e) => setItemThoughtsDraft(e.target.value)}
                              className="w-full h-18 bg-[#FAF6EC] border-2 border-[#1A1A1A] rounded-xl p-2.5 text-[#1A1A1A] text-xs font-zh-hand font-bold focus:outline-none focus:border-[#8B2C1E]"
                              placeholder="✎ 写一点脑中闪过的触动，给未来的自己看..."
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setExpandedEditingThoughtsId(null)}
                                className="px-2.5 py-1 text-[11.5px] bg-[#FAF6EC] hover:bg-[#E2D2B0]/30 border border-black/20 rounded-lg text-[#7A6A55]"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => saveItemThoughts(item.id)}
                                id={`item-save-thought-btn-${item.id}`}
                                className="px-3 py-1 bg-[#1A1A1A] hover:bg-black font-extrabold text-[#FFFDF7] text-[11.5px] rounded-lg flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth="3" />
                                存入卡片
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#FAF6EC] p-3 rounded-xl border border-dashed border-black/10 italic text-[11.5px] leading-relaxed font-sans shadow-sm">
                            {item.thought ? (
                              <p className="text-[#1C1C1E] select-text">
                                {item.thought}
                              </p>
                            ) : (
                              <span className="text-[#7A6A55]/60 block py-1 font-zh-hand font-bold">✎ 暂未书写墨水文字感悟。它之后可能会在回声中被提问唤醒哦。</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Circled emoji reaction sticker Picker */}
                      <div className="space-y-1 text-left">
                        <span className="text-[9.5px] font-extrabold text-[#7A6A55] uppercase tracking-wide block">
                          贴纸标记感悟种类
                        </span>
                        <div className="flex items-center gap-3 py-1">
                          {[
                            { char: "💡", desc: "启发" },
                            { char: "🔁", desc: "复看" },
                            { char: "❓", desc: "疑惑" },
                            { char: "🔥", desc: "高燃" }
                          ].map((sticker) => {
                            const isSelected = item.emoji === sticker.char;
                            return (
                              <EmojiSticker
                                key={sticker.char}
                                emoji={sticker.char}
                                label={sticker.desc}
                                selected={isSelected}
                                onClick={() => quickChangeEmoji(item.id, isSelected ? null : sticker.char)}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Reposition relocating owner selectors */}
                      {otherGiants.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-[#1A1A1A]/10">
                          <span className="text-[10px] font-extrabold text-[#7A6A55] uppercase tracking-wide block">
                            迁移到其他导师书架...
                          </span>
                          <div className="flex items-center gap-2">
                            <FolderSync className="w-4 h-4 text-[#7A6A55]" />
                            <select
                              value={item.giantId || "null"}
                              onChange={(e) => moveItemToOtherGiant(item.id, e.target.value)}
                              className="bg-[#FAF6EC] text-[#1A1A1A] border-2 border-black rounded-lg h-7.5 px-2 font-zh-hand font-bold focus:outline-none"
                            >
                              <option value={giant.id}>保留在: {giant.name}</option>
                              {otherGiants.map(og => (
                                <option key={og.id} value={og.id}>迁移到: {og.name}</option>
                              ))}
                              <option value="null">退回到: 未指派暂存纸篓</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Detail triggers anchors */}
                      <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#1A1A1A]/12 text-[11px]">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="text-[#8B2C1E] underline flex items-center gap-1 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            访问网页原文原载页
                          </a>
                        ) : (
                          <div className="text-[#7A6A55] flex items-center gap-1 font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            本地手工闪光记载
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm("确定撕毁并删除这一条金句灵感记忆吗？")) {
                              onDeleteItem(item.id);
                            }
                          }}
                          id={`item-delete-btn-${item.id}`}
                          className="text-[#8B2C1E] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          彻底撕毁删除
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
