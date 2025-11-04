"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { NoteItem } from "./note-item";
import { DeleteNoteDialog } from "./delete-note-dialog";

interface Note {
  _id: Id<"taskNotes">;
  content: string;
  createdAt: number;
}

interface NotesListProps {
  notes: Note[] | undefined;
  onNoteDeleted?: () => void;
}

export function NotesList({ notes, onNoteDeleted }: NotesListProps) {
  const [noteToDelete, setNoteToDelete] = useState<Id<"taskNotes"> | null>(
    null
  );

  const handleDeleteClick = (noteId: Id<"taskNotes">) => {
    setNoteToDelete(noteId);
  };

  const handleDeleteConfirmed = () => {
    setNoteToDelete(null);
    onNoteDeleted?.();
  };

  return (
    <>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {notes?.map((note) => (
          <NoteItem
            key={note._id}
            note={note}
            onDelete={handleDeleteClick}
          />
        ))}
        {notes?.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No notes yet. Add your first note below!
            </p>
          </div>
        )}
      </div>

      <DeleteNoteDialog
        noteId={noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onDeleted={handleDeleteConfirmed}
      />
    </>
  );
}

