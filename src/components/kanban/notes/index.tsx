"use client";

import { FileText } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { NotesList } from "./notes-list";
import { AddNoteForm } from "./add-note-form";

interface Note {
  _id: Id<"taskNotes">;
  content: string;
  createdAt: number;
}

interface NotesSectionProps {
  taskId: Id<"tasks">;
  notes: Note[] | undefined;
}

export function NotesSection({ taskId, notes }: NotesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        <h3 className="text-base font-semibold">Notes</h3>
        {notes && notes.length > 0 && (
          <span className="text-sm text-muted-foreground">
            ({notes.length})
          </span>
        )}
      </div>

      <NotesList notes={notes} />
      <AddNoteForm taskId={taskId} />
    </div>
  );
}

