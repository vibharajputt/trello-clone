import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { cards } = body as {
      cards: { id: string; listId: string; position: number }[];
    };

    if (!Array.isArray(cards)) {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      cards.map((card) =>
        prisma.card.update({
          where: { id: card.id },
          data: {
            listId: card.listId,
            position: card.position,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/cards/reorder error:", error);
    return NextResponse.json(
      { message: "Failed to reorder cards" },
      { status: 500 }
    );
  }
}