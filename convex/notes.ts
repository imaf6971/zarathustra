import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    // Verify task exists and belongs to user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }
    if (task.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    const noteId = await ctx.db.insert("taskNotes", {
      taskId: args.taskId,
      userId,
      content: args.content,
      createdAt: Date.now(),
    });

    return noteId;
  },
});

export const listByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    // Verify task exists and belongs to user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }
    if (task.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    const notes = await ctx.db
      .query("taskNotes")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    // Sort by creation time (oldest first)
    return notes.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const update = mutation({
  args: {
    noteId: v.id("taskNotes"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new ConvexError("Note not found");
    }

    // Verify note belongs to user
    if (note.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      content: args.content,
    });

    return args.noteId;
  },
});

export const remove = mutation({
  args: {
    noteId: v.id("taskNotes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new ConvexError("Note not found");
    }

    // Verify note belongs to user
    if (note.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(args.noteId);
    return args.noteId;
  },
});

