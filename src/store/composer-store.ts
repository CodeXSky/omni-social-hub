import { create } from "zustand";
import { Platform } from "@prisma/client";

export interface VariantDraft {
  platform: Platform;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  options: Record<string, any>;
  isManuallyEdited: boolean;
}

interface ComposerState {
  // Master post state
  masterTitle: string;
  masterCaption: string;
  masterMediaUrls: string[];
  scheduledAt: string | null;
  tone: "engaging" | "professional" | "viral_edgy" | "educational" | "casual";
  selectedPlatforms: Platform[];
  affiliateLink: string;
  affiliateProductName: string;

  // Variant states
  activeVariantTab: Platform;
  variants: Record<Platform, VariantDraft>;
  isAdapting: boolean;
  isPublishing: boolean;

  // Actions
  setMasterTitle: (title: string) => void;
  setMasterCaption: (caption: string) => void;
  setMasterMediaUrls: (urls: string[]) => void;
  addMediaUrl: (url: string) => void;
  removeMediaUrl: (index: number) => void;
  setScheduledAt: (date: string | null) => void;
  setTone: (tone: any) => void;
  setAffiliateLink: (link: string) => void;
  setAffiliateProductName: (name: string) => void;
  togglePlatform: (platform: Platform) => void;
  setActiveVariantTab: (platform: Platform) => void;
  updateVariant: (platform: Platform, patch: Partial<VariantDraft>) => void;
  setBulkVariants: (adapted: Record<Platform, any>) => void;
  setIsAdapting: (val: boolean) => void;
  setIsPublishing: (val: boolean) => void;
  resetComposer: () => void;
}

const ALL_PLATFORMS: Platform[] = [
  Platform.YOUTUBE,
  Platform.TIKTOK,
  Platform.INSTAGRAM,
  Platform.TWITTER,
  Platform.THREADS,
  Platform.FACEBOOK,
  Platform.PINTEREST,
];

const INITIAL_MASTER_CAPTION =
  "We just rolled out the all-new OmniSocial Hub 2.0 with instant cross-platform AI adaptation! Schedule to YouTube, TikTok, Instagram, X, Threads, Facebook, and Pinterest in one click. Try the future of social management today.";

const makeDefaultVariants = (caption: string, mediaUrls: string[]): Record<Platform, VariantDraft> => {
  const map = {} as Record<Platform, VariantDraft>;
  for (const p of ALL_PLATFORMS) {
    map[p] = {
      platform: p,
      caption: caption,
      hashtags: ["#SocialMedia", "#OmniChannel", "#Productivity", "#Affiliate"],
      mediaUrls: [...mediaUrls],
      options: {},
      isManuallyEdited: false,
    };
  }
  return map;
};

export const useComposerStore = create<ComposerState>((set, get) => ({
  masterTitle: "OmniSocial Hub 2.0 Launch Announcement",
  masterCaption: INITIAL_MASTER_CAPTION,
  masterMediaUrls: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  ],
  scheduledAt: null,
  tone: "viral_edgy",
  selectedPlatforms: [...ALL_PLATFORMS],
  affiliateLink: "https://omnisocial.io/ref/vip-partner",
  affiliateProductName: "OmniSocial Hub Pro",
  activeVariantTab: Platform.YOUTUBE,
  variants: makeDefaultVariants(INITIAL_MASTER_CAPTION, [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  ]),
  isAdapting: false,
  isPublishing: false,

  setMasterTitle: (masterTitle) => set({ masterTitle }),
  setMasterCaption: (masterCaption) => {
    set({ masterCaption });
    const currentVariants = get().variants;
    const updated = { ...currentVariants };
    for (const p of ALL_PLATFORMS) {
      if (!updated[p]?.isManuallyEdited) {
        if (updated[p]) {
          updated[p] = { ...updated[p], caption: masterCaption };
        }
      }
    }
    set({ variants: updated });
  },
  setMasterMediaUrls: (masterMediaUrls) => set({ masterMediaUrls }),
  addMediaUrl: (url) => {
    const next = [...get().masterMediaUrls, url];
    set({ masterMediaUrls: next });
    const currentVariants = get().variants;
    const updated = { ...currentVariants };
    for (const p of ALL_PLATFORMS) {
      if (!updated[p]?.isManuallyEdited && updated[p]) {
        updated[p] = { ...updated[p], mediaUrls: next };
      }
    }
    set({ variants: updated });
  },
  removeMediaUrl: (index) => {
    const next = get().masterMediaUrls.filter((_, i) => i !== index);
    set({ masterMediaUrls: next });
    const currentVariants = get().variants;
    const updated = { ...currentVariants };
    for (const p of ALL_PLATFORMS) {
      if (!updated[p]?.isManuallyEdited && updated[p]) {
        updated[p] = { ...updated[p], mediaUrls: next };
      }
    }
    set({ variants: updated });
  },
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setTone: (tone) => set({ tone }),
  setAffiliateLink: (affiliateLink) => set({ affiliateLink }),
  setAffiliateProductName: (affiliateProductName) => set({ affiliateProductName }),
  togglePlatform: (platform) => {
    const current = get().selectedPlatforms;
    if (current.includes(platform)) {
      if (current.length > 1) {
        const next = current.filter((p) => p !== platform);
        set({
          selectedPlatforms: next,
          activeVariantTab: next.includes(get().activeVariantTab) ? get().activeVariantTab : next[0],
        });
      }
    } else {
      set({ selectedPlatforms: [...current, platform] });
    }
  },
  setActiveVariantTab: (activeVariantTab) => set({ activeVariantTab }),
  updateVariant: (platform, patch) => {
    const current = get().variants;
    set({
      variants: {
        ...current,
        [platform]: {
          ...current[platform],
          ...patch,
          isManuallyEdited: true,
        },
      },
    });
  },
  setBulkVariants: (adapted) => {
    const current = get().variants;
    const next = { ...current };
    for (const [key, val] of Object.entries(adapted)) {
      const p = key as Platform;
      if (next[p]) {
        next[p] = {
          ...next[p],
          caption: (val as any).caption,
          hashtags: (val as any).hashtags || [],
          options: (val as any).metadata || {},
          isManuallyEdited: false,
        };
      }
    }
    set({ variants: next });
  },
  setIsAdapting: (isAdapting) => set({ isAdapting }),
  setIsPublishing: (isPublishing) => set({ isPublishing }),
  resetComposer: () =>
    set({
      masterTitle: "",
      masterCaption: "",
      masterMediaUrls: [],
      scheduledAt: null,
      variants: makeDefaultVariants("", []),
    }),
}));
