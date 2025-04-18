import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("validated"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    proofUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("purchases", args);
  },
});

export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("purchases")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    purchaseId: v.id("purchases"),
    status: v.union(
      v.literal("pending"),
      v.literal("validated"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, { status: args.status });
  },
});