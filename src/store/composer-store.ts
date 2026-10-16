import { create } from "zustand";
import { Platform } from "@prisma/client";
import { parseGoogleDriveUrl } from "@/lib/gdrive-resolver";

export interface VariantDraft {
  platform: Platform;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  options: Record<string, any>;
  isManuallyEdited: boolean;
}

export interface FetchedProductData {
  url: string;
  title: string;
  description: string;
  image: string;
  brand: string;
}

interface ComposerState {
  // Master post state
  masterTitle: string;
  masterCaption: string;
  masterMediaUrls: string[];
  googleDriveVideoUrl: string;
  isGoogleDriveConverted: boolean;
  scheduledAt: string | null;
  tone: "engaging" | "professional" | "viral_edgy" | "educational" | "casual";
  selectedPlatforms: Platform[];

  // Affiliate & Product Fetcher state
  affiliateProductUrl: string;
  affiliateLink: string;
  affiliateProductName: string;
  fetchedProduct: FetchedProductData | null;
  isFetchingProduct: boolean;

  // Real-time trending context
  currentTrendingTopic: string;
  trendingUrgency: string;

  // Variant states
  activeVariantTab: Platform;
  variants: Record<Platform, VariantDraft>;
  isAdapting: boolean;
  isPublishing: boolean;

  // Actions
  setMasterTitle: (title: string) => void;
  setMasterCaption: (caption: string) => void;
  setMasterMediaUrls: (urls: string[]) => void;
  setGoogleDriveVideoUrl: (url: string) => void;
  addMediaUrl: (url: string) => void;
  removeMediaUrl: (index: number) => void;
  setScheduledAt: (date: string | null) => void;
  setTone: (tone: any) => void;
  setAffiliateProductUrl: (url: string) => void;
  setAffiliateLink: (link: string) => void;
  setAffiliateProductName: (name: string) => void;
  setFetchedProduct: (prod: FetchedProductData | null) => void;
  setIsFetchingProduct: (val: boolean) => void;
  setCurrentTrendingTopic: (topic: string) => void;
  setTrendingUrgency: (urgency: string) => void;
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

const INITIAL_MASTER_CAPTION = "";

const DEFAULT_GDRIVE_SAMPLE = "";

const makeDefaultVariants = (caption: string, mediaUrls: string[]): Record<Platform, VariantDraft> => {
  const map = {} as Record<Platform, VariantDraft>;
  for (const p of ALL_PLATFORMS) {
    map[p] = {
      platform: p,
      caption: caption,
      hashtags: [],
      mediaUrls: [...mediaUrls],
      options: {},
      isManuallyEdited: false,
    };
  }
  return map;
};

export const useComposerStore = create<ComposerState>((set, get) => ({
  masterTitle: "",
  masterCaption: INITIAL_MASTER_CAPTION,
  masterMediaUrls: [],
  googleDriveVideoUrl: DEFAULT_GDRIVE_SAMPLE,
  isGoogleDriveConverted: false,
  scheduledAt: null,
  tone: "viral_edgy",
  selectedPlatforms: [...ALL_PLATFORMS],

  // Product & Affiliate state
  affiliateProductUrl: "",
  affiliateLink: "",
  affiliateProductName: "",
  fetchedProduct: null,
  isFetchingProduct: false,

  currentTrendingTopic: "",
  trendingUrgency: "",
  activeVariantTab: Platform.YOUTUBE,
  variants: makeDefaultVariants(INITIAL_MASTER_CAPTION, []),
  isAdapting: false,
  isPublishing: false,

  setMasterTitle: (masterTitle) => set({ masterTitle }),
  setMasterCaption: (masterCaption) => {
    set({ masterCaption });
    const currentVariants = get().variants;
    const updated = { ...currentVariants };
    for (const p of ALL_PLATFORMS) {
      if (!updated[p]?.isManuallyEdited && updated[p]) {
        updated[p] = { ...updated[p], caption: masterCaption };
      }
    }
    set({ variants: updated });
  },
  setMasterMediaUrls: (masterMediaUrls) => set({ masterMediaUrls }),
  setGoogleDriveVideoUrl: (googleDriveVideoUrl) => {
    const parsed = parseGoogleDriveUrl(googleDriveVideoUrl);
    set({ 
      googleDriveVideoUrl,
      isGoogleDriveConverted: parsed.isGoogleDrive
    });
    if (parsed.isGoogleDrive) {
      const nextMedia = [parsed.directStreamUrl, ...get().masterMediaUrls.filter(u => !u.includes("drive.google.com"))];
      set({ masterMediaUrls: nextMedia });
    }
  },
  addMediaUrl: (url) => {
    const next = [...get().masterMediaUrls, url];
    set({ masterMediaUrls: next });
  },
  removeMediaUrl: (index) => {
    const next = get().masterMediaUrls.filter((_, i) => i !== index);
    set({ masterMediaUrls: next });
  },
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  setTone: (tone) => set({ tone }),
  setAffiliateProductUrl: (affiliateProductUrl) => {
    set({ 
      affiliateProductUrl,
      // Auto-inject the product URL as the default affiliate referral link unless already customized
      affiliateLink: affiliateProductUrl 
    });
  },
  setAffiliateLink: (affiliateLink) => set({ affiliateLink }),
  setAffiliateProductName: (affiliateProductName) => set({ affiliateProductName }),
  setFetchedProduct: (fetchedProduct) => set({ fetchedProduct }),
  setIsFetchingProduct: (isFetchingProduct) => set({ isFetchingProduct }),
  setCurrentTrendingTopic: (currentTrendingTopic) => set({ currentTrendingTopic }),
  setTrendingUrgency: (trendingUrgency) => set({ trendingUrgency }),
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
          mediaUrls: (val as any).videoStreamUrl ? [(val as any).videoStreamUrl] : next[p].mediaUrls,
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
      googleDriveVideoUrl: "",
      isGoogleDriveConverted: false,
      scheduledAt: null,
      affiliateProductUrl: "",
      affiliateLink: "",
      affiliateProductName: "",
      fetchedProduct: null,
      currentTrendingTopic: "",
      trendingUrgency: "",
      variants: makeDefaultVariants("", []),
    }),
}));
