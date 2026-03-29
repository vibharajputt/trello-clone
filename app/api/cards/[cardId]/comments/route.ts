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
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { message: "Comment text is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        cardId,
        author: "Default User",
      },
    });

    await prisma.activityLog.create({
      data: {
        cardId,
        action: `Added a comment: "${text.trim()}"`,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST /api/cards/[cardId]/comments error:", error);

    return NextResponse.json(
      { message: "Failed to add comment" },
      { status: 500 }
    );
  }
}