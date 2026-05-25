import { Giant, CapturedItem, ContentType, MockWebPage } from "./types";

export const INITIAL_GIANTS: Giant[] = [
  {
    id: "g-karpathy",
    name: "karpathy",
    avatarInitials: "KP",
    avatarColor: "linear-gradient(135deg, #E8A455 0%, #B2752E 100%)",
    description: "把复杂的东西讲到极致简单",
    createdAt: "2025-09-12T10:00:00Z"
  },
  {
    id: "g-pg",
    name: "保罗·格雷厄姆",
    avatarInitials: "保",
    avatarColor: "linear-gradient(135deg, #6366F1 0%, #312E81 100%)",
    description: "Do things that don't scale 与追求完美思维",
    createdAt: "2025-10-01T08:30:00Z"
  },
  {
    id: "g-naval",
    name: "Naval",
    avatarInitials: "NV",
    avatarColor: "linear-gradient(135deg, #10B981 0%, #064E3B 100%)",
    description: "如何不用运气发家致富，寻找本质心智模型",
    createdAt: "2025-11-15T15:20:00Z"
  },
  {
    id: "g-yF",
    name: "云风",
    avatarInitials: "云",
    avatarColor: "linear-gradient(135deg, #F43F5E 0%, #881337 100%)",
    description: "写出优雅代码，踏实探索程序架构设计的极客精神",
    createdAt: "2025-11-20T12:00:00Z"
  },
  {
    id: "g-bret",
    name: "Bret Victor",
    avatarInitials: "BV",
    avatarColor: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
    description: "设计与人机交互的人道主义先驱",
    createdAt: "2025-12-05T09:40:00Z"
  }
];

export const INITIAL_ITEMS: CapturedItem[] = [
  {
    id: "item-kp-1",
    giantId: "g-karpathy",
    contentType: ContentType.Link,
    title: "Let's build GPT from scratch",
    url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    sourceDomain: "youtube.com",
    emoji: "🔥",
    capturedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "item-kp-2",
    giantId: "g-karpathy",
    contentType: ContentType.Link,
    title: "The spelled-out intro to neural networks and backpropagation",
    url: "https://karpathy.github.io/neuralnets",
    sourceDomain: "karpathy.github.io",
    emoji: "💡",
    thought: "终于有人把反向传播跟梯度下降讲得像呼吸一样自然，不需要复杂的数学公式堆砌，而是直觉推导。",
    capturedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), // 2 weeks ago
  },
  {
    id: "item-kp-3",
    giantId: "g-karpathy",
    contentType: ContentType.Link,
    title: "nanoGPT releases v0.2: clean training script",
    url: "https://github.com/karpathy/nanogpt",
    sourceDomain: "github.com",
    emoji: "💡",
    capturedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), // 1 month ago
  },
  {
    id: "item-kp-4",
    giantId: "g-karpathy",
    contentType: ContentType.Link,
    title: "Software 2.0 and the Transition from Hard-Code to Data-Centric",
    url: "https://medium.com/@karpathy/software-2-0-a64152b37c35",
    sourceDomain: "medium.com",
    capturedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(), // 3 months ago
  },
  {
    id: "item-kp-5",
    giantId: "g-karpathy",
    contentType: ContentType.Link,
    title: "The Unreasonable Effectiveness of Recurrent Neural Networks",
    url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/",
    sourceDomain: "karpathy.github.io",
    emoji: "❓",
    thought: "需要重新读一遍，第一次没完全理解 LSTM 的门控机制为什么能神奇地在文本序列里感知回车和括号。",
    capturedAt: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(), // 5 months ago
  },
  // Today's Echo Candidate (Exactly 6 months old!):
  {
    id: "item-kp-echo",
    giantId: "g-karpathy",
    contentType: ContentType.Text,
    title: "The best teachers are the ones who make you feel like the subject chose you",
    fullText: "The best teachers are the ones who make you feel like the subject chose you. They don't just dump raw syntax or axioms; they build a sandbox where failure is cheap, and intuition is inevitable.",
    emoji: "🔥",
    thought: "这句话太触动了，这才是教育的本质。Karpathy 本人就是这么教学的。",
    capturedAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(), // 6 months ago
    lastEchoedAt: null,
  },
  // Items for Paul Graham
  {
    id: "item-pg-1",
    giantId: "g-pg",
    contentType: ContentType.Link,
    title: "How to Do Great Work",
    url: "https://paulgraham.com/greatwork.html",
    sourceDomain: "paulgraham.com",
    emoji: "🔥",
    thought: "如果你没能做成伟大的工作，并不是因为你从未获得过好机会，很可能是你把大把的热度浪费在了平庸的打卡和战术追求中。",
    capturedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(), // 2 months ago
  },
  {
    id: "item-pg-2",
    giantId: "g-pg",
    contentType: ContentType.Link,
    title: "Do Things that Don't Scale",
    url: "https://paulgraham.com/ds.html",
    sourceDomain: "paulgraham.com",
    emoji: "💡",
    capturedAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(), // 4 months ago
  },
  // Items for Naval
  {
    id: "item-nv-1",
    giantId: "g-naval",
    contentType: ContentType.Text,
    title: "密不外传的致富秘诀（How to Get Rich Without Getting Lucky）",
    fullText: "Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.",
    emoji: "💡",
    thought: "Naval 是少数把金钱、资产和人的杠杆思考到物理学公式化简洁程度的人。",
    capturedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  // Unassigned Items (inbox queue)
  {
    id: "item-unassigned-1",
    giantId: null,
    contentType: ContentType.Link,
    title: "A complete guide to SVG animation nodes",
    url: "https://css-tricks.com/svg-animations",
    sourceDomain: "css-tricks.com",
    capturedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: "item-unassigned-2",
    giantId: null,
    contentType: ContentType.Link,
    title: "Local LLM setups with Ollama and Llama3 models in 5 minutes",
    url: "https://ollama.com/library/llama3",
    sourceDomain: "ollama.com",
    emoji: "💡",
    thought: "纯本地运行 8B 模型已经完全可用了，离线智能的发展速度极其惊人。",
    capturedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "item-unassigned-3",
    giantId: null,
    contentType: ContentType.Text,
    title: "Why standard design and typography always beats clever layouts",
    fullText: "Clean alignment, proper leading, visual margins, and respectful use of contrast make the reader feel comfortable. Don't hide important text under creative layouts.",
    sourceDomain: "subpixel.design",
    capturedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
  }
];

