import { useState, type FormEvent } from "react";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function Kanban() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completionDate, setCompletionDate] = useState<Date | undefined>(
    undefined
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const createTask = useMutation(api.tasks.create);
  const tasks = useQuery(api.tasks.list);

  const backlogTasks = tasks?.filter((task) => task.status === "backlog") ?? [];
  const inProgressTasks =
    tasks?.filter((task) => task.status === "in-progress") ?? [];
  const doneTasks = tasks?.filter((task) => task.status === "done") ?? [];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createTask({
        title,
        description: description || undefined,
        status: "backlog",
        completionDate: completionDate ? completionDate.getTime() : undefined,
      });
      setTitle("");
      setDescription("");
      setCompletionDate(undefined);
      setIsPopoverOpen(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <AppLayout
      breadcrumbs={[{ label: "Work", href: "#" }, { label: "Kanban" }]}
      headerActions={
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIsPopoverOpen(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="size-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for your kanban board. Fill in the details
                  below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="completionDate">
                    Completion Date (Optional)
                  </Label>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="completionDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !completionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {completionDate ? (
                          format(completionDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 pointer-events-auto"
                      align="start"
                      side="top"
                      sideOffset={8}
                      avoidCollisions={false}
                    >
                      <Calendar
                        mode="single"
                        selected={completionDate}
                        onSelect={(date) => {
                          setCompletionDate(date);
                          setIsPopoverOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="flex gap-4 h-full">
        {/* Backlog Column */}
        <div className="flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-chart-1">Backlog</h2>
              <span className="text-xs text-chart-1 bg-chart-1/10 px-2 py-1 rounded-full">
                {backlogTasks.length}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {backlogTasks.map((task) => (
              <Card
                key={task._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold font-mono">
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
              </Card>
            ))}
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
                {inProgressTasks.length}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {inProgressTasks.map((task) => (
              <Card
                key={task._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base font-sans">{task.title}</CardTitle>
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
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col flex-1 bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-chart-4">Done</h2>
              <span className="text-xs text-chart-4 bg-chart-4/10 px-2 py-1 rounded-full">
                {doneTasks.length}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {doneTasks.map((task) => (
              <Card
                key={task._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base font-sans">{task.title}</CardTitle>
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
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
