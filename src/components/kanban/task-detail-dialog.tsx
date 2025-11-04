"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Calendar as CalendarIcon, Edit2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { NotesSection } from "./notes";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: "backlog" | "in-progress" | "done";
  completionDate?: number;
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
}: TaskDetailDialogProps) {
  const notes = useQuery(
    api.notes.listByTask,
    task?._id ? { taskId: task._id } : "skip"
  );

  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false);

  const handleEditTaskClick = () => {
    setShowEditTaskDialog(true);
  };

  const handleDeleteTaskClick = () => {
    setShowDeleteTaskDialog(true);
  };

  const handleTaskDeleted = () => {
    onOpenChange(false);
  };

  if (!task) {
    return null;
  }

  const statusLabels = {
    backlog: "Backlog",
    "in-progress": "In Progress",
    done: "Done",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setShowDeleteTaskDialog(false);
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{task.title}</DialogTitle>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-transparent group"
                onClick={handleEditTaskClick}
              >
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-transparent group"
                onClick={handleDeleteTaskClick}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
              </Button>
            </div>
          </div>
          <DialogDescription>
            {task.description || "No description"}
          </DialogDescription>
        </DialogHeader>

        {/* Task Info Section */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className="font-medium">{statusLabels[task.status]}</span>
            </div>
            {task.completionDate && (
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Due: </span>
                <span className="font-medium">
                  {format(new Date(task.completionDate), "PPP")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section - Main Focus */}
        <NotesSection taskId={task._id} notes={notes} />
      </DialogContent>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={showEditTaskDialog}
        onOpenChange={setShowEditTaskDialog}
        task={task}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        open={showDeleteTaskDialog}
        onOpenChange={setShowDeleteTaskDialog}
        task={task}
        onDeleted={handleTaskDeleted}
      />
    </Dialog>
  );
}
