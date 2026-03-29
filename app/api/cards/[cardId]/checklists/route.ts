import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    cardId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { cardId } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Checklist title is required" },
        { status: 400 }
      );
    }

    const checklist = await prisma.checklist.create({
      data: {
        title: title.trim(),
        cardId,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error("POST /api/cards/[cardId]/checklists error:", error);

    return NextResponse.json(
      { message: "Failed to create checklist" },
      { status: 500 }
    );
  }
}