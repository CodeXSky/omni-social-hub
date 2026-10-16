import { Platform } from "@prisma/client";
import { BaseSocialProvider } from "./base.provider";
import { TikTokProvider } from "./tiktok.provider";
import { YouTubeProvider } from "./youtube.provider";
import { MetaFacebookProvider } from "./meta-facebook.provider";
import { MetaInstagramProvider } from "./meta-instagram.provider";
import { TwitterProvider } from "./twitter.provider";
import { ThreadsProvider } from "./threads.provider";
import { PinterestProvider } from "./pinterest.provider";

export * from "./base.provider";
export * from "./tiktok.provider";
export * from "./youtube.provider";
export * from "./meta-facebook.provider";
export * from "./meta-instagram.provider";
export * from "./twitter.provider";
export * from "./threads.provider";
export * from "./pinterest.provider";

// Singleton provider cache
const providers: Partial<Record<Platform, BaseSocialProvider>> = {
  [Platform.TIKTOK]: new TikTokProvider(),
  [Platform.YOUTUBE]: new YouTubeProvider(),
  [Platform.FACEBOOK]: new MetaFacebookProvider(),
  [Platform.INSTAGRAM]: new MetaInstagramProvider(),
  [Platform.TWITTER]: new TwitterProvider(),
  [Platform.THREADS]: new ThreadsProvider(),
  [Platform.PINTEREST]: new PinterestProvider(),
};

/**
 * Factory to retrieve provider by social platform
 */
export function getSocialProvider(platform: Platform): BaseSocialProvider {
  const provider = providers[platform];
  if (!provider) {
    throw new Error(`Provider for platform ${platform} is not implemented.`);
  }
  return provider;
}
