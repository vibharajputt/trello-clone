"use client";

import { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckSquare2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import type { BoardCard, BoardLabel, BoardMember } from "@/types/board";
import { CardDetailDialog } from "@/components/card/card-detail-dialog";

type CardItemProps = {
  card: BoardCard;
  boardLabels: BoardLabel[];
  boardMembers: BoardMember[];
  onCardUpdated: (card: BoardCard) => void;
  onCardArchived: (cardId: string) => void;
  onCardDeleted: (cardId: string) => void;
};

export function CardItem({
  card,
  boardLabels,
  boardMembers,
  onCardUpdated,
  onCardArchived,
  onCardDeleted,
}: CardItemProps) {
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const totalChecklistItems = card.checklists.reduce(
    (acc, checklist) => acc + checklist.items.length,
    0
  );

  const completedChecklistItems = card.checklists.reduce(
    (acc, checklist) =>
      acc + checklist.items.filter((item) => item.completed).length,
    0
  );

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition hover:bg-slate-50 hover:shadow-md">
          {card.coverUrl && (
            <div className="relative h-32 w-full">
              <Image
                src={card.coverUrl}
                alt={card.title}
                fill
                className="object-cover"
                sizes="288px"
                unoptimized
              />
            </div>
          )}

          <div className="p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {card.cardLabels.map((cardLabel) => (
                  <span
                    key={cardLabel.label.id}
                    className="h-2 w-10 rounded-full"
                    style={{ backgroundColor: cardLabel.label.color }}
                    title={cardLabel.label.name}
                  />
                ))}
              </div>

              <button
                type="button"
                className="cursor-grab rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="block w-full text-left"
            >
              <p className="text-sm leading-5 text-[#172b4d]">{card.title}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                {card.dueDate && (
                  <div className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{format(new Date(card.dueDate), "MMM d")}</span>
                  </div>
                )}

                {totalChecklistItems > 0 && (
                  <div className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-1">
                    <CheckSquare2 className="h-3.5 w-3.5" />
                    <span>
                      {completedChecklistItems}/{totalChecklistItems}
                    </span>
                  </div>
                )}
              </div>

              {card.cardMembers.length > 0 && (
                <div className="mt-3 flex items-center justify-end">
                  <div className="flex -space-x-2">
                    {card.cardMembers.map(({ member }) => (
                      <div
                        key={member.id}
                        title={member.name}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-semibold text-white shadow-sm"
                      >
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <CardDetailDialog
        card={card}
        boardLabels={boardLabels}
        boardMembers={boardMembers}
        open={open}
        onOpenChange={setOpen}
        onCardUpdated={onCardUpdated}
        onCardArchived={onCardArchived}
        onCardDeleted={onCardDeleted}
      />
    </>
  );
}