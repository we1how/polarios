import { useState, FormEvent, useRef, DragEvent, ClipboardEvent, ChangeEvent } from "react";
import { Giant, CapturedItem, ContentType } from "../types";
import { 
  Tape, StarDoodle, HeartDoodle, SparkleDoodle, InkButton, 
  ArrowDoodle, UnderlineDoodle, PushPin, Polaroid, CircleHighlight 
} from "./ScrapbookPrimitives";
import { 
  Plus, Settings, Inbox, ChevronRight, Sparkles, Sliders, 
  HardDriveDownload, RefreshCw, HelpCircle, ArrowLeft, Bookmark, Clock, Check,
  Search, Pin, Database, BellRing, Paperclip, ImagePlus
} from "lucide-react";

interface MainAppViewProps {
  giants: Giant[];
  items: CapturedItem[];
  onSelectGiant: (giantId: string) => void;
  onSelectPendingInbox: () => void;
  onAddGiant: (name: string, description: string) => void;
  onSelectEchoItem: (item: CapturedItem) => void;
  onTriggerExport: () => void;
  onTriggerReset: () => void;
  onTogglePinGiant?: (giantId: string) => void; // Fast pin toggle
  
  // Elevated states
  showDeviceSettings: boolean;
  setShowDeviceSettings: (show: boolean) => void;
  photoRotation: number;
  isNightMode: boolean;
  
  // Font systems
  activeFont?: string;
  onChangeActiveFont?: (fontId: string) => void;

  // Custom scrapbook visual tweaks
  paperStyle?: "cream" | "lined" | "kraft" | "custom";
  onChangePaperStyle?: (style: "cream" | "lined" | "kraft" | "custom") => void;
  customBgColor?: string;
  onChangeCustomBgColor?: (color: string) => void;
  customBgTexture?: string;
  onChangeCustomBgTexture?: (texture: string) => void;
  customImageUrl?: string;
  onChangeCustomImageUrl?: (url: string) => void;
  customImageEnabled?: boolean;
  onChangeCustomImageEnabled?: (enabled: boolean) => void;
  customWallpaperOpacity?: number;
  onChangeCustomWallpaperOpacity?: (opacity: number) => void;
}

