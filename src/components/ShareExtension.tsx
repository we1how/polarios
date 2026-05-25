import { useState, useEffect, FormEvent } from "react";
import { Giant, ContentType, MockWebPage } from "../types";
import { Tape, StarDoodle, InkButton, CircleHighlight, PushPin } from "./ScrapbookPrimitives";
import { X, Globe, FileText, Plus, Inbox, Sparkles } from "lucide-react";

interface ShareExtensionProps {
  isOpen: boolean;
  onClose: () => void;
  giants: Giant[];
  onAddGiantInline: (name: string, description?: string) => string; // returns newly added id
  pageToShare: MockWebPage;
  selectedTextSnippet?: string; // If text mode is active on the simulator
  onCaptureSuccess: (giantId: string | null, emoji: string | null, thought: string, finalTitle: string) => void;
  isNightMode?: boolean;
}

export default function ShareExtension({
  isOpen,
  onClose,
  giants,
  onAddGiantInline,
  pageToShare,
  selectedTextSnippet,
  onCaptureSuccess,
  isNightMode = false,
}: ShareExtensionProps) {
  const [loading, setLoading] = useState(true);
  const [selectedGiantId, setSelectedGiantId] = useState<string | null>(null); // null = "稍后" (Inbox)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [thought, setThought] = useState("");
  const [newGiantName, setNewGiantName] = useState("");
  const [showAddInline, setShowAddInline] = useState(false);

  // Emojis list inside extension
  const emojis = [
    { char: "💡", label: "启发" },
    { char: "🔁", label: "复看" },
    { char: "❓", label: "没懂" },
    { char: "🔥", label: "震撼" },
  ];

  // Detect mode: if selectedTextSnippet is present, fallback to Text mode
  const currentMode = selectedTextSnippet ? ContentType.Text : pageToShare.type;
  
  // Title content: selectedTextSnippet snippet if Text mode, otherwise pageToShare title
  const rawTitle = currentMode === ContentType.Text 
    ? (selectedTextSnippet || pageToShare.snippet || "未命名选中片句") 
    : pageToShare.title;

  // Simulate remote title/URL extraction skeleton shimmer for 950ms
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSelectedGiantId(null);
      setSelectedEmoji(null);
      setThought("");
      setShowAddInline(false);
      setNewGiantName("");

      const timer = setTimeout(() => {
        setLoading(false);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isOpen, pageToShare, selectedTextSnippet]);

  if (!isOpen) return null;

  const handleCreateGiantInlineSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newGiantName.trim()) return;
    const newId = onAddGiantInline(newGiantName.trim(), "在捕获面板中快速新建的巨人");
    setSelectedGiantId(newId);
    setNewGiantName("");
    setShowAddInline(false);
  };

  const handleSave = () => {
    let finalTitle = rawTitle;
    if (currentMode === ContentType.Text && finalTitle.length > 80) {
      finalTitle = finalTitle.substring(0, 80) + "...";
    }
    
    onCaptureSuccess(selectedGiantId, selectedEmoji, thought, finalTitle);
  };

  return (
    <div className={`absolute inset-x-0 bottom-0 z-50 border-t-3 border-[#1A1A1A] rounded-t-[32px] shadow-2xl flex flex-col max-h-[92%] overflow-hidden animate-[slideUp_0.35s_cubic-bezier(0.16,1,0.3,1)] font-zh-hand ${
      isNightMode ? "paper-night text-[#EDE3D2]" : "paper-cream text-[#1C1C1E]"
    }`}>
      {/* Notch handle decoration */}
      <div className="flex justify-center py-2.5">
        <div className="w-10 h-1.2 rounded-full bg-[#1A1A1A]/20" />
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b-2 border-dashed border-[#1A1A1A]/10">
        <button
          onClick={onClose}
          id="btn-close-extension"
          className="text-[#7A6A55] text-xs font-bold hover:text-black py-1 cursor-pointer font-zh-hand select-none active:scale-95 duration-100"
        >
          ✕ 取消
        </button>
        <span className="text-[#1A1A1A] text-sm font-black font-zh-hand tracking-tight flex items-center gap-1">
          📥 快速捕获归档 `Share`
        </span>
        <button
          onClick={handleSave}
          id="btn-save-extension"
          className="text-[#8B2C1E] text-xs font-black hover:opacity-85 py-1 px-3 border-2 border-black rounded-lg bg-white select-none shadow hover:bg-zinc-50 active:scale-95 duration-100 font-zh-hand"
        >
          确认收录
        </button>
      </div>

      {/* Main Content Scroll */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto text-left">
        
        {/* Source badge metadata bubble */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-[9px] font-mono bg-[#1A1A1A] text-[#FAF6EC] px-2 py-0.5 rounded leading-none uppercase">
            From {pageToShare.sourceApp}
          </span>
          <span className="text-[10px] text-[#7A6A55] font-mono leading-none">{pageToShare.domain}</span>
        </div>

        {/* Link/Text metadata card */}
        <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          {loading ? (
            <div className="space-y-2.5">
              <div className="h-4 w-1/3 rounded bg-zinc-300 shimmer-skeleton" />
              <div className="h-5 w-11/12 rounded bg-zinc-300 shimmer-skeleton" />
              <div className="h-3.5 w-2/3 rounded bg-zinc-300 shimmer-skeleton" />
            </div>
          ) : (
            <div className="space-y-1 animate-[fadeIn_0.3s_ease]">
              <div className="flex items-start gap-1.5 pt-0.5">
                {currentMode === ContentType.Link ? (
                  <Globe className="w-3.5 h-3.5 text-[#8B2C1E] mt-0.5 flex-shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#C9A961] mt-0.5 flex-shrink-0" />
                )}
                
                <div className="space-y-1">
                  <h4 className="text-xs font-bold leading-normal text-[#1A1A1A] max-h-20 overflow-y-auto pr-1">
                    {currentMode === ContentType.Text && `“`}
                    {rawTitle}
                    {currentMode === ContentType.Text && `”`}
                  </h4>
                  {currentMode === ContentType.Link && (
                    <span className="text-[10px] text-[#7A6A55] font-mono block break-all leading-normal py-0.5">
                      {pageToShare.url}
                    </span>
                  )}
                  {currentMode === ContentType.Text && (
                    <span className="text-[10.5px] text-[#7A6A55] font-bold block pt-1 leading-none">
                      — 摘自论述: {pageToShare.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Choose Target mentor giant selector row */}
        <div className="space-y-2 pt-1.5">
          <div className="flex items-center justify-between px-0.5 select-none font-bold text-[#7A6A55] text-[10.5px]">
            <span>归属灵感巨人书架:</span>
            <span>
              {selectedGiantId ? `已指定 ${giants.find(g => g.id === selectedGiantId)?.name}` : "存进未分配暂存栈"}
            </span>
          </div>

          {/* Draggable/Horizontal Scroll grid layout */}
          <div className="flex items-center gap-3.5 py-1.5 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {/* Inbox placeholder Later */}
            <button
              onClick={() => setSelectedGiantId(null)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none transition-all duration-150 cursor-pointer ${
                selectedGiantId === null ? "scale-105" : "opacity-50"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center bg-[#FAF6EC] transition-all border-2 ${
                  selectedGiantId === null
                    ? "border-black shadow"
                    : "border-black/10 hover:border-black/35"
                }`}
              >
                <Inbox className={`w-4.5 h-4.5 ${selectedGiantId === null ? "text-[#8B2C1E]" : "text-[#7A6A55]"}`} />
              </div>
              <span className={`text-[10px] font-bold leading-none ${selectedGiantId === null ? "text-[#8B2C1E]" : "text-[#7A6A55]"}`}>
                稍后指派
              </span>
            </button>

            {/* Giant selectors looping */}
            {giants.map((g) => {
              const isSelected = selectedGiantId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGiantId(g.id)}
                  id={`extension-giant-select-${g.id}`}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none transition-all duration-150 cursor-pointer ${
                    isSelected ? "scale-105" : "opacity-50"
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-full relative flex items-center justify-center text-xs font-bold text-white border-2 select-none"
                    style={{
                      background: g.avatarColor,
                      borderColor: isSelected ? "black" : "transparent",
                    }}
                  >
                    {/* Sketched ring overlay indicating selection */}
                    {isSelected && (
                      <div className="absolute -inset-1 border border-black/40 rounded-full animate-pulse" />
                    )}
                    {g.avatarInitials}
                  </div>
                  <span className={`text-[10px] font-bold truncate w-12 text-center leading-none ${
                    isSelected ? "text-black" : "text-[#7A6A55]"
                  }`}>
                    {g.name}
                  </span>
                </button>
              );
            })}

            {/* Quick adding form toggle */}
            {!showAddInline && (
              <button
                onClick={() => setShowAddInline(true)}
                id="btn-trigger-inline-giant"
                className="flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none opacity-50 hover:opacity-100 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#1A1A1A]/30 bg-white flex items-center justify-center">
                  <Plus className="w-4.5 h-4.5 text-[#1A1A1A]" />
                </div>
                <span className="text-[10px] font-bold text-[#7A6A55] leading-none">手画巨人</span>
              </button>
            )}
          </div>

          {/* Quick inline creation slide drawer inline */}
          {showAddInline && (
            <form
              onSubmit={handleCreateGiantInlineSubmit}
              className="bg-[#FAF6EC] border-2 border-black p-2.5 rounded-xl space-y-2 animate-[fadeIn_0.2s_ease]"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="✍ 新书架导师名称..."
                  value={newGiantName}
                  onChange={(e) => setNewGiantName(e.target.value)}
                  className="bg-transparent text-xs text-[#1A1A1A] font-bold px-1 py-1 w-full border-b border-black/20 focus:border-black focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-[#1A1A1A] hover:bg-black text-[#FAF6EC] text-[10.5px] px-2.5 py-1 font-bold rounded cursor-pointer leading-none"
                >
                  确认画出
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddInline(false)}
                  className="text-[#7A6A55] text-[10.5px] px-1.5 hover:text-black py-1 cursor-pointer font-bold leading-none"
                >
                  算了
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Circle Highlights 4-emojis stickers */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#7A6A55] uppercase tracking-wide block">
            贴纸标记这一刻感悟
          </span>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {emojis.map((emoji) => {
              const isSelected = selectedEmoji === emoji.char;
              return (
                <button
                  key={emoji.char}
                  type="button"
                  onClick={() => setSelectedEmoji(isSelected ? null : emoji.char)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-black/30 text-xs transition duration-150 cursor-pointer relative ${
                    isSelected
                      ? "bg-[#FAF6EC] font-bold scale-[1.03] text-black"
                      : "bg-[#F5F0EA] text-[#7A6A55] hover:bg-white"
                  }`}
                >
                  <span className={`text-lg mb-0.5 leading-none ${isSelected ? "scale-110" : ""}`}>
                    {emoji.char}
                  </span>
                  <span className="text-[9.5px] font-bold leading-none">{emoji.label}</span>

                  {/* Circle sketch overlay when chosen */}
                  {isSelected && (
                    <div className="absolute -inset-1.5 border-2 border-dashed border-[#8B2C1E] rounded-xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Written textarea thoughts */}
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[10.5px] font-bold text-[#7A6A55] uppercase tracking-wide block">
            ✎ 记下一句简要的思想挣扎面感 (非必填)
          </span>
          <div className="relative">
            <textarea
              placeholder="✏️ 这一刻，你脑海里跳出了什么难以磨灭的念头？记句话在这里..."
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              className="w-full h-18 bg-[#FAF6EC] border-2 border-black rounded-xl p-2.5 text-xs text-[#1C1C1E] placeholder:text-[#7A6A55]/45 focus:outline-none resize-none leading-relaxed"
            />
            {thought && (
              <span className="absolute bottom-2.5 right-3 text-[9px] text-[#7A6A55] font-mono font-bold leading-none">
                {thought.length} 字
              </span>
            )}
          </div>
        </div>

        {/* Bottom micro quotes decorative incentive */}
        <div className="flex items-center gap-1.5 justify-center pt-1 text-[#7A6A55] text-[10px] select-none font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#8B2C1E]/55 animate-pulse" />
          <span>离线永久保存 · 3秒完美回声</span>
        </div>

      </div>
      
      {/* Decorative pin */}
      <div className="absolute top-2 right-6 rotate-12">
        <Tape color="blue" width={30} height={10} />
      </div>
    </div>
  );
}
