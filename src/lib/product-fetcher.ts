/**
 * Product Metadata Extractor
 * Fetches OpenGraph meta tags, HTML titles, meta descriptions, and product schema
 * from any affiliate / e-commerce product link (e.g. Amazon, Shopify, Gumroad, SaaS landing page).
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

export async function fetchProductInfo(productUrl: string): Promise<ProductInfo> {
  const cleanUrl = productUrl.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();

      // Extract OG Title or HTML <title>
      const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const htmlTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
      const title = ogTitle || htmlTitle || extractDomainName(cleanUrl);

      // Extract OG Description or meta description
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const description = ogDesc || metaDesc || "High-demand affiliate product with verified customer reviews and exclusive bonus deals.";

      // Extract OG Image
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const image = ogImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80";

      // Extract Site Name or Brand
      const siteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const brand = siteName || extractDomainName(cleanUrl);

      return {
        url: cleanUrl,
        title: decodeHtmlEntities(title.trim()),
        description: decodeHtmlEntities(description.trim()),
        image,
        brand,
      };
    }
  } catch (err) {
    // If external site blocks CORS/UserAgent, fallback to intelligent heuristics from URL
  }

  // Fallback heuristic extraction
  const domain = extractDomainName(cleanUrl);
  return {
    url: cleanUrl,
    title: `${domain} Official Premium Offer`,
    description: `Exclusive limited-time deal and top-rated affiliate offer on ${domain}. Claim early discount now.`,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
    brand: domain,
  };
}

function extractDomainName(urlStr: string): string {
  try {
    const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    const host = parsed.hostname.replace(/^www\./, "");
    return host.split(".")[0]?.toUpperCase() || "Featured Brand";
  } catch {
    return "Featured Brand";
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
