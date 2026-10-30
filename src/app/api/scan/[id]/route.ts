import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scan = getScan(id);

  if (!scan) {
    return NextResponse.json(
      { error: "Investigation scan not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(scan);
}

