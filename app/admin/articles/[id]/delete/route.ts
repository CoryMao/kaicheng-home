import { NextResponse } from "next/server";
import { deleteDbArticle } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteDbArticle(id);
  return NextResponse.json({ success: true });
}
