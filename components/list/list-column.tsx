"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { CardItem } from "@/components/card/card-item";
import { AddCardForm } from "@/components/card/add-card-form";
import type { BoardCard, BoardLabel, BoardList, BoardMember } from "@/types/board";

type ListColumnProps = {
  list: BoardList;
  boardLabels: BoardLabel[];
  boardMembers: BoardMember[];
  onCardUpdated: (card: BoardCard) => void;
  onCardArchived: (cardId: string) => void;
  onCardDeleted: (cardId: string) => void;
};

export function ListColumn({
  list,
  boardLabels,
  boardMembers,
  onCardUpdated,
  onCardArchived,
  onCardDeleted,
}: ListColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[280px] shrink-0 rounded-2xl bg-[#f1f2f4] p-3 shadow-sm sm:w-72"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="truncate pr-2 text-sm font-semibold text-[#172b4d]">
          {list.title}
        </h2>

        <button
          type="button"
          className="cursor-grab rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-4 w-4" />
        </button>
      </div>

      <SortableContext
        items={list.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {list.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              boardLabels={boardLabels}
              boardMembers={boardMembers}
              onCardUpdated={onCardUpdated}
              onCardArchived={onCardArchived}
              onCardDeleted={onCardDeleted}
            />
          ))}
        </div>
      </SortableContext>

      <div className="mt-3">
        <AddCardForm listId={list.id} />
      </div>
    </div>
  );
}