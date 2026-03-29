import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.cardLabel.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.card.deleteMany();
  await prisma.label.deleteMany();
  await prisma.member.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();

  const board = await prisma.board.create({
    data: {
      title: "Scaler AI Lab Project Board",
      background: "#0079bf",
      lists: {
        create: [
          {
            title: "To Do",
            position: 0,
            cards: {
              create: [
                {
                  title: "Design database schema",
                  description:
                    "Create a relational schema for boards, lists, cards, labels, members, and checklists.",
                  position: 0,
                  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                },
                {
                  title: "Build board UI",
                  description:
                    "Create a Trello-like board layout with horizontally scrollable lists.",
                  position: 1,
                },
              ],
            },
          },
          {
            title: "In Progress",
            position: 1,
            cards: {
              create: [
                {
                  title: "Implement drag and drop",
                  description:
                    "Allow users to reorder lists and move cards across lists.",
                  position: 0,
                  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                },
              ],
            },
          },
          {
            title: "Done",
            position: 2,
            cards: {
              create: [
                {
                  title: "Set up Next.js project",
                  description:
                    "Initialize app with Tailwind, shadcn/ui, Prisma, and PostgreSQL.",
                  position: 0,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      lists: {
        include: {
          cards: true,
        },
      },
    },
  });

  const labels = await Promise.all([
    prisma.label.create({
      data: {
        name: "High Priority",
        color: "#ef4444",
      },
    }),
    prisma.label.create({
      data: {
        name: "Frontend",
        color: "#3b82f6",
      },
    }),
    prisma.label.create({
      data: {
        name: "Backend",
        color: "#22c55e",
      },
    }),
    prisma.label.create({
      data: {
        name: "Design",
        color: "#eab308",
      },
    }),
  ]);

  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: "Aarav Sharma",
        email: "aarav@example.com",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Aarav",
      },
    }),
    prisma.member.create({
      data: {
        name: "Priya Singh",
        email: "priya@example.com",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Priya",
      },
    }),
    prisma.member.create({
      data: {
        name: "Rohan Gupta",
        email: "rohan@example.com",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan",
      },
    }),
  ]);

  const todoList = board.lists.find((list) => list.title === "To Do");
  const inProgressList = board.lists.find((list) => list.title === "In Progress");

  if (!todoList || !inProgressList) {
    throw new Error("Required lists not found");
  }

  const todoCard = todoList.cards.find(
    (card) => card.title === "Design database schema"
  );
  const dndCard = inProgressList.cards.find(
    (card) => card.title === "Implement drag and drop"
  );

  if (!todoCard || !dndCard) {
    throw new Error("Required cards not found");
  }

  await prisma.cardLabel.createMany({
    data: [
      {
        cardId: todoCard.id,
        labelId: labels[2].id,
      },
      {
        cardId: todoCard.id,
        labelId: labels[0].id,
      },
      {
        cardId: dndCard.id,
        labelId: labels[1].id,
      },
    ],
  });

  await prisma.cardMember.createMany({
    data: [
      {
        cardId: todoCard.id,
        memberId: members[0].id,
      },
      {
        cardId: todoCard.id,
        memberId: members[1].id,
      },
      {
        cardId: dndCard.id,
        memberId: members[2].id,
      },
    ],
  });

  const checklist = await prisma.checklist.create({
    data: {
      title: "Schema tasks",
      cardId: todoCard.id,
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      {
        title: "Create Board model",
        completed: true,
        position: 0,
        checklistId: checklist.id,
      },
      {
        title: "Create List model",
        completed: true,
        position: 1,
        checklistId: checklist.id,
      },
      {
        title: "Create Card model",
        completed: false,
        position: 2,
        checklistId: checklist.id,
      },
    ],
  });

  await prisma.board.create({
    data: {
      title: "Product Roadmap Board",
      background: "#0f766e",
      lists: {
        create: [
          {
            title: "Ideas",
            position: 0,
            cards: {
              create: [
                {
                  title: "Add dark mode",
                  description: "Allow users to switch between light and dark themes.",
                  position: 0,
                },
                {
                  title: "Mobile app support",
                  description: "Plan native mobile experience for Android and iOS.",
                  position: 1,
                },
              ],
            },
          },
          {
            title: "Planned",
            position: 1,
            cards: {
              create: [
                {
                  title: "Team workspace support",
                  description: "Enable multiple team workspaces and permissions.",
                  position: 0,
                },
              ],
            },
          },
          {
            title: "Released",
            position: 2,
            cards: {
              create: [
                {
                  title: "Board sharing",
                  description: "Allow board URLs to be shared across team members.",
                  position: 0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed data inserted successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });