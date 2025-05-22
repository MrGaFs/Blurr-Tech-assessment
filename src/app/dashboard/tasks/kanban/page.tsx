import { Metadata } from "next";
import { getTasks } from "@/lib/actions/task-actions";
import { KanbanBoard } from "@/components/tasks/kanban-board";

export const metadata: Metadata = {
  title: "Kanban Board | Blurr HR Portal",
  description: "Manage tasks in a Kanban board view",
};

export default async function KanbanBoardPage() {
  const { tasks } = await getTasks();
  
  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
      </div>
      
      <KanbanBoard initialTasks={tasks} />
    </div>
  );
} 