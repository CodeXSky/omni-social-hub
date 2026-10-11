/**
 * Product Metadata Extractor
 * Fetches OpenGraph meta tags, HTML titles, meta descriptions, and product schema
 * from any affiliate / e-commerce product link.
 *
 * Specially optimized for:
 * - Shopee shortlinks (s.shopee.vn, shope.ee)
 * - TikTok Shop links (vt.tiktok.com)
 * - Lazada links (s.lazada.vn)
 * - Amazon, Shopify, Gumroad, and custom SaaS landing pages.
 */

export interface ProductInfo {
  url: string;
  title: string;
  description: string;
  image: string;
  brand: string;
  price?: string;
  currency?: string;
  category?: string;
}

// User-Agents known to trigger rich preview metadata from anti-scraping platforms
const PREVIEW_CRAWLER_UAS = [
  "Twitterbot/1.0",
  "TelegramBot (like TwitterBot)",
  "WhatsApp/2.21.12.21 A",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

export async function fetchProductInfo(productUrl: string): Promise<ProductInfo> {
  const cleanUrl = productUrl.trim();
  const isShopee = cleanUrl.includes("shopee.vn") || cleanUrl.includes("shope.ee");
  const isTikTokShop = cleanUrl.includes("tiktok.com");
  const isLazada = cleanUrl.includes("lazada.vn");

  // Multi-tier crawler try
  const uasToTry = (isShopee || isTikTokShop || isLazada)
    ? ["Twitterbot/1.0", "WhatsApp/2.21.12.21 A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"]
    : ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Twitterbot/1.0"];

  for (const ua of uasToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();

        // Extract OpenGraph tags
        const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)?.[1];

        const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i)?.[1];

        const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1];

        const htmlTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

        if (ogTitle || (htmlTitle && !htmlTitle.includes("verify/traffic") && htmlTitle.length > 5)) {
          const rawTitle = ogTitle || htmlTitle || "";
          const title = cleanProductTitle(rawTitle);

          const description = ogDesc
            ? ogDesc.trim()
            : "Chính hãng, giá ưu đãi độc quyền. Mua ngay qua link affiliate để nhận voucher giảm giá!";

          const image = ogImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200";
          const brand = extractBrandFromTitleOrUrl(title, cleanUrl);

          return {
            url: cleanUrl,
            title: decodeHtmlEntities(title),
            description: decodeHtmlEntities(description),
            image,
            brand,
          };
        }
      }
    } catch (e) {
      // Continue next User-Agent attempt
    }
  }

  // Fallback heuristic extraction
  const domain = extractDomainName(cleanUrl);
  return {
    url: cleanUrl,
    title: `${domain} Top Trending Product`,
    description: `Sản phẩm chính hãng trên ${domain}. Nhận ưu đãi voucher giảm giá độc quyền qua link giới thiệu.`,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
    brand: domain,
  };
}

function cleanProductTitle(raw: string): string {
  return raw
    .replace(/\s*\|\s*Shopee.*$/i, "")
    .replace(/\s*\|\s*Lazada.*$/i, "")
    .replace(/\s*\|\s*TikTok.*$/i, "")
    .replace(/\.\.\.$/, "")
    .trim();
}

function extractBrandFromTitleOrUrl(title: string, urlStr: string): string {
  // Recognize common brands in title
  const knownBrands = ["Logitech", "Apple", "Samsung", "Xiaomi", "Sony", "Anker", "Baseus", "UGREEN", "Asus", "Dell", "HP"];
  for (const b of knownBrands) {
    if (new RegExp(`\\b${b}\\b`, "i").test(title)) {
      return b;
    }
  }
  return extractDomainName(urlStr);
}

function extractDomainName(urlStr: string): string {
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host.includes("shopee")) return "Shopee";
    if (host.includes("tiktok")) return "TikTok Shop";
    if (host.includes("lazada")) return "Lazada";
    return host.split(".")[0]?.toUpperCase() || "Featured Brand";
  } catch {
    return "Shopee";
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}
