"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddCardFormProps = {
  listId: string;
};

export function AddCardForm({ listId }: AddCardFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listId,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create card");
      }

      setTitle("");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Could not create card.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-200"
      >
        + Add a card
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a title for this card..."
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400"
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-[#0c66e4] px-3 py-2 text-sm font-medium text-white hover:bg-[#0055cc] disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add card"}
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
  );
}