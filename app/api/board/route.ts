import { NextResponse } from "next/server";
import { getBoardData } from "@/lib/board";

export async function GET() {
  try {
    const board = await getBoardData();

    if (!board) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("GET /api/board error:", error);

    return NextResponse.json(
      { message: "Failed to fetch board" },
      { status: 500 }
    );
  }
}