"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (contextId: Id<"contexts">) => void;
  trigger?: ReactNode;
}

export function CreateContextDialog({
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: CreateContextDialogProps) {
  const createContext = useMutation(api.contexts.create);
  const [contextName, setContextName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contextName.trim()) return;
    try {
      const contextId = await createContext({ name: contextName.trim() });
      setContextName("");
      onOpenChange(false);
      onSuccess?.(contextId);
    } catch (error) {
      console.error("Error creating context:", error);
    }
  };

  const handleCancel = () => {
    setContextName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Context</DialogTitle>
            <DialogDescription>
              Create a context to organize your tasks (e.g., Work, Personal,
              Study).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Context Name</Label>
              <Input
                id="name"
                placeholder="e.g., Work, Personal, Study"
                value={contextName}
                onChange={(e) => setContextName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
