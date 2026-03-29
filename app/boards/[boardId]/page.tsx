import { BoardView } from "@/components/board/board-view";
import { getBoardData, getBoards } from "@/lib/board";
import type { BoardData } from "@/types/board";
import Link from "next/link";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const board = (await getBoardData(boardId)) as BoardData | null;
  const boards = await getBoards();

  if (!board) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0079bf] text-white">
        <p className="text-lg font-medium">Board not found.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b bg-slate-900 px-4 py-3 text-white">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Boards
          </span>

          {boards.map((item) => (
            <Link
              key={item.id}
              href={`/boards/${item.id}`}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                item.id === board.id
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <BoardView board={board} />
    </div>
  );
}