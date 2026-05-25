import { useState, useEffect, CSSProperties } from "react";
import { Giant, CapturedItem, MockWebPage, ContentType } from "../types";
import MainAppView from "./MainAppView";
import GiantDetails from "./GiantDetails";
import ShareExtension from "./ShareExtension";
import CosmicBackground from "./CosmicBackground";
import { Tape, StarDoodle, SparkleDoodle, CircleHighlight, PushPin } from "./ScrapbookPrimitives";
import { Wifi, Battery, ChevronLeft, Inbox, Trash2, BellRing } from "lucide-react";

interface DeviceSimulatorProps {
  giants: Giant[];
  items: CapturedItem[];
  
  // Elevated navigation states
  activeScreen: "home" | "details" | "pending_inbox";
  setActiveScreen: (screen: "home" | "details" | "pending_inbox") => void;
  selectedGiantId: string | null;
  setSelectedGiantId: (id: string | null) => void;
  showDeviceSettings: boolean;
  setShowDeviceSettings: (show: boolean) => void;
  
  // Custom scrapbook visual tweaks
  paperStyle: "cream" | "lined" | "kraft" | "custom";
  customBgColor?: string;
  customBgTexture?: string;
  customImageUrl?: string;
  customImageEnabled?: boolean;
  customWallpaperOpacity?: number;
  onChangePaperStyle?: (style: "cream" | "lined" | "kraft" | "custom") => void;
  onChangeCustomBgColor?: (color: string) => void;
  onChangeCustomBgTexture?: (texture: string) => void;
  onChangeCustomImageUrl?: (url: string) => void;
  onChangeCustomImageEnabled?: (enabled: boolean) => void;
  onChangeCustomWallpaperOpacity?: (opacity: number) => void;
  doodleDensity: number;
  photoRotation: number;
  isNightMode: boolean;

