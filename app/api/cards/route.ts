import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listId, title } = body;

    if (!listId || !title?.trim()) {
      return NextResponse.json(
        { message: "listId and title are required" },
        { status: 400 }
      );
    }

    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: "desc" },
    });

    const newCard = await prisma.card.create({
      data: {
        title: title.trim(),
        listId,
        position: lastCard ? lastCard.position + 1 : 0,
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("POST /api/cards error:", error);

    return NextResponse.json(
      { message: "Failed to create card" },
      { status: 500 }
    );
  }
}