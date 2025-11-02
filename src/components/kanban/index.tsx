import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Kanban() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Work", href: "#" },
        { label: "Kanban" },
      ]}
      headerActions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="size-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for your kanban board. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      }
    >
      <div className="flex gap-4 h-full">
        {/* Backlog Column */}
        <div className="flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-chart-1">
                Backlog
              </h2>
              <span className="text-xs text-chart-1 bg-chart-1/10 px-2 py-1 rounded-full">
                0
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {/* Cards will go here */}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-chart-3">
                In Progress
              </h2>
              <span className="text-xs text-chart-3 bg-chart-3/10 px-2 py-1 rounded-full">
                0
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {/* Cards will go here */}
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-chart-4">
                Done
              </h2>
              <span className="text-xs text-chart-4 bg-chart-4/10 px-2 py-1 rounded-full">
                0
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {/* Cards will go here */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

