import { useState, useEffect } from "react";
import { Giant, CapturedItem, ContentType, MockWebPage } from "./types";
import { INITIAL_GIANTS, INITIAL_ITEMS, MOCK_SHAREABLE_PAGES } from "./initialData";
import DeviceSimulator from "./components/DeviceSimulator";
import { 
  Tape, StarDoodle, HeartDoodle, SparkleDoodle, InkButton, 
  ArrowDoodle, UnderlineDoodle, PushPin, CircleHighlight 
} from "./components/ScrapbookPrimitives";
import { 
  Plus, Settings, Inbox, Copy, Share2, FileText, Globe, RefreshCw, 
  CheckCircle, Database, BellRing, Sliders, Moon, Sun, 
  HelpCircle, Sparkles, BookOpen, Clock, SlidersHorizontal, Compass, HelpCircle as HelpIcon, ArrowLeft
} from "lucide-react";

export default function App() {
  // 1. Core State with local storage sync
  const [giants, setGiants] = useState<Giant[]>(() => {
    const saved = localStorage.getItem("giants_db");
    return saved ? JSON.parse(saved) : INITIAL_GIANTS;
  });

  const [items, setItems] = useState<CapturedItem[]>(() => {
    const saved = localStorage.getItem("items_db");
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  // 1.5 elevated screen routers for bi-directional directory controls
  const [activeScreen, setActiveScreen] = useState<"home" | "details" | "pending_inbox">("home");
  const [selectedGiantId, setSelectedGiantId] = useState<string | null>(INITIAL_GIANTS[0]?.id || null);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Custom scrapbook visual tweaks
  const [paperStyle, setPaperStyle] = useState<"cream" | "lined" | "kraft" | "custom">(() => {
    return (localStorage.getItem("giants_paper_style") as any) || "cream";
  });
  const [customBgColor, setCustomBgColor] = useState<string>(() => {
    return localStorage.getItem("giants_custom_bg_color") || "#FAF0E6";
  });
  const [customBgTexture, setCustomBgTexture] = useState<string>(() => {
    return localStorage.getItem("giants_custom_bg_texture") || "solid";
  });
  const [customImageUrl, setCustomImageUrl] = useState<string>(() => {
    return localStorage.getItem("giants_custom_image_url") || "";
  });
  const [customImageEnabled, setCustomImageEnabled] = useState<boolean>(() => {
    return localStorage.getItem("giants_custom_image_enabled") === "true";
  });
  const [customWallpaperOpacity, setCustomWallpaperOpacity] = useState<number>(() => {
    const cached = localStorage.getItem("giants_custom_wallpaper_opacity");
    return cached ? Number(cached) : 35;
  });
  const [doodleDensity, setDoodleDensity] = useState<number>(1);
  const [photoRotation, setPhotoRotation] = useState<number>(1);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [activeFont, setActiveFont] = useState<string>(() => {
    return localStorage.getItem("giants_active_font") || "classic_serif";
  });

  useEffect(() => {
    localStorage.setItem("giants_paper_style", paperStyle);
  }, [paperStyle]);

  useEffect(() => {
    localStorage.setItem("giants_custom_bg_color", customBgColor);
  }, [customBgColor]);

  useEffect(() => {
    localStorage.setItem("giants_custom_bg_texture", customBgTexture);
  }, [customBgTexture]);

  useEffect(() => {
    localStorage.setItem("giants_custom_image_url", customImageUrl);
  }, [customImageUrl]);

  useEffect(() => {
    localStorage.setItem("giants_custom_image_enabled", String(customImageEnabled));
  }, [customImageEnabled]);

  useEffect(() => {
    localStorage.setItem("giants_custom_wallpaper_opacity", String(customWallpaperOpacity));
  }, [customWallpaperOpacity]);

  useEffect(() => {
    localStorage.setItem("giants_active_font", activeFont);
  }, [activeFont]);

  const handleTogglePinGiant = (giantId: string) => {
    setGiants((prev) =>
      prev.map((g) => {
        if (g.id === giantId) {
          const nextPinned = !g.pinned;
          triggerToast(nextPinned ? `📌「${g.name}」已置顶到殿堂顶峰` : `✓ 取消「${g.name}」置顶`);
          return { ...g, pinned: nextPinned };
        }
        return g;
      })
    );
  };

  const handleToggleMuteEchoGiant = (giantId: string) => {
    setGiants((prev) =>
      prev.map((g) => {
        if (g.id === giantId) {
          const nextMuted = !g.mutedEcho;
          triggerToast(nextMuted ? `「${g.name}」已关闭灵感回声提醒，不再打扰` : `「${g.name}」已开启灵感回声提醒`);
          return { ...g, mutedEcho: nextMuted };
        }
        return g;
      })
    );
  };

  // 2. Mock Web-sandbox state (Safari / browser mock)
  const [activePage, setActivePage] = useState<MockWebPage>(MOCK_SHAREABLE_PAGES[0]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);

  // 3. Notification system
  const [notificationBanner, setNotificationBanner] = useState<{ show: boolean; item?: CapturedItem } | null>(null);

  // 4. Utility feedbacks
  const [toast, setToast] = useState<{ show: boolean; text: string } | null>(null);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("giants_db", JSON.stringify(giants));
  }, [giants]);

  useEffect(() => {
    localStorage.setItem("items_db", JSON.stringify(items));
  }, [items]);

  // Handle callback window attachment to save cleanly from horizontal modals
  useEffect(() => {
    (window as any).__onInjectCapturedItem = (newItem: CapturedItem) => {
      setItems((prev) => {
        const next = [newItem, ...prev];
        localStorage.setItem("items_db", JSON.stringify(next));
        return next;
      });

      const ownerName = newItem.giantId
        ? giants.find((g) => g.id === newItem.giantId)?.name || "巨人"
        : "暂存箱";
      triggerToast(`✓ 成功收集到「${ownerName}」`);
    };

    return () => {
      delete (window as any).__onInjectCapturedItem;
    };
  }, [giants]);

  const triggerToast = (text: string) => {
    setToast({ show: true, text });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 5. Actions: Add new Giant
  const handleAddGiant = (name: string, description: string): string => {
    const defaultColorPresets = [
      "#8B2C1E", // Dark Crimson Red
      "#C9A961", // Vintage Ochre Gold
      "#4E594A", // Soft Pine Green
      "#5B4F7B", // Dusty Plum Violet
      "#7D4B32", // Sepia Brown
      "#3A5A6D", // Prussian Antique Blue
    ];

    const randomColor = defaultColorPresets[Math.floor(Math.random() * defaultColorPresets.length)];
    const avatarInitials = name.trim().substring(0, 1).toUpperCase();

    const newGiant: Giant = {
      id: "giant-" + Date.now().toString(),
      name: name.trim(),
      avatarInitials,
      avatarColor: randomColor,
      description: description.trim() || "受启发的灵感源源",
      createdAt: new Date().toISOString(),
    };

    setGiants((prev) => [newGiant, ...prev]);
    triggerToast(`✓ 新建巨人「${name}」成功`);
    return newGiant.id;
  };

  // Action: update fields on captured clippings
  const handleUpdateItem = (itemId: string, updates: Partial<CapturedItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
    triggerToast("✓ 记录已成功更新");
  };

  // Action: remove single memory
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    triggerToast("✓ 已永久删除该灵感记录");
  };

  // Action: Edit description tagline on Giant
  const handleEditGiantTagline = (giantId: string, newTagline: string) => {
    setGiants((prev) =>
      prev.map((g) => (g.id === giantId ? { ...g, description: newTagline } : g))
    );
    triggerToast("✓ 巨人描述已更新");
  };

  // Database actions: Reset to stock template
  const handleResetToStock = () => {
    setGiants(INITIAL_GIANTS);
    setItems(INITIAL_ITEMS);
    setExportedJson(null);
    setActiveScreen("home");
    setSelectedGiantId(INITIAL_GIANTS[0]?.id || null);
    setShowDeviceSettings(false);
    triggerToast("✓ 数据模型已恢复到初始预设状态");
  };

  // Swift-comparable JSON Exporter
  const handleTriggerExport = () => {
    const exportStruct = giants.map((giant) => {
      const gItems = items.filter((i) => i.giantId === giant.id);
      return {
        name: giant.name,
        description: giant.description || "",
        items: gItems.map((item) => ({
          title: item.title,
          url: item.url || "",
          fullText: item.fullText || "",
          emoji: item.emoji || "",
          thought: item.thought || "",
          capturedAt: item.capturedAt,
        })),
      };
    });

    const jsonString = JSON.stringify(exportStruct, null, 2);
    setExportedJson(jsonString);
    navigator.clipboard.writeText(jsonString).then(() => {
      triggerToast("✓ 完整 JSON 数据已复制到剪贴板！");
    });
  };

  // Trigger push notification manually from browser controls
  const handleSimulateEchoNotification = () => {
    const readableCandidates = items.filter(item => {
      if (item.giantId === null) return false;
      const giant = giants.find(g => g.id === item.giantId);
      return giant ? !giant.mutedEcho : true;
    });
    if (readableCandidates.length === 0) {
      triggerToast("⚠ 需要先有至少一条属于某个巨人的内容才能推送！");
      return;
    }

    const randItem = readableCandidates[Math.floor(Math.random() * readableCandidates.length)];
    setNotificationBanner({ show: true, item: randItem });

    setTimeout(() => {
      setNotificationBanner(null);
    }, 8000);

    triggerToast("🔔 推送指令已送到 iPhone 虚拟系统");
  };

  // Quick bidirectional screen selectors
  const handleSwitchScreenViaDirectory = (screen: "home" | "details" | "pending_inbox" | "settings") => {
    setShowDeviceSettings(false);
    if (screen === "settings") {
      setShowDeviceSettings(true);
      setActiveScreen("home");
    } else {
      setActiveScreen(screen);
      if (screen === "details" && !selectedGiantId && giants.length > 0) {
        setSelectedGiantId(giants[0].id);
      }
    }
    triggerToast(`📱 已将虚拟屏幕切换至: ${
      screen === "home" ? "首页 (我的巨人)" :
      screen === "details" ? "巨人书页详情" :
      screen === "pending_inbox" ? "暂存分发收件箱" : "偏好属性设置"
    }`);
  };

  // Generate helper feedback notes based on active screens
  const getMarginNotesValue = () => {
    if (showDeviceSettings) {
      return {
        title: "偏好设置纸条",
        desc: "巨人坚持一切数据都在你手中。这里提供 SQLite 的去中心化备份，并且你可以通过调整时间指针，定制符合你生物钟的【灵感回声】。每一段文字都是属于你的本地历史档案。"
      };
    }
    if (activeScreen === "details") {
      const g = giants.find(item => item.id === selectedGiantId) || giants[0];
      return {
        title: `馆藏书本: ${g?.name || ""}`,
        desc: `这里放置了你所向往并敬重的、照亮你思维的人。卡片以复古拍立得 Polaroid 的样式悬浮展开。点击上方的随机摇号按钮，可由算盘机随机唤醒、重温此巨人书下的某句回音记忆。`
      };
    }
    if (activeScreen === "pending_inbox") {
      const count = items.filter(item => item.giantId === null).length;
      return {
        title: `暂存舱口 (${count} 条待分发)`,
        desc: "我们在 Safari 甚至微信内长按文字或者分享链接时，常常来不及判定该归属于谁。所以，它们会被安善地送入此缓冲收件箱中。在周末饮茶的半小时，你可为它们挑一个温暖或敬仰的巨人老师安家。"
      };
    }
    return {
      title: "📓 主页软木留言板",
      desc: "在这里，你在网络上收集的金句和启发被归拢。最上方展现了【今日回声】。你可以点击“回应”直接补全感悟。写过感言的内容其推送概率会降低。底下的巨人列表由墨水圈圈划出，便于单手掌控。"
    };
  };

  const marginNotes = getMarginNotesValue();

  return (
    <div id="scrapbook-workspace" className="min-h-screen scrapbook-desk text-[#3D2B1A] px-4 py-6 md:px-10 md:py-8 relative flex flex-col font-serif overflow-x-hidden">
      
      {/* ─── Global star elements sprinkled based on density controls ─── */}
      {doodleDensity > 0 && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[15%] opacity-50 animate-[spin_12s_linear_infinite]" style={{ transform: "rotate(3deg)" }}>
            <StarDoodle size={40} color="var(--ochre)" />
          </div>
          <div className="absolute top-1/2 left-[2%] opacity-40 animate-pulse">
            <HeartDoodle size={36} color="var(--red)" />
          </div>
          <div className="absolute bottom-[10%] left-[18%] opacity-50">
            <ArrowDoodle size={65} dir="up-right" color="var(--ink-muted)" />
            <div className="font-zh-hand text-xs text-[#7A6A55] -mt-1 ml-5">Keep Giants Close</div>
          </div>
          <div className="absolute top-[15%] right-[22%] opacity-40 animate-[bounce_8s_infinite]">
            <SparkleDoodle size={28} color="var(--ink-strong)" />
          </div>
          {doodleDensity > 1 && (
            <>
              <div className="absolute bottom-[35%] right-[20%] opacity-55">
                <HeartDoodle size={30} color="var(--red)" fill={true} />
              </div>
              <div className="absolute top-[45%] left-[45%] opacity-30 animate-pulse">
                <StarDoodle size={44} color="var(--ochre)" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Global Toast HUD Notification */}
      {toast && toast.show && (
        <div id="global-toast-notif" className="fixed bottom-6 left-6 md:left-auto md:right-8 bg-[#F5F0EA] border-2 border-[#1A1A1A] p-3.5 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center gap-2.5 z-55 animate-[slideUp_0.2s_ease] font-zh-hand text-sm font-semibold text-[#1A1A1A]">
          <CheckCircle className="w-5 h-5 text-[#8B2C1E] shrink-0" />
          <span>{toast.text}</span>
          <div className="absolute -top-1.5 -left-1">
            <PushPin size={10} />
          </div>
        </div>
      )}

      {/* ─── Premium Classic Styled App Header ─── */}
      <h1 className="sr-only">巨人 iOS Applet Simulator</h1>
      <header className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b-2 border-dashed border-[#7A6A55]/30 select-none">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-3">
            {/* Simple Elegant Round Avatar Style Badge with spark */}
            <div className="w-10 h-10 rounded-full bg-[#FAF6EC] border-2 border-[#1A1A1A] flex items-center justify-center shadow-sm rotate-3 transform hover:rotate-12 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-[#8B2C1E]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A] select-none font-zh-hand flex items-center gap-2">
                <span>巨人书屋</span>
                <span className="font-mono text-[9.5px] font-black text-[#8B2C1E] bg-[#8B2C1E]/10 px-2.5 py-0.5 rounded-full border border-[#8B2C1E]/20 uppercase ml-2 tracking-wider">
                  iOS Applet Simulator
                </span>
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm text-[#7A6A55] font-zh-hand max-w-3xl leading-relaxed">
            “捕捉你内心摇晃、被照亮的瞬间。” 无论是在 Twitter、GitHub 还是 Web 站点里，阅读时若心有所动，帮你用数秒归档到指定的导师巨人门下，并通过【定时回声】被动重温和提问。这是一个复古手工仿真沙盒，体验 3 秒一键卡片归置流程。
          </p>
          <div className="absolute -bottom-1.5 left-0 w-80 pointer-events-none">
            <UnderlineDoodle width={240} color="var(--red)" variant="double" />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs select-none relative pt-2 lg:pt-0">
          <button
            onClick={handleResetToStock}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#FFFDF7] hover:bg-[#F5F0EA] border-2 border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold font-zh-hand shadow-[2px_2px_0px_rgba(26,26,26,1)] transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#7A6A55]" />
            重置沙盒数据库
          </button>
          
          <button
            onClick={handleTriggerExport}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#F5F0EA] text-xs font-bold font-zh-hand shadow-[2px_2px_0px_rgba(26,26,26,1)] transition active:scale-95 cursor-pointer border-2 border-black"
          >
            <Copy className="w-4 h-4 text-[#C9A961]" />
            复制 Swift 级 JSON 备份
          </button>
        </div>
      </header>

      {/* ─── THREE COLUMN RETRO WORKSPACE STAGE ─── */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-6 flex-1">
        
        {/* ================= COLUMN 1: DIRECTORY BINDER (lg:2) ================= */}
        <section id="workspace-directory" className="lg:col-span-2 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl p-4.5 shadow-md relative text-left select-none">
            {/* Vintage binder paper decoration */}
            <div className="absolute -left-3 top-10 flex flex-col gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="w-5 h-5 rounded-full bg-[#E2D2B0] border-2 border-[#1A1A1A] shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-85" />
                </div>
              ))}
            </div>

            <div className="pl-4 border-l-2 border-dashed border-[#7A6A55]/20 space-y-4">
              <span className="text-[10px] tracking-widest font-bold text-[#7A6A55] block font-zh-hand uppercase flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#8B2C1E]" /> 目录 / DIRECTORY
              </span>
              
              <div className="flex flex-col gap-2.5 font-zh-hand font-bold text-sm">
                <button
                  onClick={() => handleSwitchScreenViaDirectory("home")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition duration-150 text-left border cursor-pointer ${
                    activeScreen === "home" && !showDeviceSettings
                      ? "bg-[#F5F0EA] border-[#1A1A1A] text-[#1A1A1A] shadow-inner scale-[1.02]"
                      : "bg-transparent border-transparent text-[#7A6A55] hover:bg-[#F5F0EA]/40"
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#8B2C1E]" />
                  <span>我的巨人殿堂</span>
                </button>

                <button
                  onClick={() => handleSwitchScreenViaDirectory("details")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition duration-150 text-left border cursor-pointer ${
                    activeScreen === "details" && !showDeviceSettings
                      ? "bg-[#F5F0EA] border-[#1A1A1A] text-[#1A1A1A] shadow-inner scale-[1.02]"
                      : "bg-transparent border-transparent text-[#7A6A55] hover:bg-[#F5F0EA]/40"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#8B2C1E]" />
                  <span>巨人智慧书架</span>
                </button>

                <button
                  onClick={() => handleSwitchScreenViaDirectory("pending_inbox")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition duration-150 text-left border cursor-pointer ${
                    activeScreen === "pending_inbox" && !showDeviceSettings
                      ? "bg-[#F5F0EA] border-[#1A1A1A] text-[#1A1A1A] shadow-inner scale-[1.02]"
                      : "bg-transparent border-transparent text-[#7A6A55] hover:bg-[#F5F0EA]/40"
                  }`}
                >
                  <Inbox className="w-4 h-4 text-[#8B2C1E]" />
                  <span>未分配暂存栈</span>
                </button>

                <button
                  onClick={() => handleSwitchScreenViaDirectory("settings")}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition duration-150 text-left border cursor-pointer ${
                    showDeviceSettings
                      ? "bg-[#F5F0EA] border-[#1A1A1A] text-[#1A1A1A] shadow-inner scale-[1.02]"
                      : "bg-transparent border-transparent text-[#7A6A55] hover:bg-[#F5F0EA]/40"
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#8B2C1E]" />
                  <span>回声沙箱偏好</span>
                </button>
              </div>

              <div className="pt-3 border-t border-[#7A6A55]/10 flex flex-col gap-1.5 font-mono text-[10px] text-[#7A6A55]">
                <div className="flex items-center justify-between">
                  <span>SQLite 缓存:</span>
                  <span className="font-bold text-[#1A1A1A]">{items.length}条</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>导师总席位:</span>
                  <span className="font-bold text-[#1A1A1A]">{giants.length}席</span>
                </div>
              </div>
            </div>

            <div className="absolute top-1 right-2">
              <PushPin size={13} />
            </div>
          </div>

          {/* Quick Push-Notification Trigger Sticker */}
          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4.5 rounded-2xl shadow-md text-left select-none relative hover:rotate-1 duration-200">
            <span className="text-[10px] tracking-wider font-extrabold text-[#8B2C1E] uppercase font-zh-hand block mb-1">
              🔔 ECHOS TRIGGER
            </span>
            <p className="text-[11px] text-[#7A6A55] font-zh-hand leading-relaxed mb-3">
              点击下方，即刻仿真每日九点的被动桌面闪烁通知。点击横幅可闭环进入编辑日记。
            </p>
            <button
              onClick={handleSimulateEchoNotification}
              id="btn-trigger-mock-push"
              className="w-full py-1.5 bg-[#8B2C1E]/10 hover:bg-[#8B2C1E] hover:text-[#FFFDF7] text-[#8B2C1E] border border-[#8B2C1E]/40 text-[11px] font-bold font-zh-hand rounded-lg transition text-center select-none cursor-pointer"
            >
              🎯 模拟清晨回声推送
            </button>
            <div className="absolute top-1.5 right-1.5">
              <Tape color="blue" width={28} height={10} rotate={-10} />
            </div>
          </div>
        </section>

        {/* ================= COLUMN 2: TYPEWRITER BROWSER + PREVIEW (lg:6) ================= */}
        <section className="lg:col-span-6 space-y-6">
          
          {/* Simulated Web Sandbox stylized as vintage Typewriter/Journal paper */}
          <div id="typewriter-browser" className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl shadow-lg overflow-hidden flex flex-col relative">
            
            {/* Metal Browser Bar */}
            <div className="bg-[#1A1A1A] px-5 py-3 border-b border-[#1A1A1A] flex items-center justify-between select-none text-[#F5F0EA]">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8B2C1E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#C9A961]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E2D2B0]" />
              </div>

              {/* URL address search bar */}
              <div className="flex-1 max-w-md mx-3.5 bg-[#FFFDF7] text-[#1A1A1A] border-2 border-black rounded-full h-7 px-4 flex items-center justify-between text-[11px] font-mono shadow-inner leading-none py-0.5">
                <span className="opacity-75 tracking-tight truncate">🔐 {activePage.url}</span>
                <span className="text-[9px] text-[#faf6ec] font-bold bg-[#1A1A1A] px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                  SANDBOX WEB
                </span>
              </div>

              <span className="text-[10px] text-[#C9A961] font-mono font-bold shrink-0">{activePage.sourceApp} Page</span>
            </div>

            {/* Quick platform channel typewriter page tabs */}
            <div className="grid grid-cols-4 bg-[#F5F0EA]/40 border-b border-[#1A1A1A]/10 text-xs text-[#7A6A55] select-none font-zh-hand font-bold">
              {MOCK_SHAREABLE_PAGES.map((page) => {
                const isCurrent = activePage.id === page.id;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      setActivePage(page);
                      setSelectedText("");
                    }}
                    className={`py-2 px-1 text-center border-b-2 hover:text-[#1A1A1A] transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#FFFDF7] border-[#8B2C1E] text-[#8B2C1E] font-bold text-sm"
                        : "border-transparent text-[#7A6A55] hover:bg-[#FFFDF7]/55"
                    }`}
                  >
                    {page.sourceApp}
                  </button>
                );
              })}
            </div>

            {/* Simulated Web Page Content rendering as Typewriter Ink */}
            <div className="p-6 md:p-8 space-y-6 h-82 overflow-y-auto text-left relative paper-lined border-b border-[#1A1A1A]/10">
              
              {/* Draft Paper Ring holes */}
              <div className="absolute top-2 right-4 flex gap-1opacity-60 select-none">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#E2D2B2] border border-[#1A1A1A]/20 shadow-inner" />
                ))}
              </div>

              {/* Title & metadata */}
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1A1A1A] font-zh-hand pr-5 leading-snug">
                  {activePage.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#7A6A55] font-zh-hand font-bold">
                  <span>来自: </span>
                  <span className="text-[#8B2C1E]">{activePage.author}</span>
                  <span>·</span>
                  <span className="font-mono text-[10px] uppercase text-[#7A6A55]/70">{activePage.domain}</span>
                </div>
              </div>

              {/* Body snippet */}
              <div className="space-y-3.5 text-xs md:text-[13.5px] leading-relaxed text-[#1A1A1A] font-zh-hand relative pr-1.5 selection:bg-[#C9A961]/35">
                <p>{activePage.snippet}</p>
                <p className="text-[#7A6A55] italic text-[11px] leading-relaxed pt-2 border-t border-dashed border-[#7A6A55]/20">
                  💡 *注：这里是仿真读者视域。你可以点击下方的“金色金句 Text模式”，仿真双击屏幕、拖动长按选中最令人颤抖的某句话，然后再保存：
                </p>
              </div>

              {/* Highlighter selectors mode */}
              <div className="p-4 bg-[#F5F0EA] border-2 border-[#1A1A1A] rounded-xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold font-zh-hand text-[#1A1A1A]">
                  <span>✨ 模拟指头长按屏幕动作:</span>
                  <span className="text-[10px] text-[#8B2C1E] font-bold tracking-wider uppercase">★ WEB SCRIBE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs select-none">
                  {/* Mode 1: Link Sharing */}
                  <button
                    onClick={() => setSelectedText("")}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer font-zh-hand ${
                      selectedText === ""
                        ? "bg-[#FFFDF7] border-[#1A1A1A] text-[#1A1A1A] font-bold shadow-sm"
                        : "bg-transparent border-[#7A6A55]/30 text-[#7A6A55] hover:border-[#1A1A1A]"
                    }`}
                  >
                    <Globe className="w-4 h-4 mt-0.5 shrink-0 text-[#8B2C1E]" />
                    <div className="space-y-0.5 leading-tight">
                      <span>保存整篇原始 Link</span>
                      <p className="text-[9px] text-[#7A6A55] opacity-80">自动分析提取标题与域名原址</p>
                    </div>
                  </button>

                  {/* Mode 2: Simulated Selected text fragment */}
                  <button
                    onClick={() => setSelectedText(activePage.snippet || "模拟选中的文摘句段")}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer font-zh-hand ${
                      selectedText !== ""
                        ? "bg-[#FFFDF7] border-[#1A1A1A] text-[#1A1A1A] font-bold shadow-sm animate-pulse"
                        : "bg-transparent border-[#7A6A55]/30 text-[#7A6A55] hover:border-[#1A1A1A]"
                    }`}
                  >
                    <FileText className="w-4 h-4 mt-0.5 shrink-0 text-[#C9A961]" />
                    <div className="space-y-0.5 leading-tight">
                      <span>保存摘录精彩金句 Text</span>
                      <p className="text-[9px] text-[#7A6A55] opacity-80">高亮选中整句，作为高纯度墨水卡</p>
                    </div>
                  </button>
                </div>

                {/* Simulated text highlighting view if text mode selected */}
                {selectedText && (
                  <div className="p-3 bg-[#E2D2B0]/30 border-l-3 border-[#C9A961] rounded-r-lg text-xs text-[#1A1A1A] font-zh-hand italic leading-normal animate-[fadeIn_0.2s_ease]">
                    “ {selectedText.length > 120 ? selectedText.substring(0, 120) + "..." : selectedText} ” 
                    <div className="text-[9px] text-[#8B2C1E] mt-1 font-bold not-italic">★ 手机屏幕已呈荧高亮状态</div>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated browser share sheet triggers */}
            <div className="p-4.5 bg-[#F5F0EA] flex flex-col sm:flex-row items-center justify-between gap-4 text-left select-none border-t border-[#1A1A1A]/10">
              <div className="text-xs text-[#1A1A1A] font-zh-hand leading-relaxed font-bold max-w-sm">
                现正阅读「{activePage.author}」的快照页。点击右侧按钮模拟
                <span className="text-[#8B2C1E] underline"> iOS 系统的「分享菜单 &rarr; 巨人」</span> 流程：
              </div>
              <button
                onClick={() => {
                  setIsShareSheetOpen(true);
                  triggerToast("📱 iPhone 已呼起「巨人」iOS 分享面板！");
                }}
                id="btn-trigger-share"
                className="px-5 py-2.5 bg-[#8B2C1E] hover:bg-black text-[#FFFDF7] text-xs font-bold font-zh-hand rounded-xl transition duration-150 flex items-center gap-2 select-none active:scale-95 cursor-pointer shadow-md shrink-0 border border-black"
              >
                <Share2 className="w-4 h-4 text-[#C9A961]" />
                唤起 iOS 分享到巨人
              </button>
            </div>

          </div>

          {/* SQLite Backup Inspection console log */}
          {exportedJson && (
            <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-2xl p-4.5 text-left relative animate-[fadeIn_0.35s_ease] shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#7A6A55] font-extrabold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  SQLite Simulator Raw Output Console
                </span>
                <button
                  onClick={() => setExportedJson(null)}
                  className="text-xs text-[#8B2C1E] hover:underline font-zh-hand font-bold cursor-pointer"
                >
                  ✕ 隐藏备份控制台
                </button>
              </div>
              <pre className="p-3 bg-[#FAF6EC] rounded-xl border border-[#1A1A1A]/10 text-[10px] text-zinc-800 font-mono select-text max-h-48 overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed scrollbar-hide">
                {exportedJson}
              </pre>
              <div className="absolute top-1 right-2">
                <Tape color="pink" width={32} height={11} rotate={-5} />
              </div>
            </div>
          )}

        </section>

        {/* ================= COLUMN 3: DEVICE simulator + MARGIN NOTES (lg:4) ================= */}
        <section className="lg:col-span-4 flex flex-col items-center">
          
          {/* Aesthetic Margin Post-it explaining current view context */}
          <div id="margin-postit" className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4.5 rounded-2xl shadow-md text-left select-none relative w-full max-w-sm mb-4 hover:rotate-1 duration-200">
            <h3 className="text-xs font-extrabold text-[#1A1A1A] font-zh-hand uppercase tracking-wider mb-1">
              {marginNotes.title}
            </h3>
            <p className="text-[11.5px] text-[#7A6A55] font-zh-hand leading-relaxed">
              {marginNotes.desc}
            </p>
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2">
              <PushPin size={14} color="var(--red)" />
            </div>
          </div>

          <div className="relative">
            {/* The iOS Sim Frame built around user configurations */}
            <DeviceSimulator
              giants={giants}
              items={items}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              selectedGiantId={selectedGiantId}
              setSelectedGiantId={setSelectedGiantId}
              showDeviceSettings={showDeviceSettings}
              setShowDeviceSettings={setShowDeviceSettings}
              paperStyle={paperStyle}
              onChangePaperStyle={setPaperStyle}
              customBgColor={customBgColor}
              onChangeCustomBgColor={setCustomBgColor}
              customBgTexture={customBgTexture}
              onChangeCustomBgTexture={setCustomBgTexture}
              customImageUrl={customImageUrl}
              onChangeCustomImageUrl={setCustomImageUrl}
              customImageEnabled={customImageEnabled}
              onChangeCustomImageEnabled={setCustomImageEnabled}
              customWallpaperOpacity={customWallpaperOpacity}
              onChangeCustomWallpaperOpacity={setCustomWallpaperOpacity}
              doodleDensity={doodleDensity}
              photoRotation={photoRotation}
              isNightMode={isNightMode}
              onAddGiant={handleAddGiant}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onEditGiantTagline={handleEditGiantTagline}
              activePageToShare={activePage}
              selectedTextSnippet={selectedText}
              isShareSheetOpen={isShareSheetOpen}
              setIsShareSheetOpen={setIsShareSheetOpen}
              onTriggerExport={handleTriggerExport}
              onTriggerReset={handleResetToStock}
              notificationBanner={notificationBanner}
              setNotificationBanner={setNotificationBanner}
              onTogglePinGiant={handleTogglePinGiant}
              onToggleMuteEchoGiant={handleToggleMuteEchoGiant}
              activeFont={activeFont}
              onChangeActiveFont={setActiveFont}
            />

            {/* Simulated Taped Photo Frame overlaying behind the device for retro feel */}
            <div className="absolute -bottom-16 -left-12 -z-10 bg-white p-3 shadow-md border border-[#1A1A1A]/10 w-28 h-32 rotate-12 flex flex-col font-en-hand text-center text-xs text-[#1A1A1A]">
              <div className="w-22 h-20 bg-zinc-900 border overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#8B2C1E] to-[#FAF6EC] opacity-80" />
                <span className="absolute inset-x-0 bottom-1 font-zh-hand text-white text-[9px]">Paul Graham</span>
              </div>
              <span className="pt-2 leading-none">“How to Think”</span>
              <div className="absolute -top-3 left-6">
                <Tape color="yellow" width={34} height={9} rotate={-10} />
              </div>
            </div>
            
            <div className="absolute -top-16 -right-10 -z-10 bg-white p-3.5 shadow-md border border-[#1A1A1A]/10 w-32 h-36 -rotate-12 flex flex-col font-zh-hand text-center text-[10px] text-[#1A1A1A]">
              <div className="w-24 h-22 bg-zinc-900 border overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A961] to-[#FAF6EC] opacity-75" />
                <span className="absolute inset-x-0 bottom-1 font-zh-hand text-white text-[9px]">Karpathy</span>
              </div>
              <span className="pt-2 leading-tight">“极客心流”</span>
              <div className="absolute -top-3 left-6">
                <Tape color="pink" width={38} height={10} rotate={15} />
              </div>
            </div>

          </div>

        </section>
        
      </main>

      {/* ================= GLOBAL TWEAKS PANEL FLOATING CONTROL (Fixed bottom right) ================= */}
      <section id="tweaks-panel-float" className="fixed bottom-6 right-6 z-50 select-none">
        <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] p-4 rounded-xl shadow-2xl relative w-68 text-left hover:-translate-y-0.5 duration-200">
          
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-1.5 mb-2.5">
            <span className="text-[11px] font-extrabold text-[#1A1A1A] font-zh-hand flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B2C1E]" />
              工作台风格控制面板
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm" />
          </div>

          <div className="space-y-3 font-zh-hand text-[11.5px] leading-relaxed select-none">
            {/* Paper selector */}
            <div className="space-y-1">
              <label className="text-[#7A6A55] text-[10px] font-extrabold uppercase select-none">模拟本页纸张种类:</label>
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[
                  { id: "cream", name: "暖象牙" },
                  { id: "lined", name: "横格纸" },
                  { id: "kraft", name: "牛皮纸" },
                  { id: "custom", name: "自定义" }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaperStyle(p.id as any)}
                    className={`py-1 rounded border text-center font-bold text-[10px] font-zh-hand transition duration-150 cursor-pointer ${
                      paperStyle === p.id
                        ? "bg-[#1A1A1A] text-[#FAF6EC] border-transparent shadow"
                        : "bg-white text-[#7A6A55] border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Background Sub-Panel */}
            {paperStyle === "custom" && (
              <div className="p-2.5 bg-[#8B2C1E]/5 border-2 border-dashed border-[#8B2C1E]/20 rounded-xl space-y-2.5 animate-[fadeIn_0.15s_ease] text-left">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#7A6A55] uppercase">
                  <span>🎨 自选色 / 任意选色:</span>
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-5 h-5 border-0 p-0 cursor-pointer rounded-full overflow-hidden"
                    title="任意取色"
                  />
                </div>
                
                {/* Switch Swatches */}
                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                  {[
                    { color: "#F0EAD6", title: "蛋壳" },
                    { color: "#FAF0E6", title: "亚麻" },
                    { color: "#FFFDF0", title: "麦黄" },
                    { color: "#E0EEE0", title: "薄荷" },
                    { color: "#F0F8FF", title: "冰川" }
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => setCustomBgColor(preset.color)}
                      className="w-5 h-5 rounded-full border border-black/20 shadow-sm hover:scale-110 active:scale-95 duration-100 transition cursor-pointer"
                      style={{ backgroundColor: preset.color }}
                      title={preset.title}
                    />
                  ))}
                </div>

                {/* Texture Style */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#7A6A55] uppercase">纸页折叠线/图案:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: "solid", name: "纯色" },
                      { id: "lines", name: "横线" },
                      { id: "dots", name: "点阵" },
                      { id: "grid", name: "网格" }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCustomBgTexture(t.id)}
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

                {/* Wallpaper image URL options */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#7A6A55] uppercase">
                    <span>🖼️ 底层材质插画 URL:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-[#8B2C1E]">已启用</span>
                      <input
                        type="checkbox"
                        checked={customImageEnabled}
                        onChange={(e) => setCustomImageEnabled(e.target.checked)}
                        className="w-3 h-3 rounded text-[#8B2C1E] focus:ring-[#8B2C1E] cursor-pointer"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="粘贴背景图片链接 (HTTPS)"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      if (e.target.value) setCustomImageEnabled(true);
                    }}
                    className="w-full px-2 py-1 bg-white border border-black/15 rounded text-[10px] font-mono font-medium focus:outline-none focus:border-[#8B2C1E]"
                  />
                  
                  {/* Curated Masterpiece selections */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {[
                      { name: "莫奈·睡莲", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=40" },
                      { name: "莫奈·春天", url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=40" },
                      { name: "梵高·杏花", url: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=400&q=40" },
                      { name: "梵高·星流", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=40" },
                      { name: "塞尚·古典", url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=400&q=40" },
                      { name: "波浪·浮世", url: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=400&q=40" }
                    ].map((w) => {
                      const isSelected = customImageUrl === w.url && customImageEnabled;
                      return (
                        <button
                          key={w.name}
                          onClick={() => {
                            setCustomImageUrl(w.url);
                            setCustomImageEnabled(true);
                            triggerToast(`✓ 已应用「${w.name}」名作壁纸材质`);
                          }}
                          className={`text-[8.5px] font-bold py-0.5 rounded border truncate text-center cursor-pointer transition duration-100 ${
                            isSelected
                              ? "bg-[#8B2C1E] text-white border-transparent"
                              : "bg-white text-[#7A6A55] border-black/10 hover:border-black/30"
                          }`}
                        >
                          🎨 {w.name.split("·")[1]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slider option for external template configuration */}
                  {customImageEnabled && customImageUrl && (
                    <div className="space-y-1 pt-1 opacity-90">
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
                        onChange={(e) => setCustomWallpaperOpacity(Number(e.target.value))}
                        className="w-full h-1 accent-[#8B2C1E] bg-black/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Doodle Density selector */}
            <div className="space-y-1">
              <label className="text-[#7A6A55] text-[10px] font-extrabold uppercase">手绘矢量涂鸦密度:</label>
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {[
                  { value: 0, name: "微言 (0)" },
                  { value: 1, name: "疏落 (1)" },
                  { value: 2, name: "错杂 (2)" }
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDoodleDensity(d.value)}
                    className={`py-1 rounded border text-center transition font-bold duration-150 cursor-pointer ${
                      doodleDensity === d.value
                        ? "bg-[#1A1A1A] text-[#FAF6EC] border-transparent shadow"
                        : "bg-white text-[#7A6A55] border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo rotation angle selection */}
            <div className="space-y-1">
              <label className="text-[#7A6A55] text-[10px] font-extrabold uppercase">相纸倾斜晃动程度:</label>
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {[
                  { value: 0, name: "对齐 (0°)" },
                  { value: 1, name: "微倾 (2°)" },
                  { value: 2, name: "随性 (5°)" }
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setPhotoRotation(r.value)}
                    className={`py-1 rounded border text-center transition font-bold duration-150 cursor-pointer ${
                      photoRotation === r.value
                        ? "bg-[#1A1A1A] text-[#FAF6EC] border-transparent shadow"
                        : "bg-white text-[#7A6A55] border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark/Night Diary Mode toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-[#1A1A1A]/10 select-none">
              <label className="text-[#7A6A55] text-[10px] font-extrabold uppercase flex items-center gap-1">
                {isNightMode ? <Moon className="w-3 h-3 text-[#C9A961]" /> : <Sun className="w-3 h-3" />}
                暗夜日记深色纸 (iOS System Only):
              </label>
              <input
                type="checkbox"
                checked={isNightMode}
                onChange={(e) => setIsNightMode(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#8B2C1E] focus:ring-[#8B2C1E] cursor-pointer"
              />
            </div>

          </div>

          {/* Miniature pin */}
          <div className="absolute top-1.5 right-6">
            <Tape color="yellow" width={36} height={10} rotate={12} />
          </div>
        </div>
      </section>

      {/* Aesthetic branding footer aligned to retro vintage scrapbook */}
      <footer className="border-t-2 border-dashed border-[#7A6A55]/30 mt-14 py-6 text-center select-none text-xs text-[#7A6A55] relative z-10 w-full font-zh-hand font-bold">
        <p className="opacity-80 text-sm tracking-wide">🏮 Giants · 捕捉内心摇晃的深度锚点</p>
        <p className="mt-2 opacity-60">Designed with Warm Scrapbook & Custom Paper Textures | Powered by React, Tailwind v4 and local Sandbox SQLite Persistence. May 2026.</p>
      </footer>

    </div>
  );
}
