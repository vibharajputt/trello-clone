import { prisma } from "@/lib/prisma";

export async function getBoards() {
  return prisma.board.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getBoardData(boardId: string) {
  const [board, labels, members] = await Promise.all([
    prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        lists: {
          orderBy: {
            position: "asc",
          },
          include: {
            cards: {
              where: {
                archived: false,
              },
              orderBy: {
                position: "asc",
              },
              include: {
                cardLabels: {
                  include: {
                    label: true,
                  },
                },
                cardMembers: {
                  include: {
                    member: true,
                  },
                },
                checklists: {
                  include: {
                    items: {
                      orderBy: {
                        position: "asc",
                      },
                    },
                  },
                },
                comments: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
                activityLogs: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.label.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.member.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  if (!board) return null;

  return {
    ...board,
    labels,
    members,
  };
}