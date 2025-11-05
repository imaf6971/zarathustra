import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("backlog"), v.literal("in-progress"), v.literal("done"))),
    completionDate: v.optional(v.number()),
    contextId: v.id("contexts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    // Verify context belongs to user
    const context = await ctx.db.get(args.contextId);
    if (!context) {
      throw new ConvexError("Context not found");
    }
    if (context.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status ?? "backlog",
      userId,
      contextId: args.contextId,
      createdAt: Date.now(),
      completionDate: args.completionDate,
    });

    return taskId;
  },
});

export const list = query({
  args: {
    contextId: v.optional(v.id("contexts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    if (args.contextId) {
      // Verify context belongs to user
      const context = await ctx.db.get(args.contextId);
      if (!context) {
        throw new ConvexError("Context not found");
      }
      if (context.userId !== userId) {
        throw new ConvexError("Unauthorized");
      }

      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_user_context", (q) =>
          q.eq("userId", userId).eq("contextId", args.contextId!)
        )
        .collect();

      return tasks;
    }

    // If no contextId provided, return all tasks for user
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return tasks;
  },
});

export const listByStatus = query({
  args: {
    status: v.union(v.literal("backlog"), v.literal("in-progress"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return tasks;
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("backlog"), v.literal("in-progress"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
    });

    return args.taskId;
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completionDate: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    const updateData = await ctx.db.get(args.taskId);
    if (!updateData) {
      throw new ConvexError("Task not found while updating");
    }

    updateData.title = args.title ?? updateData.title;
    updateData.description = args.description ?? updateData.description;
    updateData.completionDate = args.completionDate ?? undefined;

    await ctx.db.patch(args.taskId, updateData);

    return args.taskId;
  },
});

export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    // Delete all notes associated with this task
    const notes = await ctx.db
      .query("taskNotes")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    for (const note of notes) {
      await ctx.db.delete(note._id);
    }

    // Delete the task
    await ctx.db.delete(args.taskId);
    return args.taskId;
  },
});
