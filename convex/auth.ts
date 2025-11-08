import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

export const me = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }

    if (!args.name.trim()) {
      throw new ConvexError("Name cannot be empty");
    }

    await ctx.db.patch(userId, {
      name: args.name.trim(),
    });

    return { success: true };
  },
});
