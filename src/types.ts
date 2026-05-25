export enum ContentType {
  Link = "link",
  Text = "text"
}

export interface Giant {
  id: string; // UUID equivalent
  name: string;
  avatarInitials: string; // Auto-generated initials
  avatarColor: string; // Tailwind hex color or color class
  description: string; // Optional tagline "He why is he giant"
  createdAt: string; // ISO date string
  pinned?: boolean; // Pinned state (置顶)
  mutedEcho?: boolean; // Individually disable Echo notifications (回声单关)
}

export interface CapturedItem {
  id: string;
  giantId: string | null; // null = pending (unassigned zone)
  contentType: ContentType;
  title: string;
  url?: string; // Original URL if Link mode
  fullText?: string; // Full text snippet if Text mode
  sourceDomain?: string; // Extracted domain name e.g. youtube.com
  emoji?: string; // Quick Emoji insight
  thought?: string; // Optional written thoughts
  capturedAt: string; // ISO date string
  lastEchoedAt?: string | null; // Last time it was pushed via Echo
}

export interface MockWebPage {
  id: string;
  title: string;
  url: string;
  domain: string;
  type: ContentType;
  snippet?: string;
  sourceApp: "Safari" | "Twitter" | "WeChat" | "GitHub";
  author: string;
}
