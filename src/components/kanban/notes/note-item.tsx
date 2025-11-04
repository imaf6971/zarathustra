"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Note {
  _id: Id<"taskNotes">;
  content: string;
  createdAt: number;
}

interface NoteItemProps {
  note: Note;
  onDelete: (noteId: Id<"taskNotes">) => void;
}

export function NoteItem({ note, onDelete }: NoteItemProps) {
  const updateNote = useMutation(api.notes.update);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(note.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = () => {
    setEditingContent(note.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim()) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateNote({
        noteId: note._id,
        content: editingContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="p-4 space-y-2 bg-muted/30">
        <div className="space-y-2">
          <Textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={4}
            className="resize-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editingContent.trim() || isUpdating}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-2 bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm flex-1 whitespace-pre-wrap leading-relaxed">
          {note.content}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={handleStartEdit}
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent group"
            onClick={() => onDelete(note._id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {format(new Date(note.createdAt), "PPp")}
      </p>
    </Card>
  );
}