  onAddGiant: (name: string, description: string) => string; // returns newly created giantId
  onUpdateItem: (itemId: string, updates: Partial<CapturedItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onEditGiantTagline: (giantId: string, newTagline: string) => void;
  
  // Backside hooks to communicate with simulated web pages
  activePageToShare: MockWebPage;
  selectedTextSnippet?: string;
  isShareSheetOpen: boolean;
  setIsShareSheetOpen: (open: boolean) => void;
  
  // Trigger export
  onTriggerExport: () => void;
  onTriggerReset: () => void;
  
  // Local notification engine
  notificationBanner: { show: boolean; item?: CapturedItem } | null;
  setNotificationBanner: (banner: { show: boolean; item?: CapturedItem } | null) => void;
  
  // Fast Pinned and Mute triggers
  onTogglePinGiant?: (id: string) => void;
  onToggleMuteEchoGiant?: (id: string) => void;
  activeFont?: string;
  onChangeActiveFont?: (fontId: string) => void;
}

export default function DeviceSimulator({
  giants,
  items,
  activeScreen,
  setActiveScreen,
  selectedGiantId,
  setSelectedGiantId,
  showDeviceSettings,
  setShowDeviceSettings,
  paperStyle,
  customBgColor = "#FAF0E6",
  customBgTexture = "solid",
  customImageUrl = "",
  customImageEnabled = false,
  customWallpaperOpacity = 35,
  onChangePaperStyle,
  onChangeCustomBgColor,
  onChangeCustomBgTexture,
  onChangeCustomImageUrl,
  onChangeCustomImageEnabled,
  onChangeCustomWallpaperOpacity,
  doodleDensity,
  photoRotation,
  isNightMode,
  onAddGiant,
  onUpdateItem,
  onDeleteItem,
  onEditGiantTagline,
  activePageToShare,
  selectedTextSnippet,
  isShareSheetOpen,
  setIsShareSheetOpen,
  onTriggerExport,
  onTriggerReset,
  notificationBanner,
  setNotificationBanner,
  onTogglePinGiant,
  onToggleMuteEchoGiant,
  activeFont,
  onChangeActiveFont,
}: DeviceSimulatorProps) {
  // System time clock string
  const [systemTime, setSystemTime] = useState("10:00");

  const fontsMap: { [key: string]: string } = {
    brush_thin: '"Liu Jian Mao Cao", cursive, serif',
    brush_bold: '"Ma Shan Zheng", cursive, serif',
    cute_hand: '"Kalam", "Ma Shan Zheng", cursive',
    classic_serif: '"Noto Serif SC", Georgia, serif',
    sans: '"Inter", sans-serif'
  };

  const activeFontFamily = fontsMap[activeFont || "classic_serif"] || fontsMap.classic_serif;

  useEffect(() => {
    // Sync system clock to simulated phone bar representation
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, "0");
      let minutes = now.getMinutes().toString().padStart(2, "0");
      setSystemTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectGiant = (giantId: string) => {
    setSelectedGiantId(giantId);
    setActiveScreen("details");
    setShowDeviceSettings(false);
  };

  const handleSelectPendingInbox = () => {
    setActiveScreen("pending_inbox");
    setShowDeviceSettings(false);
  };

  const handleSelectEchoItem = (item: CapturedItem) => {
    setShowDeviceSettings(false);
    if (item.giantId) {
      setSelectedGiantId(item.giantId);
      setActiveScreen("details");
    } else {
      setActiveScreen("pending_inbox");
    }
  };

  const currentGiant = giants.find((g) => g.id === selectedGiantId) || giants[0];
  const currentGiantItems = items.filter((item) => item.giantId === (currentGiant?.id || null));
  const otherGiants = giants.filter((g) => g.id !== (currentGiant?.id || null));
  const pendingItems = items.filter((item) => item.giantId === null);

  // Quick Inline Giant created inside extension callback
  const handleAddGiantInline = (name: string, description?: string): string => {
    return onAddGiant(name, description || "快速收集创建");
  };

  // Successful share sheet save callback
  const handleCaptureSuccess = (giantId: string | null, emoji: string | null, thought: string, finalTitle: string) => {
    const itemDomain = activePageToShare.domain;
    
    const newItem: CapturedItem = {
      id: "clipping-" + Date.now().toString(),
      giantId: giantId,
      contentType: selectedTextSnippet ? ContentType.Text : activePageToShare.type,
      title: finalTitle,
      url: selectedTextSnippet ? undefined : activePageToShare.url,
      fullText: selectedTextSnippet || undefined,
      sourceDomain: itemDomain,
      emoji: emoji || undefined,
      thought: thought.trim() ? thought.trim() : undefined,
      capturedAt: new Date().toISOString(),
    };

    (window as any).__onInjectCapturedItem?.(newItem);
    setIsShareSheetOpen(false);

    // If successfully added, jump to that page inside phone
    if (giantId) {
      handleSelectGiant(giantId);
    } else {
      handleSelectPendingInbox();
    }
  };

  // Identify applicable paper styles
  const getPaperClass = () => {
    if (isNightMode) return "paper-night";
    if (paperStyle === "lined") return "paper-lined";
    if (paperStyle === "kraft") return "paper-kraft";
    if (paperStyle === "custom") return ""; // Will apply custom inline styles
    return "paper-cream";
  };

  const getCustomPaperStyle = () => {
    if (isNightMode || paperStyle !== "custom") return {};
    
    const styles: CSSProperties = {
      backgroundColor: customBgColor,
      color: "#1A1A1A",
      position: "relative",
    };

    if (customBgTexture === "grid") {
      styles.backgroundImage = "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)";
      styles.backgroundSize = "20px 20px";
    } else if (customBgTexture === "dots") {
      styles.backgroundImage = "radial-gradient(rgba(0,0,0,0.12) 1.5px, transparent 1.5px)";
      styles.backgroundSize = "20px 20px";
    } else if (customBgTexture === "lines") {
      styles.backgroundImage = "repeating-linear-gradient(to bottom, transparent 0 24px, rgba(120, 160, 200, 0.12) 24px 25px)";
      styles.backgroundSize = "100% 25px";
    }
    return styles;
  };

  const textContrastClass = isNightMode ? "text-[#EDE3D2]" : "text-[#1A1A1A]";

  return (
    <div className="relative mx-auto mt-2 mb-8 select-none font-sans">
      
      {/* Tape on top borders to simulate phone being glued/pinned to desk */}
      <div className="absolute -top-6 -left-6 z-20">
        <Tape color="yellow" width={90} height={20} rotate={-15} />
      </div>
      <div className="absolute -top-7 -right-7 z-20">
        <Tape color="pink" width={90} height={20} rotate={15} />
      </div>

      {/* Decorative notebook bookmark peeking out on the side */}
      <div className="absolute top-28 -right-4 w-5 h-12 bg-[#8B2C1E] rounded-r border-y border-r border-[#1A1A1A] z-0 shadow-sm flex items-center justify-center pointer-events-none">
        <span className="text-[7px] text-[#FAF6EC] uppercase rotate-90 tracking-widest font-mono font-bold">GIANT</span>
      </div>

      {/* Physical iPhone 15 Pro bezel structure styled with elegant ink-sketched dark silver border */}
      <div 
        style={{ 
          fontFamily: activeFontFamily,
          ["--font-zh-hand" as any]: activeFontFamily
        }}
        className="relative mx-auto w-[335px] h-[670px] rounded-[42px] border-[8px] border-[#1A1A1A] bg-[#FFFDF7] shadow-[0_20px_50px_rgba(30,20,10,0.22)] overflow-hidden flex flex-col z-10 select-none ring-3 ring-black/10"
      >
        
        {/* Top iOS Status Bar details adjusted cleanly to text contrast */}
        <div className={`absolute top-0 inset-x-0 h-10 px-5 flex items-center justify-between text-[11px] font-mono font-semibold tracking-tight z-40 select-none pointer-events-none ${
          isNightMode ? "text-[#FAF6EC]/80" : "text-[#1A1A1A]"
        }`}>
          <span className="text-xs pt-1.5 pl-1">{systemTime}</span>
          <div className="flex items-center gap-1.5 pt-1.5 pr-1">
            <span className={`text-[8px] uppercase tracking-wide px-1.2 py-0.2 rounded font-mono border ${
              isNightMode ? "bg-[#FFFDF7]/10 text-[#C9A961] border-white/10" : "bg-[#1A1A1A]/10 text-[#8B2C1E] border-black/10"
            }`}>5G</span>
            <Wifi className="w-3.5 h-3.5 opacity-80" />
            <Battery className="w-4 h-3.5 opacity-90 text-[#8B2C1E]" />
          </div>
        </div>

        {/* Dynamic Island Notch cutout */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-6 rounded-full bg-black z-50 flex items-center justify-between px-3 select-none pointer-events-none">
          <div className="w-1 h-1 rounded-full bg-red-800/80 animate-pulse" />
          <div className="w-2 h-1 rounded-full bg-[#1A1A1A]" />
          <div className="w-1 h-1 rounded-full bg-white/10" />
        </div>

        {/* ─── VIEWPORT CONTENT AREA WITH SELECTED PAPER TEXTURE ─── */}
        <div 
          className={`flex-1 pt-10 pb-4 overflow-hidden relative z-10 flex flex-col ${getPaperClass()}`}
          style={getCustomPaperStyle()}
        >
          {/* Enhanced Artistic Custom Wallpaper Layer with Opacity Control */}
          {paperStyle === "custom" && customImageEnabled && customImageUrl && !isNightMode && (
            <div 
              className="absolute inset-0 pointer-events-none select-none z-0"
              style={{
                backgroundImage: `url("${customImageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: (customWallpaperOpacity ?? 35) / 100,
                mixBlendMode: "multiply", 
              }}
            />
          )}
          
          {/* iOS Push Notification slide-down sticker banner inside device frame */}
          {notificationBanner && notificationBanner.show && notificationBanner.item && (
            <div
              onClick={() => {
                if (notificationBanner.item) {
                  setNotificationBanner(null);
                  handleSelectEchoItem(notificationBanner.item);
                }
              }}
              id="push-notification-banner"
              className="absolute top-1 inset-x-2.5 mx-auto bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl p-3 shadow-xl flex items-start gap-2.5 z-55 animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)] select-none hover:bg-[#F5F0EA] cursor-pointer"
            >
              <div 
                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-zh-hand text-[#FFFDF7] border-2 border-black rotate-3" 
                style={{ backgroundColor: 'var(--red, #8B2C1E)' }}
              >
                {giants.find(g => g.id === notificationBanner.item?.giantId)?.avatarInitials || "KP"}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5 text-left font-zh-hand">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B2C1E] tracking-tight uppercase">
                    {giants.find(g => g.id === notificationBanner.item?.giantId)?.name || "灵感回声"} 推送
                  </span>
                  <span className="text-[8px] text-[#7A6A55] font-mono uppercase">刚刚</span>
                </div>
                <h4 className="text-[#1A1A1A] text-[11.5px] leading-tight truncate font-bold">
                  “{notificationBanner.item.title}”
                </h4>
                <p className="text-[9px] text-[#7A6A55] select-none leading-relaxed">
                  💡 听见了你脑海里的叹息，请立刻回应写点什么
                </p>
              </div>
              <div className="absolute -top-1.5 -left-1">
                <PushPin size={10} />
              </div>
            </div>
          )}

          {/* Router Outlet Screen Switcher inside iOS client */}
          <div className="flex-1 overflow-hidden relative z-10">
            {activeScreen === "home" && (
              <MainAppView
                giants={giants}
                items={items}
                onSelectGiant={handleSelectGiant}
                onSelectPendingInbox={handleSelectPendingInbox}
                onAddGiant={onAddGiant}
                onSelectEchoItem={handleSelectEchoItem}
                onTriggerExport={onTriggerExport}
                onTriggerReset={onTriggerReset}
                onTogglePinGiant={onTogglePinGiant}
                showDeviceSettings={showDeviceSettings}
                setShowDeviceSettings={setShowDeviceSettings}
                photoRotation={photoRotation}
                isNightMode={isNightMode}
                activeFont={activeFont}
                onChangeActiveFont={onChangeActiveFont}
                paperStyle={paperStyle}
                onChangePaperStyle={onChangePaperStyle}
                customBgColor={customBgColor}
                onChangeCustomBgColor={onChangeCustomBgColor}
                customBgTexture={customBgTexture}
                onChangeCustomBgTexture={onChangeCustomBgTexture}
                customImageUrl={customImageUrl}
                onChangeCustomImageUrl={onChangeCustomImageUrl}
                customImageEnabled={customImageEnabled}
                onChangeCustomImageEnabled={onChangeCustomImageEnabled}
                customWallpaperOpacity={customWallpaperOpacity}
                onChangeCustomWallpaperOpacity={onChangeCustomWallpaperOpacity}
              />
            )}

            {activeScreen === "details" && currentGiant && (
              <GiantDetails
                giant={currentGiant}
                items={currentGiantItems}
                otherGiants={otherGiants}
                onBack={() => {
                  setActiveScreen("home");
                  setShowDeviceSettings(false);
                }}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
                onEditGiantTagline={onEditGiantTagline}
                onToggleMuteEcho={onToggleMuteEchoGiant}
                isNightMode={isNightMode}
                photoRotation={photoRotation}
              />
            )}

            {activeScreen === "pending_inbox" && (
              <div className={`flex flex-col h-full text-[#1A1A1A] select-none overflow-hidden animate-[fadeIn_0.3s_ease] font-zh-hand`}>
                
                {/* Header Box */}
                <div className="p-3 px-4 border-b-2 border-dashed border-[#1A1A1A]/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveScreen("home");
                      setShowDeviceSettings(false);
                    }}
                    className="text-[#7A6A55] hover:text-[#1A1A1A] flex items-center gap-0.5 py-1 cursor-pointer active:scale-95 duration-100 font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>首页</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Inbox className="w-3.5 h-3.5 text-[#8B2C1E]" />
                    <h3 className="text-sm font-bold tracking-tight">暂存收件箱</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#8B2C1E] bg-[#8B2C1E]/10 border border-[#8B2C1E]/20 px-2 py-0.5 rounded-full leading-none">
                    {pendingItems.length}
                  </span>
                </div>

                {/* Items scroll zone */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                  <div className="bg-[#FFFDF7] p-3.5 border-2 border-dashed border-[#1A1A1A]/20 rounded-xl text-[11px] text-[#7A6A55] leading-relaxed shadow-sm">
                    📜 你在外部点击「稍后分配」放入缓存的内容，正躺在下面的纸篓里。在这里给每句话指认它的主人导师，以便收纳归档。
                  </div>

                  {pendingItems.length === 0 ? (
                    <div className="text-center py-16 space-y-2 select-none">
                      <Inbox className="w-9 h-9 text-[#7A6A55] mx-auto opacity-35" />
                      <p className="text-[#1A1A1A] text-sm font-bold">待收件箱空空如也</p>
                      <p className="text-[10px] text-[#7A6A55]">Nice！所有的闪光文摘都已妥帖指派。</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingItems.map((item) => (
                        <div
                          key={item.id}
                          id={`pending-inbox-row-${item.id}`}
                          className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl p-4 space-y-3 shadow-md relative"
                        >
                          <div className="space-y-1 text-left">
                            <h4 className="text-xs font-bold text-[#1A1A1A] leading-relaxed select-text">
                              {item.contentType === ContentType.Text && `“`}
                              {item.title}
                              {item.contentType === ContentType.Text && `”`}
                            </h4>
                            {item.url && (
                              <span className="text-[9px] text-[#7A6A55] font-mono block select-all break-all leading-normal">{item.url}</span>
                            )}
                          </div>

                          {item.thought && (
                            <div className="bg-[#FAF6EC] p-2.5 rounded-xl border border-[#1A1A1A]/10 italic text-[11px] text-[#7A6A55] leading-relaxed text-left">
                              💭 {item.thought}
                            </div>
                          )}

                          {/* Dispatch dispatcher select box */}
                          <div className="flex flex-col gap-2 pt-2 border-t border-[#1A1A1A]/10 text-[10.5px]">
                            <div className="flex items-center gap-1.5 select-none font-bold text-[#7A6A55]">
                              <span>选择归位归档巨人:</span>
                            </div>
                            
                            <div className="flex gap-1.5 items-center">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    onUpdateItem(item.id, { giantId: e.target.value });
                                  }
                                }}
                                className="flex-1 bg-[#FAF6EC] border-2 border-[#1A1A1A] rounded-lg h-8 px-2 text-xs text-[#8B2C1E] focus:outline-none font-zh-hand font-bold cursor-pointer"
                              >
                                <option value="">🎯 选择分配归属的巨人...</option>
                                {giants.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.name}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => {
                                  if (window.confirm("要物理销毁这一条暂存闪光记录吗？")) {
                                    onDeleteItem(item.id);
                                  }
                                }}
                                className="w-8 h-8 shrink-0 bg-[#8B2C1E]/10 hover:bg-[#8B2C1E] border border-[#8B2C1E]/30 text-[#8B2C1E] hover:text-[#FFFDF7] flex items-center justify-center rounded-lg transition active:scale-95 duration-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Tape slice decoration */}
                          <div className="absolute top-1.5 right-6">
                            <Tape color="pink" width={34} height={9} rotate={-10} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share Extension Captured Modal Panel sheet overlays inside device frame */}
          <ShareExtension
            isOpen={isShareSheetOpen}
            onClose={() => setIsShareSheetOpen(false)}
            giants={giants}
            onAddGiantInline={handleAddGiantInline}
            pageToShare={activePageToShare}
            selectedTextSnippet={selectedTextSnippet}
            onCaptureSuccess={handleCaptureSuccess}
            isNightMode={isNightMode}
          />

        </div>

        {/* IOS Virtual Bottom Home indicator pill bar styled dark for clear screen clarity */}
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-28 h-1 rounded-full bg-black/40 z-50 pointer-events-none" />

      </div>
    </div>
  );
}
