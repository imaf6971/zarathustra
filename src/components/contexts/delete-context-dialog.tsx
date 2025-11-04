"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface DeleteContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: Pick<Doc<"contexts">, "_id" | "name"> | null;
  onSuccess?: () => void;
}

function extractErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unable to delete context. Please try again.";
  }

  const message = error.message;

  // Extract the message after "ConvexError: " if present
  const convexErrorMatch = message.match(/ConvexError:\s*(.+?)(?:\s+at\s|$)/);
  if (convexErrorMatch) {
    return convexErrorMatch[1].trim();
  }

  // Fallback to the full message if no ConvexError pattern found
  return message;
}

export function DeleteContextDialog({
  open,
  onOpenChange,
  context,
  onSuccess,
}: DeleteContextDialogProps) {
  const removeContext = useMutation(api.contexts.remove);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!context) return;
    setError(null);
    try {
      await removeContext({ contextId: context._id });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting context:", error);
      setError(extractErrorMessage(error));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Context</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{context?.name}"? This action
            cannot be undone. If there are tasks in this context, you'll need to
            move or delete them first.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
