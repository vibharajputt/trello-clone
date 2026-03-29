"use client";

import dynamic from "next/dynamic";
import type { BoardData } from "@/types/board";

const BoardContent = dynamic(
  () =>
    import("@/components/board/board-content").then(
      (mod) => mod.BoardContent
    ),
  {
    ssr: false,
  }
);

type BoardViewProps = {
  board: BoardData;
};

export function BoardView({ board }: BoardViewProps) {
  return <BoardContent board={board} />;
}