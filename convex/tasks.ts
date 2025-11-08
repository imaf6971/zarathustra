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

    const status = args.status ?? "backlog";
    
    // Get the highest order for this status to place new task at the end
    const tasksInStatus = await ctx.db
      .query("tasks")
      .withIndex("by_user_context_status", (q) =>
        q.eq("userId", userId).eq("contextId", args.contextId).eq("status", status)
      )
      .collect();
    
    const maxOrder = tasksInStatus.length > 0
      ? Math.max(...tasksInStatus.map(t => t.order))
      : -1;

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status,
      userId,
      contextId: args.contextId,
      createdAt: Date.now(),
      completionDate: args.completionDate,
      order: maxOrder + 1,
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

      // Sort by order within each status
      return tasks.sort((a, b) => a.order - b.order);
    }

    // If no contextId provided, return all tasks for user
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return tasks.sort((a, b) => a.order - b.order);
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
    newIndex: v.number(),
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

    // Get all tasks in the destination status
    const tasksInDestStatus = await ctx.db
      .query("tasks")
      .withIndex("by_user_context_status", (q) =>
        q.eq("userId", userId).eq("contextId", task.contextId).eq("status", args.status)
      )
      .collect();

    // Sort by order
    const sortedTasks = tasksInDestStatus.sort((a, b) => a.order - b.order);

    // If moving to a different column, remove from old column first
    if (task.status !== args.status) {
      // Get tasks in source status
      const tasksInSourceStatus = await ctx.db
        .query("tasks")
        .withIndex("by_user_context_status", (q) =>
          q.eq("userId", userId).eq("contextId", task.contextId).eq("status", task.status)
        )
        .collect();

      // Reorder source column
      const sortedSourceTasks = tasksInSourceStatus
        .filter(t => t._id !== args.taskId)
        .sort((a, b) => a.order - b.order);

      for (let i = 0; i < sortedSourceTasks.length; i++) {
        if (sortedSourceTasks[i].order !== i) {
          await ctx.db.patch(sortedSourceTasks[i]._id, { order: i });
        }
      }
    }

    // Calculate new order and update destination column
    const updatedDestTasks = sortedTasks.filter(t => t._id !== args.taskId);
    updatedDestTasks.splice(args.newIndex, 0, { ...task, status: args.status });

    // Update orders for all tasks in destination column
    for (let i = 0; i < updatedDestTasks.length; i++) {
      const t = updatedDestTasks[i];
      if (t._id === args.taskId) {
        await ctx.db.patch(args.taskId, {
          status: args.status,
          order: i,
        });
      } else if (t.order !== i) {
        await ctx.db.patch(t._id, { order: i });
      }
    }

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
