import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    cardId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { cardId } = await params;
    const body = await request.json();
    const { title, description, dueDate, labelIds, memberIds, archived, coverUrl } = body;

    const existingCard = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!existingCard) {
      return NextResponse.json(
        { message: "Card not found" },
        { status: 404 }
      );
    }

    const updatedCard = await prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        title: title?.trim() ?? existingCard.title,
        description:
          description !== undefined
            ? description?.trim() || null
            : existingCard.description,
        coverUrl:
          coverUrl !== undefined
            ? coverUrl?.trim() || null
            : existingCard.coverUrl,
        dueDate:
          dueDate !== undefined
            ? dueDate
              ? new Date(dueDate)
              : null
            : existingCard.dueDate,
        archived:
          archived !== undefined ? Boolean(archived) : existingCard.archived,
        cardLabels:
          labelIds !== undefined
            ? {
                deleteMany: {},
                create: Array.isArray(labelIds)
                  ? labelIds.map((labelId: string) => ({
                      label: {
                        connect: { id: labelId },
                      },
                    }))
                  : [],
              }
            : undefined,
        cardMembers:
          memberIds !== undefined
            ? {
                deleteMany: {},
                create: Array.isArray(memberIds)
                  ? memberIds.map((memberId: string) => ({
                      member: {
                        connect: { id: memberId },
                      },
                    }))
                  : [],
              }
            : undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        cardId,
        action: archived ? "Archived the card" : "Updated card details",
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("PATCH /api/cards/[cardId] error:", error);

    return NextResponse.json(
      { message: "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const { cardId } = await params;

    await prisma.card.delete({
      where: {
        id: cardId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cards/[cardId] error:", error);

    return NextResponse.json(
      { message: "Failed to delete card" },
      { status: 500 }
    );
  }
}