export type BoardLabel = {
  id: string;
  name: string;
  color: string;
};

export type BoardMember = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type BoardChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type BoardChecklist = {
  id: string;
  title: string;
  items: BoardChecklistItem[];
};

export type BoardComment = {
  id: string;
  text: string;
  author: string;
  createdAt: string | Date;
};

export type BoardActivityLog = {
  id: string;
  action: string;
  createdAt: string | Date;
};

export type BoardCard = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  dueDate: Date | string | null;
  cardLabels: {
    label: BoardLabel;
  }[];
  cardMembers: {
    member: BoardMember;
  }[];
  checklists: BoardChecklist[];
  comments: BoardComment[];
  activityLogs: BoardActivityLog[];
};

export type BoardList = {
  id: string;
  title: string;
  cards: BoardCard[];
};

export type BoardData = {
  id: string;
  title: string;
  background: string;
  labels: BoardLabel[];
  members: BoardMember[];
  lists: BoardList[];
};