export const MOCK_SHAREABLE_PAGES: MockWebPage[] = [
  {
    id: "web-1",
    author: "Andrej Karpathy",
    title: "Intro to Large Language Models: A complete 1-hour conceptual guide",
    url: "https://karpathy.github.io/llm-guide",
    domain: "karpathy.github.io",
    type: ContentType.Link,
    sourceApp: "Safari",
    snippet: "This YouTube video is an introductory lecture on Large Language Models, assuming no pre-requisites. We look at training, fine-tuning, security issues, and practical deployments."
  },
  {
    id: "web-2",
    author: "Paul Graham",
    title: "What you cannot say: Thoughts on independent mindsets",
    url: "https://paulgraham.com/say.html",
    domain: "paulgraham.com",
    type: ContentType.Link,
    sourceApp: "Safari",
    snippet: "How can you think thoughts that are disallowed in your circle? In almost any group, some ideas are forbidden. Training yourself to think them is crucial for true innovation."
  },
  {
    id: "web-3",
    author: "naval",
    title: "The best advice on building leverage is to choose products with zero marginal cost",
    url: "https://twitter.com/naval/status/123456789",
    domain: "twitter.com",
    type: ContentType.Text,
    sourceApp: "Twitter",
    snippet: "Leverage comes in three forms: labor, capital, and products with zero marginal cost of replication (code and media). The third is the most democratic and powerful for our generation."
  },
  {
    id: "web-4",
    author: "云风",
    title: "写代码如同做木工，不在于工具多高级，在于对边角的精细打磨和热爱",
    url: "https://blog.codingnow.com/2026/05",
    domain: "codingnow.com",
    type: ContentType.Text,
    sourceApp: "WeChat",
    snippet: "我写了快三十年代码，越写越觉得，能把一件小事理得干干净净、没有废话、没有莫名其妙的依赖、没有层叠无用的设计，这就是至高的乐趣。很多年轻程序员喜欢在架构上炫技，那只是在掩盖基础功力的不扎实。"
  }
];
