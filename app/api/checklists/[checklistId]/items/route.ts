import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    checklistId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { checklistId } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Checklist item title is required" },
        { status: 400 }
      );
    }

    const lastItem = await prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: "desc" },
    });

    const item = await prisma.checklistItem.create({
      data: {
        title: title.trim(),
        checklistId,
        position: lastItem ? lastItem.position + 1 : 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/checklists/[checklistId]/items error:", error);

    return NextResponse.json(
      { message: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}