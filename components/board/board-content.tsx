"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Search, Palette } from "lucide-react";
import { ListColumn } from "@/components/list/list-column";
import { AddListForm } from "@/components/list/add-list-form";
import type { BoardCard, BoardData, BoardList } from "@/types/board";

type BoardContentProps = {
  board: BoardData;
};

const BOARD_BACKGROUNDS = [
  "#0079bf",
  "#0f766e",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#4a8753",
  "#d29034",
  "#374151",
];

export function BoardContent({ board }: BoardContentProps) {
  const [search, setSearch] = useState("");
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [dueFilter, setDueFilter] = useState("");
  const [boardState, setBoardState] = useState(board);

  useEffect(() => {
    setBoardState(board);
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  async function updateBoardBackground(background: string) {
    const previous = boardState.background;

    setBoardState((prev) => ({
      ...prev,
      background,
    }));

    try {
      const response = await fetch(`/api/boards/${boardState.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          background,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update board background");
      }
    } catch (error) {
      console.error(error);

      setBoardState((prev) => ({
        ...prev,
        background: previous,
      }));

      alert("Could not update board background.");
    }
  }

  function handleCardUpdated(updatedCard: BoardCard) {
    setBoardState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      })),
    }));
  }

  function handleCardArchived(cardId: string) {
    setBoardState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      })),
    }));
  }

  function handleCardDeleted(cardId: string) {
    setBoardState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      })),
    }));
  }

  const filteredLists = useMemo(() => {
    return boardState.lists.map((list) => {
      const filteredCards = list.cards.filter((card) => {
        const matchesSearch = card.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesLabel = selectedLabelId
          ? card.cardLabels.some(
              (cardLabel) => cardLabel.label.id === selectedLabelId
            )
          : true;

        const matchesMember = selectedMemberId
          ? card.cardMembers.some(
              (cardMember) => cardMember.member.id === selectedMemberId
            )
          : true;

        const hasDueDate = !!card.dueDate;
        const isOverdue = hasDueDate
          ? new Date(card.dueDate as string | Date).getTime() < Date.now()
          : false;

        const matchesDueDate =
          dueFilter === "with-due-date"
            ? hasDueDate
            : dueFilter === "overdue"
            ? isOverdue
            : true;

        return (
          matchesSearch && matchesLabel && matchesMember && matchesDueDate
        );
      });

      return {
        ...list,
        cards: filteredCards,
      };
    });
  }, [boardState, search, selectedLabelId, selectedMemberId, dueFilter]);

  function findListByCardId(cardId: string) {
    return boardState.lists.find((list) =>
      list.cards.some((card) => card.id === cardId)
    );
  }

  async function persistListOrder(lists: BoardList[]) {
    await fetch("/api/lists/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lists: lists.map((list, index) => ({
          id: list.id,
          position: index,
        })),
      }),
    });
  }

  async function persistCardOrder(lists: BoardList[]) {
    const cards = lists.flatMap((list) =>
      list.cards.map((card, index) => ({
        id: card.id,
        listId: list.id,
        position: index,
      }))
    );

    await fetch("/api/cards/reorder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cards }),
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeList = boardState.lists.find((list) => list.id === activeId);
    const overList = boardState.lists.find((list) => list.id === overId);

    if (activeList && overList && activeId !== overId) {
      const oldIndex = boardState.lists.findIndex((list) => list.id === activeId);
      const newIndex = boardState.lists.findIndex((list) => list.id === overId);

      const newLists = arrayMove(boardState.lists, oldIndex, newIndex);

      setBoardState((prev) => ({
        ...prev,
        lists: newLists,
      }));

      try {
        await persistListOrder(newLists);
      } catch (error) {
        console.error(error);
      }

      return;
    }

    const sourceList = findListByCardId(activeId);
    const destinationList = findListByCardId(overId);

    if (!sourceList || !destinationList) return;

    if (sourceList.id === destinationList.id) {
      const sourceIndex = sourceList.cards.findIndex((card) => card.id === activeId);
      const destinationIndex = destinationList.cards.findIndex(
        (card) => card.id === overId
      );

      if (sourceIndex === -1 || destinationIndex === -1) return;
      if (sourceIndex === destinationIndex) return;

      const updatedLists = boardState.lists.map((list) => {
        if (list.id !== sourceList.id) return list;

        return {
          ...list,
          cards: arrayMove(list.cards, sourceIndex, destinationIndex),
        };
      });

      setBoardState((prev) => ({
        ...prev,
        lists: updatedLists,
      }));

      try {
        await persistCardOrder(updatedLists);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await persistCardOrder(boardState.lists);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceList = findListByCardId(activeId);
    const destinationList = findListByCardId(overId);

    if (!sourceList || !destinationList) return;
    if (sourceList.id === destinationList.id) return;

    const activeCard = sourceList.cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    setBoardState((prev) => {
      const source = prev.lists.find((list) => list.id === sourceList.id);
      const destination = prev.lists.find((list) => list.id === destinationList.id);

      if (!source || !destination) return prev;

      const sourceCards = source.cards.filter((card) => card.id !== activeId);

      const overIndex = destination.cards.findIndex((card) => card.id === overId);
      const insertIndex = overIndex >= 0 ? overIndex : destination.cards.length;

      const destinationCards = [...destination.cards];
      destinationCards.splice(insertIndex, 0, activeCard);

      return {
        ...prev,
        lists: prev.lists.map((list) => {
          if (list.id === source.id) {
            return { ...list, cards: sourceCards };
          }

          if (list.id === destination.id) {
            return { ...list, cards: destinationCards };
          }

          return list;
        }),
      };
    });
  }

  return (
    <main
      className="min-h-screen text-[#172b4d] transition-colors"
      style={{ backgroundColor: boardState.background }}
    >
      <div className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3">
                <h1 className="text-xl font-semibold text-white md:text-2xl">
                  {boardState.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                    <Palette className="h-4 w-4" />
                    <span>Background</span>
                  </div>

                  {BOARD_BACKGROUNDS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateBoardBackground(color)}
                      className={`h-6 w-6 rounded-full border-2 transition ${
                        boardState.background === color
                          ? "border-white scale-110"
                          : "border-white/40"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="w-fit rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
                Trello Clone
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cards..."
                  className="w-full rounded-md border border-white/15 bg-white px-9 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <select
                value={selectedLabelId}
                onChange={(e) => setSelectedLabelId(e.target.value)}
                className="rounded-md border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none"
              >
                <option value="">All labels</option>
                {boardState.labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="rounded-md border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none"
              >
                <option value="">All members</option>
                {boardState.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>

              <select
                value={dueFilter}
                onChange={(e) => setDueFilter(e.target.value)}
                className="rounded-md border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none"
              >
                <option value="">All due dates</option>
                <option value="with-due-date">Has due date</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-5 md:px-4 md:py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <SortableContext
            items={filteredLists.map((list) => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex min-h-[calc(100vh-160px)] items-start gap-4 pb-4">
              {filteredLists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  boardLabels={boardState.labels}
                  boardMembers={boardState.members}
                  onCardUpdated={handleCardUpdated}
                  onCardArchived={handleCardArchived}
                  onCardDeleted={handleCardDeleted}
                />
              ))}

              <AddListForm boardId={boardState.id} />
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}