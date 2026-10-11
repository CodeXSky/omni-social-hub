import { NextResponse } from "next/server";
import { fetchProductInfo } from "@/lib/product-fetcher";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "Product URL is required" }, { status: 400 });
    }

    const product = await fetchProductInfo(url);
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch product metadata" }, { status: 500 });
  }
}
