import { NextResponse } from "next/server";
import { mockDB } from "@/lib/mock-db";

export async function GET() {
  try {
    const records = mockDB.getAllVariantRecords();
    return NextResponse.json({
      success: true,
      records,
      count: records.length,
    });
  } catch (err: any) {
    console.error("Records API GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