export default function MainAppView({
  giants,
  items,
  onSelectGiant,
  onSelectPendingInbox,
  onAddGiant,
  onSelectEchoItem,
  onTriggerExport,
  onTriggerReset,
  onTogglePinGiant,
  showDeviceSettings,
  setShowDeviceSettings,
  photoRotation,
  isNightMode,
  activeFont,
  onChangeActiveFont,
  paperStyle = "cream",
  onChangePaperStyle,
  customBgColor = "#FAF0E6",
  onChangeCustomBgColor,
  customBgTexture = "solid",
  onChangeCustomBgTexture,
  customImageUrl = "",
  onChangeCustomImageUrl,
  customImageEnabled = false,
  onChangeCustomImageEnabled,
  customWallpaperOpacity = 35,
  onChangeCustomWallpaperOpacity,
}: MainAppViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drag and Drop Base64 Wallpaper upload states
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileProcess = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Url = evt.target?.result as string;
        if (base64Url) {
          onChangeCustomImageUrl && onChangeCustomImageUrl(base64Url);
          onChangeCustomImageEnabled && onChangeCustomImageEnabled(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handlePasteEvent = (e: ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      handleFileProcess(e.clipboardData.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };
  
  // Create Giant State
  const [newGiantName, setNewGiantName] = useState("");
  const [newGiantDesc, setNewGiantDesc] = useState("");

  // Settings states
  const [echoHour, setEchoHour] = useState("09:00");
  const [echoFrequency, setEchoFrequency] = useState("daily"); // daily, thrice_weekly, weekly, off
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Group items to count per giant
  const getCountForGiant = (giantId: string) => {
    return items.filter((item) => item.giantId === giantId).length;
  };

  // Unassigned items (giantId is null)
  const pendingItems = items.filter((item) => item.giantId === null);

  // Only consider candidates whose mentors have NOT muted Echo notifications
  const eligibleEchoItems = items.filter(item => {
    if (!item.giantId) return false;
    const g = giants.find(giant => giant.id === item.giantId);
    return g ? !g.mutedEcho : true;
  });

  // Find prime candidate for today's echo card among eligible items
  const echoCandidate = eligibleEchoItems.find(item => item.id === "item-kp-echo") || eligibleEchoItems.find(item => item.emoji === "🔥") || eligibleEchoItems[0];

  const handleCreateGiant = (e: FormEvent) => {
    e.preventDefault();
    if (!newGiantName.trim()) return;
    onAddGiant(newGiantName.trim(), newGiantDesc.trim());
    setNewGiantName("");
    setNewGiantDesc("");
    setShowAddModal(false);
  };

  // Determine photo rotations styled uniquely
  const getRotationTilt = (idx: number) => {
    if (photoRotation === 0) return 0;
    if (photoRotation === 1) {
      const tilts = [-1.5, 1.5, -0.8, 1.2];
      return tilts[idx % tilts.length];
    }
    const tilts = [-3.5, 3.5, -2, 2.5, -4, 4];
    return tilts[idx % tilts.length];
  };

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden relative font-zh-hand text-[#1C1C1E]`}>
      
      {/* 1. Header Banner */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5 relative">
          <h1 className="text-3.5xl font-extrabold tracking-tight text-[#1C1C1E] font-zh-hand leading-none select-none">
            巨人桌
          </h1>
          <Sparkles className="w-4.5 h-4.5 text-[#8B2C1E] animate-pulse" />
          <div className="absolute -bottom-1 inset-x-0">
            <UnderlineDoodle width={75} color="var(--red)" variant="straight" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Settings trigger */}
          <button
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            id="btn-trigger-settings"
            className="w-8.5 h-8.5 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-[#FAF6EC] duration-100 transition-all cursor-pointer text-[#1C1C1E]"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Create Giant trigger */}
          <button
            onClick={() => setShowAddModal(true)}
            id="btn-trigger-add-giant"
            className="w-8.5 h-8.5 rounded-full border-2 border-black bg-[#8B2C1E]/10 flex items-center justify-center hover:bg-[#8B2C1E]/20 duration-100 transition-all cursor-pointer text-[#8B2C1E]"
          >
            <Plus className="w-5 h-5 text-[#8B2C1E] stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Primary Scroll Container inside phone panel */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5.5 pt-2">
        
        {/* Onboarding Intro Box (If active etc.) */}
        {(showOnboarding || items.length <= 1) && (
          <div className="bg-[#FFFDF5] border-2 border-[#1A1A1A] rounded-2xl p-4 space-y-2.5 relative shadow-md">
            <div className="flex items-center gap-1.5 text-[#8B2C1E] font-bold">
              <Bookmark className="w-4 h-4 shrink-0" />
              <span className="text-xs uppercase tracking-wider">首次导入极简向导</span>
            </div>
            <h3 className="text-xs font-extrabold text-[#1A1A1A]">
              如何让巨人入驻你的分享菜单：
            </h3>
            <ol className="text-[11px] text-[#7A6A55] space-y-1 ml-4 list-decimal leading-relaxed">
              <li>在微信、浏览器中遇到精彩文字，长按并「分享」</li>
              <li>在分享菜单最右侧找到 &ldquo;更多&rdquo; 按钮选项</li>
              <li>勾选「巨人」并将其拖拽置顶，点击完成</li>
              <li>未来只需 3 秒，即可悄然打包这段颤抖的触动</li>
            </ol>
            <button
              onClick={() => setShowOnboarding(false)}
              className="w-full py-1.5 bg-[#FAF6EC] hover:bg-[#E2D2B0]/30 text-center text-[#1A1A1A] text-[10.5px] font-bold rounded-lg border border-black/20"
            >
              我知道了，开始沙箱探索
            </button>
            <div className="absolute top-1 right-2">
              <PushPin size={10} />
            </div>
          </div>
        )}

        {/* 2. Today's Echo card billboard (Screen 1 core highlighted note block) */}
        {echoCandidate && !showDeviceSettings && (
          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden shadow-md">
            {/* Real tape sticker holding the note */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Tape color="yellow" width={60} height={15} rotate={2} />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#8B2C1E] font-extrabold flex items-center gap-1 uppercase tracking-wide">
                ✦ 今日灵感回声
              </span>
              <span className="text-[#7A6A55] font-mono text-[9px] font-bold">6个月前 · {echoCandidate.sourceDomain}</span>
            </div>

            <div className="border-l-3 border-[#8B2C1E] pl-3.5 py-0.5">
              <blockquote className="text-[#1A1A1A] text-[12px] italic leading-relaxed pr-1 select-text">
                &ldquo;{echoCandidate.fullText || echoCandidate.title}&rdquo;
              </blockquote>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#1A1A1A]/10">
              <span className="text-[10px] text-[#7A6A55] select-none leading-none">
                💡 补写感言可减少它的循环频率
              </span>
              <button
                onClick={() => onSelectEchoItem(echoCandidate)}
                id="btn-echo-respond"
                className="flex items-center gap-1 bg-[#8B2C1E]/10 hover:bg-[#8B2C1E] text-[#8B2C1E] hover:text-[#FFFDF7] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#8B2C1E]/30 transition active:scale-95 duration-100 cursor-pointer"
              >
                💭 回应追问
              </button>
            </div>
          </div>
        )}

        {/* 3. My Giants List Area (Overlapping Cards Mode with Search & Pin Support) */}
        {!showDeviceSettings && (
          <div className="space-y-3.5 text-left select-none">
            
            {/* Search Input Filter */}
            <div className="relative mx-0.5 select-none font-zh-hand">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6A55] opacity-60" />
              <input
                type="text"
                placeholder="搜索导师名字、核心描述标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF6EC]/80 border-2 border-black rounded-xl text-xs font-zh-hand font-bold placeholder-[#7A6A55]/50 focus:outline-none focus:bg-white focus:border-[#8B2C1E] transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-[#7A6A55] uppercase tracking-wide">
                我的灵感导师 · {giants.length}席
              </span>
              <span className="text-[10px] text-[#7A6A55] font-bold">手账卡牌重叠 · 支持置顶</span>
            </div>

            <div className="flex flex-col pt-4">
              {/* Filter and sort giants dynamically */}
              {(() => {
                const filtered = giants.filter(g => 
                  g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (g.description || "").toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                const sorted = [...filtered].sort((a, b) => {
                  const aVal = a.pinned ? 1 : 0;
                  const bVal = b.pinned ? 1 : 0;
                  return bVal - aVal; // Pinned goes first
                });

                if (sorted.length === 0) {
                  return (
                    <div className="text-center py-8 border-2 border-dashed border-[#1A1A1A]/10 rounded-2xl bg-white/40">
                      <p className="text-xs font-bold text-[#7A6A55]">没有匹配到相关导师名录</p>
                      <p className="text-[9px] text-[#7A6A55]/80 mt-1">可在右上角点击 &quot;+&quot; 新增一个</p>
                    </div>
                  );
                }

                return sorted.map((g, idx) => {
                  const count = getCountForGiant(g.id);
                  const withThoughts = items.filter(i => i.giantId === g.id && i.thought).length;
                  const isPinned = !!g.pinned;
                  // Card rotation tilt angled naturally
                  const tilt = getRotationTilt(idx) * 0.35;
                  
                  return (
                    <div
                      key={g.id}
                      style={{ 
                        transform: `rotate(${tilt}deg)`,
                        position: "relative",
                        zIndex: isPinned ? 25 + idx : 10 + idx
                      }}
                      className="group transition-all duration-300 -mt-6.5 first:mt-0 hover:z-50 hover:-translate-y-4 hover:rotate-0"
                    >
                      {/* Pushpin at top left of the card in a real handcrafted desk way */}
                      {isPinned && (
                        <div className="absolute -top-3.5 left-6 z-30">
                          <PushPin size={15} color="var(--red)" />
                        </div>
                      )}

                      <div
                        onClick={() => onSelectGiant(g.id)}
                        id={`giant-card-select-${g.id}`}
                        className={`pl-6 pr-3.5 py-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center justify-between transition-all shadow-md relative overflow-hidden ${
                          isPinned 
                            ? "bg-[#FFFDF4] border-[#8B2C1E]/90 shadow-[4px_4px_0px_rgba(139,44,30,0.15)]" 
                            : "bg-[#FFFDF9] hover:bg-[#FAF6EC] hover:shadow-[3px_3px_0px_rgba(26,26,26,0.8)]"
                        }`}
                      >
                        {/* 1. Left Spine Hand-bound Thread Stitching Decor (左侧古籍手工缝线脊) */}
                        <div className="absolute left-1 top-2 bottom-2 w-1.5 flex flex-col justify-between py-1 pointer-events-none opacity-45">
                          {[1, 2, 3].map((s) => (
                            <div key={s} className="w-1.5 h-1.5 rounded-full bg-[#8B2C1E] border border-black/20" />
                          ))}
                          {/* Thread connecting lines */}
                          <div className="absolute top-1 bottom-1 left-[2px] w-[1px] bg-dashed border-l border-dashed border-[#8B2C1E]/60 z-0 h-full" />
                        </div>

                        {/* 2. Top-right Golden Brass Eyelet Tag (黄铜鸡眼气眼扣 & 系挂红丝流苏) */}
                        <div className="absolute top-2.5 right-12 w-3 h-3 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#AA8022] to-[#73500B] border border-[#1A1A1A] flex items-center justify-center shadow-inner z-20 pointer-events-none">
                          <div className="w-1 h-1 rounded-full bg-[#1A1A1A]" />
                          {/* Tiny subtle hanging scarlet tassel cord/string */}
                          <div className="absolute top-2.5 w-[2px] h-3.5 bg-[#8B2C1E] rounded-full transform origin-top rotate-12 shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.12)]" />
                          <div className="absolute top-5 w-[4px] h-[3px] bg-[#A08866] rounded-sm transform origin-top rotate-6 opacity-80" />
                        </div>

                        {/* Card contents with padding start for left stitch boundary */}
                        <div className="flex items-center gap-3.5 min-w-0 z-10 pl-1">
                          {/* Profile stamp circle with colorful initials - styled as vintage seal stamp mark */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-black rotate-2 shrink-0 select-none shadow-sm relative group-hover:scale-105 transition-transform"
                            style={{ 
                              backgroundColor: g.avatarColor,
                              textShadow: "1px 1px 0 rgba(0,0,0,0.3)"
                            }}
                          >
                            {/* Inner ring for stamp feel */}
                            <div className="absolute inset-0.5 rounded-full border border-white/20 pointer-events-none" />
                            {g.avatarInitials}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-[#1A1A1A] text-sm font-black tracking-tight leading-none block truncate max-w-[110px] font-zh-hand">
                                {g.name}
                              </h4>
                              {g.mutedEcho && (
                                <span className="text-[8.5px] font-sans px-1 bg-slate-100/80 text-slate-500 rounded border border-slate-300 scale-90 leading-none py-0.2 shrink-0 select-none" title="已单独关闭推送">🔕</span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#7A6A55] block truncate max-w-[150px] font-medium leading-none font-zh-hand">
                              {g.description || "未添加思想标签"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                          <div className="text-right flex flex-col items-end pr-1 font-bold text-[9px] text-[#7A6A55] leading-snug font-mono select-none">
                            <span className="text-[#1A1A1A] font-extrabold text-[11.5px]">{count} 条</span>
                            <span className="font-zh-hand">{withThoughts}感悟</span>
                          </div>
                          
                          {/* Fast pin toggle button */}
                          <button
                            onClick={() => onTogglePinGiant && onTogglePinGiant(g.id)}
                            className={`w-7.5 h-7.5 rounded-full border border-black/15 flex items-center justify-center hover:bg-[#EAE3D2]/30 hover:border-black/50 transition active:scale-90 cursor-pointer ${
                              isPinned ? "bg-[#8B2C1E]/10" : "bg-white"
                            }`}
                            title={isPinned ? "取消置顶" : "置顶导师"}
                          >
                            <Pin className={`w-3.5 h-3.5 ${isPinned ? "text-[#8B2C1E] fill-[#8B2C1E]" : "text-[#7A6A55]/70 rotate-45"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* 4. Unassigned Memories Inbox (Kraft file folder envelope design) */}
        {!showDeviceSettings && (
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-[#7A6A55] uppercase tracking-wide px-1">
              纸篓分类中继
            </span>
            <div
              onClick={onSelectPendingInbox}
              id="btn-select-pending-inbox"
              className="border-2 border-dashed border-[#1D1C1B] hover:border-[#8B2C1E] bg-[#FFFDF7] hover:bg-[#FAF6EC] flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all active:scale-98 shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF6EC] flex items-center justify-center border-2 border-black rotate-2">
                  <Inbox className={`w-4 h-4 ${pendingItems.length > 0 ? "text-[#8B2C1E]" : "text-[#7A6A55]"}`} />
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-[#1A1A1A] text-sm font-extrabold">
                    未分配暂存收件箱
                  </h4>
                  <p className="text-[10px] text-[#7A6A55] font-sans">
                    从 Safari 暂存的内容，在此做分配
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-black/20 ${
                  pendingItems.length > 0 ? "bg-[#8B2C1E]/15 text-[#8B2C1E]" : "bg-gray-100 text-[#7A6A55]"
                }`}>
                  {pendingItems.length}
                </span>
                <ChevronRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        )}

        {/* 5. Device Settings Option inside simulator frame */}
        {showDeviceSettings && (
          <div className="text-left space-y-5 py-2 animate-[fadeIn_0.25s_ease]">
            {/* Header Settings */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/10">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4.5 h-4.5 text-[#8B2C1E]" />
                <h3 className="text-sm font-black text-[#1A1A1A]">时光匣沙箱属性</h3>
              </div>
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="text-[#7A6A55] text-xs hover:text-[#1C1C1E] transition flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 确认
              </button>
            </div>

            {/* Simulated Notifications clock configuration with double stroked buttons */}
            <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4 rounded-xl space-y-3 shadow">
              <h4 className="text-[10.5px] font-black text-[#8B2C1E] uppercase tracking-wider flex items-center gap-1 block">
                <BellRing className="w-3.5 h-3.5 text-[#8B2C1E]" /> 灵感回声提醒推送
              </h4>
              <p className="text-[10.5px] text-[#7A6A55] leading-relaxed">
                每天定时，在毫无压力的情况下，系统会在你选择的时间唤醒你，触发一条旧收藏的金句，提问引导你：“此句你还记得吗？”：
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                <div className="space-y-1">
                  <span className="text-[9.5px] text-[#7A6A55] font-bold">推送频率</span>
                  <select
                    value={echoFrequency}
                    onChange={(e) => setEchoFrequency(e.target.value)}
                    className="w-full bg-[#FAF6EC] border-2 border-[#1A1A1A] rounded-lg h-8 px-1.5 text-xs text-[#1A1A1A] focus:outline-none cursor-pointer"
                  >
                    <option value="daily">每天 1 条</option>
                    <option value="thrice_weekly">每周 3 次</option>
                    <option value="weekly">每周 1 次</option>
                    <option value="off">完全静音</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9.5px] text-[#7A6A55] font-bold">设定回声时间</span>
                  <input
                    type="time"
                    value={echoHour}
                    onChange={(e) => setEchoHour(e.target.value)}
                    disabled={echoFrequency === "off"}
                    className="w-full bg-[#FAF6EC] border-2 border-[#1A1A1A] rounded-lg h-8 px-1.5 text-xs text-[#1A1A1A] focus:outline-none disabled:opacity-40 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Custom Sandbox Stationery styling */}
            <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4 rounded-xl space-y-3.5 shadow select-none">
              <h4 className="text-[10.5px] font-black text-[#8B2C1E] uppercase tracking-wider block">
                🎨 沙箱手账材质定制
              </h4>
              <p className="text-[10.5px] text-[#7A6A55] leading-relaxed">
                在这里设计你模拟页面的底噪纸张风格与名画背景虚化材质：
              </p>

              {/* Step 1: select type of paper */}
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[
                  { id: "cream", name: "暖象牙" },
                  { id: "lined", name: "横格纸" },
                  { id: "kraft", name: "牛皮纸" },
                  { id: "custom", name: "自定义" }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChangePaperStyle && onChangePaperStyle(p.id as any)}
                    className={`py-1 rounded-lg border text-center font-bold text-[10px] font-zh-hand transition duration-150 cursor-pointer ${
                      paperStyle === p.id
                        ? "bg-[#1A1A1A] text-[#FAF6EC] border-transparent shadow shadow-[#1A1A1A]/40"
                        : "bg-white text-[#7A6A55] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Sub items for Custom PaperStyle */}
              {paperStyle === "custom" && (
                <div className="p-3 bg-[#8B2C1E]/5 border border-dashed border-[#8B2C1E]/30 rounded-xl space-y-3 animate-[fadeIn_0.15s_ease] text-left">
                  {/* Selected Bg tint */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#7A6A55] uppercase">
                    <span>✨ 自选卡片背景色:</span>
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => onChangeCustomBgColor && onChangeCustomBgColor(e.target.value)}
                      className="w-5 h-5 border-0 p-0 cursor-pointer rounded-full overflow-hidden shrink-0"
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-1 pt-0.5">
                    {[
                      { color: "#F0EAD6", title: "蛋壳" },
                      { color: "#FAF0E6", title: "亚麻" },
                      { color: "#FFFDF0", title: "麦黄" },
                      { color: "#E0EEE0", title: "薄荷" },
                      { color: "#F0F8FF", title: "冰川" }
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => onChangeCustomBgColor && onChangeCustomBgColor(preset.color)}
                        className="w-5 h-5 rounded-full border border-black/20 shadow-sm hover:scale-110 active:scale-95 duration-100 transition cursor-pointer"
                        style={{ backgroundColor: preset.color }}
                        title={preset.title}
                      />
                    ))}
                  </div>

                  {/* Surface pattern textures */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#7A6A55] uppercase block">水印折痕肌理:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: "solid", name: "纯色" },
                        { id: "lines", name: "横线" },
                        { id: "dots", name: "点阵" },
                        { id: "grid", name: "网格" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onChangeCustomBgTexture && onChangeCustomBgTexture(t.id)}
                          className={`text-[9px] py-0.5 rounded border text-center font-extrabold cursor-pointer transition ${
                            customBgTexture === t.id
                              ? "bg-[#8B2C1E] text-white border-transparent"
                              : "bg-white text-[#7A6A55] border-black/10 hover:border-black/30"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Monet-inspired Masterpieces Wallpapers */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9.5px] font-bold text-[#7A6A55] uppercase">
                      <span>🖼️ 馆藏名作背景纸:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] text-[#8B2C1E]">启用</span>
                        <input
                          type="checkbox"
                          checked={customImageEnabled}
                          onChange={(e) => onChangeCustomImageEnabled && onChangeCustomImageEnabled(e.target.checked)}
                          className="w-3 h-3 rounded text-[#8B2C1E] focus:ring-[#8B2C1E] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {[
                        { name: "莫奈·睡莲", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=40" },
                        { name: "莫奈·春天", url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=40" },
                        { name: "梵高·杏花", url: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=40" },
                        { name: "梵高·星流", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=40" },
                        { name: "塞尚·古典", url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=400&q=40" },
                        { name: "波浪·浮世", url: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=400&q=40" }
                      ].map((art) => {
                        const isSelected = customImageUrl === art.url && customImageEnabled;
                        return (
                          <button
                            key={art.name}
                            type="button"
                            onClick={() => {
                              onChangeCustomImageUrl && onChangeCustomImageUrl(art.url);
                              onChangeCustomImageEnabled && onChangeCustomImageEnabled(true);
                            }}
                            className={`px-1.5 py-1 text-[8.5px] font-bold rounded-md border truncate cursor-pointer transition flex items-center justify-center ${
                              isSelected
                                ? "bg-[#8B2C1E] text-white border-transparent shadow-sm"
                                : "bg-white text-[#7A6A55] border-black/10 hover:border-black/25"
                            }`}
                            title={art.name}
                          >
                            🎨 {art.name.split("·")[1] || art.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* New Opacity controller slider */}
                    {customImageEnabled && customImageUrl && (
                      <div className="space-y-1 pt-1.5 border-t border-[#8B2C1E]/10">
                        <div className="flex items-center justify-between text-[8px] font-bold text-[#7A6A55]">
                          <span>🎚️ 材质透光度 (油彩饱和):</span>
                          <span className="font-mono text-[#8B2C1E]">{customWallpaperOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="95"
                          step="5"
                          value={customWallpaperOpacity}
                          onChange={(e) => onChangeCustomWallpaperOpacity && onChangeCustomWallpaperOpacity(Number(e.target.value))}
                          className="w-full accent-[#8B2C1E] h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                     {/* Raw URL Input & Drag-Drop Zone */}
                     <div className="space-y-2 block pt-1.5 border-t border-[#8B2C1E]/10">
                       <span className="text-[8px] font-bold text-[#7A6A55] block font-zh-hand">自拟壁纸 (拖曳 / 粘贴 / URL):</span>
                       
                       {/* Retro Clip Drag Zone */}
                       <div 
                         onDragEnter={handleDrag}
                         onDragOver={handleDrag}
                         onDragLeave={handleDrag}
                         onDrop={handleDrop}
                         onPaste={handlePasteEvent}
                         className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer relative ${
                           dragActive 
                             ? "border-[#8B2C1E] bg-[#8B2C1E]/5 scale-102" 
                             : "border-[#7A6A55]/30 bg-[#FAF6EC]/50 hover:bg-[#FAF6EC] hover:border-[#7A6A55]/50"
                         }`}
                         onClick={() => fileInputRef.current?.click()}
                       >
                         <input 
                           type="file"
                           ref={fileInputRef}
                           onChange={handleFileInputChange}
                           accept="image/*"
                           className="hidden"
                         />
                         
                         {/* Decorative paperclip top hanger */}
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                           <Paperclip className="w-4 h-4 text-[#8B2C1E] drop-shadow-sm rotate-12" />
                         </div>

                         <div className="flex flex-col items-center justify-center space-y-1.5 pt-1">
                           <ImagePlus className="w-5 h-5 text-[#8B2C1E]/60 animate-pulse" />
                           <div className="space-y-0.5">
                             <p className="text-[10px] font-black text-[#1A1A1A] font-zh-hand">拖放外部壁纸 / 插画到此</p>
                             <p className="text-[8px] text-[#7A6A55] font-zh-hand select-none">或点击浏览，支持直接 <kbd className="px-1 py-0.5 bg-[#FAF6EC] border border-black/10 rounded font-mono text-[7px]" onClick={(e)=>e.stopPropagation()}>Ctrl+V</kbd> 贴图</p>
                           </div>
                         </div>

                         {/* If current URL is a base64 image, display a beautiful scrap preview in retro polaroid vibe */}
                         {customImageUrl && customImageUrl.startsWith("data:image/") && (
                           <div className="mt-2.5 p-1.5 bg-white border border-black/15 rounded-lg flex items-center justify-between gap-2 shadow-inner" onClick={(e) => e.stopPropagation()}>
                             <div className="flex items-center gap-1.5 overflow-hidden">
                               <img src={customImageUrl} alt="uploaded thumbnail" className="w-7 h-7 object-cover rounded border border-black/10" referrerPolicy="no-referrer" />
                               <div className="text-left leading-none font-zh-hand">
                                 <span className="text-[8px] font-black text-[#8B2C1E] block">已就绪 (本地图)</span>
                                 <span className="text-[7.5px] text-[#7A6A55] font-mono block truncate w-32">base64 encoded sync bundle</span>
                               </div>
                             </div>
                             <button
                               type="button"
                               onClick={() => {
                                 onChangeCustomImageUrl && onChangeCustomImageUrl("");
                               }}
                               className="px-1.5 py-0.5 border border-black/20 rounded text-[7.5px] font-bold text-[#8B2C1E] hover:bg-red-50 cursor-pointer font-zh-hand"
                             >
                               清除
                             </button>
                           </div>
                         )}
                       </div>

                       {/* Raw URL Input as secondary alternative */}
                       <input
                         type="text"
                         placeholder="或粘贴自拟 HTTPS 艺术材质图片地址"
                         value={customImageUrl && !customImageUrl.startsWith("data:image/") ? customImageUrl : ""}
                         onChange={(e) => {
                           onChangeCustomImageUrl && onChangeCustomImageUrl(e.target.value);
                           if (e.target.value) {
                             onChangeCustomImageEnabled && onChangeCustomImageEnabled(true);
                           }
                         }}
                         className="w-full px-2 py-0.5 bg-white border border-black/15 rounded text-[8.5px] font-mono focus:outline-none focus:border-[#8B2C1E]"
                       />
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Ink Font family configuration in visual paper panel */}
            <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4 rounded-xl space-y-3 shadow select-none">
              <h4 className="text-[10.5px] font-black text-[#8B2C1E] uppercase tracking-wider block">
                🖋️ 墨书字迹工坊
              </h4>
              <p className="text-[10.5px] text-[#7A6A55] leading-relaxed">
                手账的灵魂在于笔迹。选择属于你偏爱的字型，它将立刻应用到整本思维手册：
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 font-zh-hand font-extrabold">
                {[
                  { id: "brush_thin", name: "🖋️ 苍松枯笔", style: { fontFamily: '"Liu Jian Mao Cao", cursive' } },
                  { id: "brush_bold", name: "✒️ 狂草行韵", style: { fontFamily: '"Ma Shan Zheng", cursive' } },
                  { id: "cute_hand", name: "📝 轻快手札", style: { fontFamily: '"Kalam", "Ma Shan Zheng", cursive' } },
                  { id: "classic_serif", name: "📜 古雅宋体", style: { fontFamily: '"Noto Serif SC", serif' } },
                  { id: "sans", name: "💻 极简现代", style: { fontFamily: '"Inter", sans-serif' } }
                ].map((fontItem) => {
                  const isActive = activeFont === fontItem.id;
                  return (
                    <button
                      key={fontItem.id}
                      type="button"
                      onClick={() => onChangeActiveFont && onChangeActiveFont(fontItem.id)}
                      className={`py-1 px-2.5 rounded-xl border-2 text-left text-xs truncate transition cursor-pointer font-bold ${
                        isActive 
                          ? "bg-[#8B2C1E]/5 border-[#8B2C1E] text-[#8B2C1E] scale-102" 
                          : "bg-white border-black/10 text-[#1A1A1A] hover:bg-[#FAF6EC]/80"
                      }`}
                      style={fontItem.style}
                    >
                      {fontItem.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SQLite system recovery backup options */}
            <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4 rounded-xl space-y-2.5 shadow">
              <h4 className="text-[10.5px] font-black text-[#8B2C1E] uppercase tracking-wider block flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#8B2C1E]" /> 属性数据安全
              </h4>
              <p className="text-[10px] text-[#7A6A55] leading-relaxed">
                巨人是 iOS 设备上的离线程序。点击下方一键打包你的 sqlite 存档备份为 Json 离线包。
              </p>
              
              <div className="flex gap-2 pt-1 font-zh-hand text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onTriggerExport();
                    setShowDeviceSettings(false);
                  }}
                  className="flex-1 py-1 px-2.5 border-2 border-[#1A1A1A] bg-white hover:bg-[#FAF6EC] transition font-bold rounded-lg text-[10.5px] cursor-pointer inline-flex items-center justify-center gap-1 select-none active:scale-95 duration-100"
                >
                  <HardDriveDownload className="w-3 h-3 text-[#1A1A1A]" />
                  导出 Json 备份
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("确定清除目前的全部修改并复原到默认 5 位巨人状态吗？")) {
                      onTriggerReset();
                      setShowDeviceSettings(false);
                    }
                  }}
                  className="py-1 px-2.5 border-2 border-[#8B2C1E] bg-[#8B2C1E]/5 hover:bg-[#8B2C1E] hover:text-[#FAF6EC] text-[#8B2C1E] transition font-bold rounded-lg text-[10.5px] cursor-pointer inline-flex items-center justify-center gap-1 select-none active:scale-95 duration-100"
                >
                  <RefreshCw className="w-3 h-3" />
                  复原默认
                </button>
              </div>

            </div>

            <div className="text-center font-mono text-[9px] text-[#7A6A55] select-none pt-2">
              <p className="font-bold">Giants Sandbox Engine</p>
              <p className="opacity-70">SQLite Persistable Sandbox v1.0.0</p>
            </div>

          </div>
        )}

      </div>

      {/* 5. Retro Styled Polaroid Modal Popup for Adding Giants */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-[fadeIn_0.25s_ease]">
          <form
            onSubmit={handleCreateGiant}
            className="bg-[#FFFDF7] border-3 border-[#1A1A1A] w-[275px] rounded-2xl p-5 space-y-4 shadow-2xl relative text-left animate-[scaleUp_0.25s_cubic-bezier(0.175,0.885,0.32,1.275)]"
          >
            {/* Pinned visual */}
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
              <PushPin size={15} color="var(--red)" />
            </div>

            <div className="space-y-1 border-b border-dashed border-[#1A1A1A]/10 pb-2">
              <h3 className="text-sm font-black text-[#1A1A1A]">添加新的启发巨人</h3>
              <p className="text-[10.5px] text-[#7A6A55]">
                他在改变或启发你的人生吗？把他供奉在这里。
              </p>
            </div>

            <div className="space-y-3 text-xs leading-none">
              <div className="space-y-1">
                <label className="text-[#1A1A1A] text-[9.5px] font-extrabold uppercase tracking-wide">导师名字 / 称谓 ID</label>
                <input
                  type="text"
                  placeholder="例：Paul Graham 或 karpathy..."
                  value={newGiantName}
                  onChange={(e) => setNewGiantName(e.target.value)}
                  className="w-full bg-[#FAF6EC] border-2 border-[#1A1A1A] rounded-xl px-2.5 py-2 text-[#1A1A1A] text-xs font-zh-hand font-bold focus:outline-none focus:border-[#8B2C1E]"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#1A1A1A] text-[9.5px] font-extrabold uppercase tracking-wide">他的核心标签 (一句话)</label>
                <input
                  type="text"
                  placeholder="例：把复杂的东西讲得极度明晰..."
                  value={newGiantDesc}
                  onChange={(e) => setNewGiantDesc(e.target.value)}
                  className="w-full bg-[#FAF6EC] border-2 border-[#1A1A1A] rounded-xl px-2.5 py-2 text-[#1A1A1A] text-xs font-zh-hand font-bold focus:outline-none focus:border-[#8B2C1E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[#1A1A1A]/20 bg-white hover:bg-gray-100 text-[#7A6A55] font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                id="btn-create-giant-submit"
                className="px-3.5 py-1.5 rounded-lg border-2 border-transparent bg-[#1A1A1A] hover:bg-black text-white font-bold transition active:scale-95 cursor-pointer"
              >
                画下此巨人
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
