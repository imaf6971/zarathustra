"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddNoteFormProps {
  taskId: Id<"tasks">;
}

export function AddNoteForm({ taskId }: AddNoteFormProps) {
  const createNote = useMutation(api.notes.create);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNote.trim()) {
      return;
    }

    setIsAddingNote(true);
    try {
      await createNote({
        taskId,
        content: newNote.trim(),
      });
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="newNote">Add a note</Label>
      <Textarea
        id="newNote"
        placeholder="Write a note..."
        rows={4}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!newNote.trim() || isAddingNote}
        >
          {isAddingNote ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </form>
  );
}

