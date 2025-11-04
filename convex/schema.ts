import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  contexts: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    icon: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("backlog"), v.literal("in-progress"), v.literal("done")),
    userId: v.id("users"),
    contextId: v.id("contexts"),
    createdAt: v.number(),
    completionDate: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_context", ["contextId"])
    .index("by_user_context", ["userId", "contextId"]),
  taskNotes: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"]),
  userPreferences: defineTable({
    userId: v.id("users"),
    selectedContextId: v.optional(v.id("contexts")),
  })
    .index("by_user", ["userId"]),
});

export default schema;
