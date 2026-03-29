import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, title } = body;

    if (!boardId || !title?.trim()) {
      return NextResponse.json(
        { message: "boardId and title are required" },
        { status: 400 }
      );
    }

    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });

    const newList = await prisma.list.create({
      data: {
        title: title.trim(),
        boardId,
        position: lastList ? lastList.position + 1 : 0,
      },
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    console.error("POST /api/lists error:", error);

    return NextResponse.json(
      { message: "Failed to create list" },
      { status: 500 }
    );
  }
}