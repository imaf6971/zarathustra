import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    // Check if context with same name already exists for user
    const existing = await ctx.db
      .query("contexts")
      .withIndex("by_user_name", (q) =>
        q.eq("userId", userId).eq("name", args.name)
      )
      .first();

    if (existing) {
      throw new ConvexError("Context with this name already exists");
    }

    const contextId = await ctx.db.insert("contexts", {
      name: args.name,
      userId,
      createdAt: Date.now(),
      icon: args.icon,
    });

    return contextId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const contexts = await ctx.db
      .query("contexts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return contexts;
  },
});

export const update = mutation({
  args: {
    contextId: v.id("contexts"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    const context = await ctx.db.get(args.contextId);
    if (!context) {
      throw new ConvexError("Context not found");
    }

    if (context.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    const updateData: { name?: string; icon?: string } = {};
    if (args.name !== undefined) {
      updateData.name = args.name;
    }
    if (args.icon !== undefined) {
      updateData.icon = args.icon;
    }

    await ctx.db.patch(args.contextId, updateData);

    return args.contextId;
  },
});

export const remove = mutation({
  args: {
    contextId: v.id("contexts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You don't have permission to delete this context.");
    }

    const context = await ctx.db.get(args.contextId);
    if (!context) {
      throw new ConvexError(
        "This context could not be found. It may have already been deleted."
      );
    }

    if (context.userId !== userId) {
      throw new ConvexError("You don't have permission to delete this context.");
    }

    // Check if there are tasks using this context
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_context", (q) => q.eq("contextId", args.contextId))
      .first();

    if (tasks) {
      throw new ConvexError(
        "This context contains tasks. Please move or delete all tasks before deleting the context."
      );
    }

    // Check if this was the selected context and auto-switch if needed
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const wasSelected = preferences?.selectedContextId === args.contextId;

    // Delete the context
    await ctx.db.delete(args.contextId);

    // If this was the selected context, switch to another one
    if (wasSelected) {
      const remainingContexts = await ctx.db
        .query("contexts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();

      const newSelectedContextId =
        remainingContexts.length > 0 ? remainingContexts[0]._id : undefined;

      if (preferences) {
        await ctx.db.patch(preferences._id, {
          selectedContextId: newSelectedContextId,
        });
      } else if (newSelectedContextId) {
        // Create preferences if they don't exist and there's a context to select
        await ctx.db.insert("userPreferences", {
          userId,
          selectedContextId: newSelectedContextId,
        });
      }
    }

    return args.contextId;
  },
});

export const getActiveContext = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    // Get all contexts for the user
    const contexts = await ctx.db
      .query("contexts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (contexts.length === 0) {
      return null;
    }

    // Get selected context preference
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const selectedContextId = preferences?.selectedContextId;

    // If there's a selected context and it exists, return it
    if (selectedContextId) {
      const selectedContext = contexts.find((c) => c._id === selectedContextId);
      if (selectedContext) {
        return selectedContext;
      }
    }

    // Otherwise, return the first context as fallback
    return contexts[0];
  },
});

export const setSelectedContext = mutation({
  args: {
    contextId: v.optional(v.id("contexts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    // If contextId is provided, verify it belongs to the user
    if (args.contextId !== undefined && args.contextId !== null) {
      const context = await ctx.db.get(args.contextId);
      if (!context) {
        throw new ConvexError("Context not found");
      }
      if (context.userId !== userId) {
        throw new ConvexError("Unauthorized");
      }
    }

    // Get or create user preferences
    let preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();



    if (preferences) {
      // Update existing preferences
      await ctx.db.patch(preferences._id, {
        selectedContextId: args.contextId,
      });
    } else {
      // Create new preferences
      await ctx.db.insert("userPreferences", {
        userId,
        selectedContextId: args.contextId,
      });
    }

    return args.contextId ?? null;
  },
});


