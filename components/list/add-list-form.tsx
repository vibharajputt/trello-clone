"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddListFormProps = {
  boardId: string;
};

export function AddListForm({ boardId }: AddListFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create list");
      }

      setTitle("");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Could not create list.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-72 shrink-0 rounded-xl bg-white/20 p-3 text-left text-sm font-medium text-white transition hover:bg-white/30"
      >
        + Add another list
      </button>
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-xl bg-[#f1f2f4] p-3 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter list title..."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400"
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-[#0c66e4] px-3 py-2 text-sm font-medium text-white hover:bg-[#0055cc] disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add list"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTitle("");
            }}
            className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}