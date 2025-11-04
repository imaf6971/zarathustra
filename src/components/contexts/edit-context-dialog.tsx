"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Pick<Doc<"contexts">, "_id" | "name"> | null;
}

export function EditContextDialog({
  open,
  onOpenChange,
  context,
}: EditContextDialogProps) {
  const updateContext = useMutation(api.contexts.update);
  const [contextName, setContextName] = useState(context?.name ?? "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!context || !contextName.trim()) return;
    try {
      await updateContext({
        contextId: context._id,
        name: contextName.trim(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating context:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Context</DialogTitle>
            <DialogDescription>
              Update the name of your context.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Context Name</Label>
              <Input
                id="edit-name"
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
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
