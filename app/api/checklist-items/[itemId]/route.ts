import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { completed } = body;

    const updatedItem = await prisma.checklistItem.update({
      where: {
        id: itemId,
      },
      data: {
        completed: Boolean(completed),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PATCH /api/checklist-items/[itemId] error:", error);

    return NextResponse.json(
      { message: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}