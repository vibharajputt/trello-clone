# Trello Clone — Project Management Tool

A full-stack Kanban-style project management application inspired by Trello, built as part of an SDE Intern Fullstack Assignment.

The application replicates Trello’s board-based workflow and interaction style, allowing users to visually organize tasks using boards, lists, and cards with drag-and-drop interactions, card metadata management, checklists, comments, activity logs, search, filters, and board customization.

---

## Links

**GitHub Repository:**  
https://github.com/vibharajputt/trello-clone

**Deployed Application:**  
http://trello-clone-rust-one.vercel.app/

---

## Overview

This project was built to create a Trello-like project management experience with a focus on:

- Trello-inspired UI and UX patterns
- smooth drag-and-drop interactions
- modular full-stack architecture
- relational database design
- reusable components
- seeded sample data for evaluation

The application supports board, list, and card management along with labels, members, due dates, checklists, comments, activity tracking, filters, and board customization.

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes

### Database
- PostgreSQL

### ORM
- Prisma

---

## Features Implemented

### Core Features

#### Board Management
- Create boards with a title
- View boards with their lists and cards

#### List Management
- Create lists
- Edit list titles
- Delete lists
- Drag and drop to reorder lists

#### Card Management
- Create cards with a title
- Edit card title and description
- Delete cards
- Archive cards
- Drag and drop cards between lists
- Drag and drop cards within the same list

#### Card Details
- Add and remove labels
- Set due dates
- Assign members to cards
- Add checklists
- Add checklist items
- Mark checklist items as complete/incomplete

#### Search & Filter
- Search cards by title
- Filter cards by labels
- Filter cards by members
- Filter cards by due date

---

## Bonus Features Implemented

- Responsive design for mobile, tablet, and desktop
- Multiple boards support
- Comments on cards
- Activity log on cards
- Card covers using image URLs
- Board background customization

---

## Bonus Feature Not Implemented

- File attachments on cards

---

## UI / UX Notes

- The interface is designed to closely resemble Trello’s Kanban-style board workflow
- Lists are displayed horizontally to match the Trello experience
- Drag-and-drop is supported for both list and card reordering
- Card details are managed using a modal dialog
- The layout is responsive across different screen sizes

---

## Database Design

The schema is designed using Prisma with normalized relational models.

### Main Models
- **Board**
- **List**
- **Card**
- **Label**
- **CardLabel**
- **Member**
- **CardMember**
- **Checklist**
- **ChecklistItem**
- **Comment**
- **ActivityLog**

### Design Highlights
- One board can have multiple lists
- One list can have multiple cards
- Cards support many-to-many relationships with labels and members
- Cards can contain checklists, checklist items, comments, and activity logs
- Positional ordering is stored in the database for drag-and-drop persistence

---

## Project Structure

```bash
app/
  api/
    board/
    boards/
    cards/
    checklists/
    checklist-items/
    lists/
  boards/[boardId]/
  layout.tsx
  page.tsx

components/
  board/
  card/
  list/
  ui/

lib/
  board.ts
  prisma.ts
  utils.ts

prisma/
  migrations/
  schema.prisma
  seed.ts

types/
  board.ts



  Setup Instructions
1. Clone the repository
Bash

git clone https://github.com/vibharajputt/trello-clone.git
cd trello-clone
2. Install dependencies
Bash

npm install
3. Configure environment variables
Create a .env file in the root directory and add:

env

DATABASE_URL="your_postgresql_connection_string"
4. Push schema to the database
Bash

npx prisma db push
5. Seed the database
Bash

npx prisma db seed
6. Start the development server
Bash

npm run dev
The application will be available at:

Bash

http://localhost:3000
Seeded Sample Data
The project includes sample seeded data for evaluation, including:

sample boards
sample lists
sample cards
sample labels
sample members
sample checklist items
sample comments
sample activity logs
Assumptions Made
No authentication/login system is implemented, as specified in the assignment
A default user is assumed to be logged in
Sample members are seeded in the database for assignment functionality
Card cover support is implemented using image URLs
File attachments were treated as an optional bonus feature and are not implemented
Drag-and-Drop Behavior
The application supports:

reordering lists within a board
reordering cards inside the same list
moving cards between different lists
Order is persisted using position fields in the database.

API Overview
The backend is implemented using Next.js API routes.

Main route groups
/api/board
/api/boards
/api/lists
/api/cards
/api/checklists
/api/checklist-items
These routes handle CRUD operations, reordering logic, comments, checklist management, and card updates.

Deployment
The application is deployed on Vercel and connected to a PostgreSQL database.

Production URL:
http://trello-clone-rust-one.vercel.app/

Notes for Evaluation
This project was implemented with focus on:

functional correctness
Trello-like user experience
clean schema design
maintainable code structure
reusable components
clear separation of concerns
Future Improvements
Potential future enhancements include:

file attachments on cards
authentication and user accounts
real-time collaboration
richer activity history
cloud-based media and file handling
