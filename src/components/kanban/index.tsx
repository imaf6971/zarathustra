import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";

type TaskStatus = "backlog" | "in-progress" | "done";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  completionDate?: number;
  order: number;
}

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  badgeColor: string;
  onTaskClick: (task: Task) => void;
}

function KanbanColumn({
  id,
  title,
  tasks,
  badgeColor,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden transition-colors"
      )}
    >
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className={cn("text-sm font-semibold", badgeColor)}>{title}</h2>
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full",
              badgeColor.includes("chart-1")
                ? "bg-chart-1/10 text-chart-1"
                : badgeColor.includes("chart-3")
                  ? "bg-chart-3/10 text-chart-3"
                  : "bg-chart-4/10 text-chart-4"
            )}
          >
            {tasks.length}
          </span>
        </div>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[calc(100dvh-113px)] relative",
              snapshot.isDraggingOver && "bg-muted/50"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onTaskClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground text-sm">
                  Drop tasks here
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskClick: (task: Task) => void;
}

function TaskCard({ task, index, onTaskClick }: TaskCardProps) {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => {
        const handleClick = (e: React.MouseEvent) => {
          // Only open dialog if not currently dragging
          if (!snapshot.isDragging) {
            e.stopPropagation();
            onTaskClick(task);
          }
        };

        return (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.5 : 1,
            }}
            className={cn(
              "mb-2 cursor-pointer hover:shadow-md transition-shadow",
              snapshot.isDragging && "shadow-lg cursor-grabbing"
            )}
            onClick={handleClick}
          >
            <div
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing"
            >
              <CardHeader>
                <CardTitle className="text-base font-mono">
                  {task.title}
                </CardTitle>
                {task.description && (
                  <CardDescription>{task.description}</CardDescription>
                )}
                {task.completionDate && (
                  <CardDescription className="text-xs mt-2">
                    Due: {format(new Date(task.completionDate), "PPP")}
                  </CardDescription>
                )}
              </CardHeader>
            </div>
          </Card>
        );
      }}
    </Draggable>
  );
}

export function Kanban() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(
    null
  );

  const isTaskDetailOpen = selectedTaskId !== null;

  const activeContext = useQuery(api.contexts.getActiveContext);
  const updateTaskStatus = useMutation(
    api.tasks.updateStatus
  ).withOptimisticUpdate((localStore, args) => {
    // Get the active context from the store
    const currentContext = localStore.getQuery(api.contexts.getActiveContext);
    if (!currentContext?._id) return;

    // Get current tasks list
    const currentTasks = localStore.getQuery(api.tasks.list, {
      contextId: currentContext._id,
    });

    if (currentTasks !== undefined) {
      const taskToMove = currentTasks.find((t) => t._id === args.taskId);
      if (!taskToMove) return;

      // Separate tasks by status (excluding the task being moved)
      const tasksByStatus: Record<string, typeof currentTasks> = {
        backlog: currentTasks.filter(
          (t) => t.status === "backlog" && t._id !== args.taskId
        ),
        "in-progress": currentTasks.filter(
          (t) => t.status === "in-progress" && t._id !== args.taskId
        ),
        done: currentTasks.filter(
          (t) => t.status === "done" && t._id !== args.taskId
        ),
      };

      // Insert the moved task at the new position in the destination status
      const destTasks = [...(tasksByStatus[args.status] || [])];
      const movedTask = {
        ...taskToMove,
        status: args.status,
        order: args.newIndex,
      };
      destTasks.splice(args.newIndex, 0, movedTask);

      // Reassign order to all tasks in the destination column
      const updatedDestTasks = destTasks.map((task, idx) => ({
        ...task,
        order: idx,
      }));

      // Update order for tasks in the source column if different from destination
      let updatedSourceTasks: typeof currentTasks = [];
      if (taskToMove.status !== args.status) {
        const sourceTasks = tasksByStatus[taskToMove.status] || [];
        updatedSourceTasks = sourceTasks.map((task, idx) => ({
          ...task,
          order: idx,
        }));
        tasksByStatus[taskToMove.status] = updatedSourceTasks;
      }

      // Replace destination tasks with updated ones
      tasksByStatus[args.status] = updatedDestTasks;

      // Combine all tasks
      const updatedTasks = [
        ...tasksByStatus.backlog,
        ...tasksByStatus["in-progress"],
        ...tasksByStatus.done,
      ];

      // Update the query with the optimistic data
      localStore.setQuery(
        api.tasks.list,
        { contextId: currentContext._id },
        updatedTasks
      );
    }
  });
  const tasks = useQuery(
    api.tasks.list,
    activeContext?._id ? { contextId: activeContext._id } : "skip"
  );

  const backlogTasks = tasks?.filter((task) => task.status === "backlog") ?? [];
  const inProgressTasks =
    tasks?.filter((task) => task.status === "in-progress") ?? [];
  const doneTasks = tasks?.filter((task) => task.status === "done") ?? [];

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const taskId = draggableId;
    const newStatus = destination.droppableId as TaskStatus;
    const sourceStatus = source.droppableId as TaskStatus;

    // Validate that the drop target is a valid column
    if (!["backlog", "in-progress", "done"].includes(newStatus)) {
      return;
    }

    // Check if anything actually changed
    const currentTask = tasks?.find((t) => t._id === taskId);
    if (!currentTask) {
      return;
    }

    // If same column and same position, do nothing
    if (sourceStatus === newStatus && source.index === destination.index) {
      return;
    }

    try {
      await updateTaskStatus({
        taskId: taskId as any,
        status: newStatus,
        newIndex: destination.index,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task._id);
  };

  if (!activeContext) {
    return (
      <AppLayout
        breadcrumbs={[{ label: "Work", href: "#" }, { label: "Kanban" }]}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No Context Selected</h2>
            <p className="text-muted-foreground">
              Please select a context from the sidebar to view tasks.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const breadcrumbs = activeContext
    ? [{ label: activeContext.name, href: "#" }, { label: "Kanban" }]
    : [{ label: "Work", href: "#" }, { label: "Kanban" }];

  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      headerActions={
        <>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="size-4" />
            Add Task
          </Button>
          <CreateTaskDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            contextId={activeContext?._id}
          />
        </>
      }
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full">
          <KanbanColumn
            id="backlog"
            title="Backlog"
            tasks={backlogTasks}
            badgeColor="text-chart-1"
            onTaskClick={handleTaskClick}
          />
          <KanbanColumn
            id="in-progress"
            title="In Progress"
            tasks={inProgressTasks}
            badgeColor="text-chart-3"
            onTaskClick={handleTaskClick}
          />
          <KanbanColumn
            id="done"
            title="Done"
            tasks={doneTasks}
            badgeColor="text-chart-4"
            onTaskClick={handleTaskClick}
          />
        </div>
      </DragDropContext>
      <TaskDetailDialog
        open={isTaskDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskId(null);
          }
        }}
        task={
          selectedTaskId
            ? (tasks?.find((t) => t._id === selectedTaskId) ?? null)
            : null
        }
      />
    </AppLayout>
  );
}
