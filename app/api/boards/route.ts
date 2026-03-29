import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Board title is required" },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("POST /api/boards error:", error);

    return NextResponse.json(
      { message: "Failed to create board" },
      { status: 500 }
    );
  }
}