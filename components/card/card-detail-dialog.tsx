"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type {
  BoardActivityLog,
  BoardCard,
  BoardComment,
  BoardLabel,
  BoardMember,
} from "@/types/board";

type CardDetailDialogProps = {
  card: BoardCard;
  boardLabels: BoardLabel[];
  boardMembers: BoardMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardUpdated: (card: BoardCard) => void;
  onCardArchived: (cardId: string) => void;
  onCardDeleted: (cardId: string) => void;
};

function formatDateForInput(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function CardDetailDialog({
  card,
  boardLabels,
  boardMembers,
  open,
  onOpenChange,
  onCardUpdated,
  onCardArchived,
  onCardDeleted,
}: CardDetailDialogProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [coverUrl, setCoverUrl] = useState(card.coverUrl || "");
  const [dueDate, setDueDate] = useState(formatDateForInput(card.dueDate));
  const [selectedLabelIds, setSelectedLabelIds] = useState(
    card.cardLabels.map((item) => item.label.id)
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    card.cardMembers.map((item) => item.member.id)
  );
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newChecklistItemTitles, setNewChecklistItemTitles] = useState<Record<string, string>>(
    {}
  );
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<BoardComment[]>(card.comments);
  const [localActivityLogs, setLocalActivityLogs] = useState<BoardActivityLog[]>(
    card.activityLogs
  );
  const [isLoading, setIsLoading] = useState(false);

  function toggleLabel(labelId: string) {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  }

  function toggleMember(memberId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  async function handleSave() {
    if (!title.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          coverUrl,
          dueDate: dueDate || null,
          labelIds: selectedLabelIds,
          memberIds: selectedMemberIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      const selectedLabels = boardLabels.filter((label) =>
        selectedLabelIds.includes(label.id)
      );

      const selectedMembers = boardMembers.filter((member) =>
        selectedMemberIds.includes(member.id)
      );

      const updatedLog: BoardActivityLog = {
        id: crypto.randomUUID(),
        action: "Updated card details",
        createdAt: new Date().toISOString(),
      };

      setLocalActivityLogs((prev) => [updatedLog, ...prev]);

      onCardUpdated({
        ...card,
        title,
        description,
        coverUrl: coverUrl || null,
        dueDate: dueDate || null,
        cardLabels: selectedLabels.map((label) => ({ label })),
        cardMembers: selectedMembers.map((member) => ({ member })),
        comments: localComments,
        activityLogs: [updatedLog, ...localActivityLogs],
      });

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Could not update card.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleArchive() {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          archived: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive card");
      }

      onCardArchived(card.id);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Could not archive card.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this card?");
    if (!confirmed) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete card");
      }

      onCardDeleted(card.id);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Could not delete card.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddChecklist() {
    if (!newChecklistTitle.trim()) return;

    try {
      const response = await fetch(`/api/cards/${card.id}/checklists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newChecklistTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checklist");
      }

      setNewChecklistTitle("");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Could not create checklist.");
    }
  }

  async function handleAddChecklistItem(checklistId: string) {
    const value = newChecklistItemTitles[checklistId]?.trim();

    if (!value) return;

    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checklist item");
      }

      setNewChecklistItemTitles((prev) => ({
        ...prev,
        [checklistId]: "",
      }));

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Could not create checklist item.");
    }
  }

  async function handleToggleChecklistItem(itemId: string, completed: boolean) {
    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update checklist item");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Could not update checklist item.");
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/cards/${card.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const createdComment: BoardComment = {
        id: crypto.randomUUID(),
        text: newComment.trim(),
        author: "Default User",
        createdAt: new Date().toISOString(),
      };

      const newLog: BoardActivityLog = {
        id: crypto.randomUUID(),
        action: `Added a comment: "${newComment.trim()}"`,
        createdAt: new Date().toISOString(),
      };

      setLocalComments((prev) => [createdComment, ...prev]);
      setLocalActivityLogs((prev) => [newLog, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error(error);
      alert("Could not add comment.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">
            Edit Card
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                placeholder="Card title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Cover image URL
              </label>
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                placeholder="Add a more detailed description..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Due date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Labels</label>
              <div className="flex flex-wrap gap-2">
                {boardLabels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);

                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`rounded-md border px-3 py-2 text-xs font-medium text-white transition ${
                        isSelected
                          ? "ring-2 ring-black/30"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: label.color }}
                      title={label.name}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Members</label>
              <div className="flex flex-wrap gap-2">
                {boardMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Comments</h3>

              <div className="flex flex-col gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="w-fit rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Add comment
                </button>
              </div>

              <div className="space-y-3">
                {localComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-md border border-slate-200 bg-white p-3"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800">
                        {comment.author}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(comment.createdAt), "MMM d, p")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Checklists</h3>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="New checklist title"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Add checklist
                </button>
              </div>

              <div className="space-y-4">
                {card.checklists.map((checklist) => (
                  <div
                    key={checklist.id}
                    className="rounded-md border border-slate-200 p-3"
                  >
                    <h4 className="mb-3 text-sm font-medium text-slate-800">
                      {checklist.title}
                    </h4>

                    <div className="space-y-2">
                      {checklist.items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() =>
                              handleToggleChecklistItem(item.id, item.completed)
                            }
                          />
                          <span
                            className={`text-sm ${
                              item.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {item.title}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={newChecklistItemTitles[checklist.id] || ""}
                        onChange={(e) =>
                          setNewChecklistItemTitles((prev) => ({
                            ...prev,
                            [checklist.id]: e.target.value,
                          }))
                        }
                        placeholder="Add an item"
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddChecklistItem(checklist.id)}
                        className="rounded-md bg-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300"
                      >
                        Add item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="rounded-md bg-[#0c66e4] px-4 py-2 text-sm font-medium text-white hover:bg-[#0055cc] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>

              <button
                onClick={handleArchive}
                disabled={isLoading}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Archive
              </button>

              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>

              <button
                onClick={() => onOpenChange(false)}
                className="rounded-md px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Activity</h3>

            <div className="space-y-3">
              {localActivityLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <p className="text-sm text-slate-700">{log.action}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {format(new Date(log.createdAt), "MMM d, p")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}