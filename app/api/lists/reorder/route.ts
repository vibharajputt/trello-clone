import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { lists } = body as {
      lists: { id: string; position: number }[];
    };

    if (!Array.isArray(lists)) {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      lists.map((list) =>
        prisma.list.update({
          where: { id: list.id },
          data: { position: list.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/lists/reorder error:", error);
    return NextResponse.json(
      { message: "Failed to reorder lists" },
      { status: 500 }
    );
  }
}