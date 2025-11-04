import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden transition-colors",
        isOver && "bg-muted/50 ring-2 ring-primary ring-offset-2"
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
      <div className="flex-1 space-y-2 overflow-y-auto p-4 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

function TaskCard({ task, onTaskClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task._id,
      data: {
        task,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only open dialog if not currently dragging
    // The activation constraint (distance: 8) means clicks without movement won't trigger drags
    if (!isDragging) {
      e.stopPropagation();
      onTaskClick(task);
    }
  };

  return (
    <Card
      {...attributes}
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "shadow-lg cursor-grabbing"
      )}
      onClick={handleClick}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <CardHeader>
          <CardTitle className="text-base font-mono">{task.title}</CardTitle>
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
}

function DraggableTaskOverlay({ task }: { task: Task }) {
  return (
    <Card className="shadow-2xl opacity-90">
      <CardHeader>
        <CardTitle className="text-base font-mono">{task.title}</CardTitle>
        {task.description && (
          <CardDescription>{task.description}</CardDescription>
        )}
        {task.completionDate && (
          <CardDescription className="text-xs mt-2">
            Due: {format(new Date(task.completionDate), "PPP")}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

export function Kanban() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(
    null
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
      // Update the task's status optimistically
      const updatedTasks = currentTasks.map((task) =>
        task._id === args.taskId ? { ...task, status: args.status } : task
      );

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const backlogTasks = tasks?.filter((task) => task.status === "backlog") ?? [];
  const inProgressTasks =
    tasks?.filter((task) => task.status === "in-progress") ?? [];
  const doneTasks = tasks?.filter((task) => task.status === "done") ?? [];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks?.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task as Task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Validate that the drop target is a valid column
    if (!["backlog", "in-progress", "done"].includes(newStatus)) {
      return;
    }

    // Check if the task is being moved to a different column
    const currentTask = tasks?.find((t) => t._id === taskId);
    if (!currentTask || currentTask.status === newStatus) {
      return;
    }

    try {
      await updateTaskStatus({
        taskId: taskId as any,
        status: newStatus,
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
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
        <DragOverlay>
          {activeTask ? <DraggableTaskOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
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
