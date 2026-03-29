import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    boardId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { boardId } = await params;
    const body = await request.json();
    const { title, background } = body;

    const updatedBoard = await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(background !== undefined ? { background } : {}),
      },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("PATCH /api/boards/[boardId] error:", error);

    return NextResponse.json(
      { message: "Failed to update board" },
      { status: 500 }
    );
  }
}