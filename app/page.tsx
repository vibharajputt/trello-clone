import { redirect } from "next/navigation";
import { getBoards } from "@/lib/board";

export default async function HomePage() {
  const boards = await getBoards();

  if (boards.length > 0) {
    redirect(`/boards/${boards[0].id}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0079bf] text-white">
      <p className="text-lg font-medium">No boards found.</p>
    </main>
  );
}