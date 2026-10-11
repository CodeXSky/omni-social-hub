import { Platform } from "@prisma/client";
import { ISocialPlatformConnector } from "./types";
import { MetaConnector } from "./meta.connector";
import { ThreadsConnector } from "./threads.connector";
import { TikTokConnector } from "./tiktok.connector";
import { TwitterConnector } from "./twitter.connector";
import { PinterestConnector } from "./pinterest.connector";
import { YouTubeConnector } from "./youtube.connector";

export class ConnectorRegistry {
  private static connectors: Map<Platform, ISocialPlatformConnector> = new Map();

  static getConnector(platform: Platform): ISocialPlatformConnector {
    if (!this.connectors.has(platform)) {
      switch (platform) {
        case Platform.FACEBOOK:
          this.connectors.set(platform, new MetaConnector(Platform.FACEBOOK));
          break;
        case Platform.INSTAGRAM:
          this.connectors.set(platform, new MetaConnector(Platform.INSTAGRAM));
          break;
        case Platform.THREADS:
          this.connectors.set(platform, new ThreadsConnector());
          break;
        case Platform.TIKTOK:
          this.connectors.set(platform, new TikTokConnector());
          break;
        case Platform.TWITTER:
          this.connectors.set(platform, new TwitterConnector());
          break;
        case Platform.PINTEREST:
          this.connectors.set(platform, new PinterestConnector());
          break;
        case Platform.YOUTUBE:
          this.connectors.set(platform, new YouTubeConnector());
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    }
    return this.connectors.get(platform)!;
  }
}

export * from "./types";
export * from "./meta.connector";
export * from "./threads.connector";
export * from "./tiktok.connector";
export * from "./twitter.connector";
export * from "./pinterest.connector";
export * from "./youtube.connector";
