import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
  }),
  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),
  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user", ["userId"]),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.string(),
    stripeConnectId: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),
  transactions: defineTable({
      eventId: v.id("events"),
      userId: v.string(),
      waitingListId: v.id("waitingList"),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      createdAt: v.number(),
      amount: v.number(),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
    })
      .index("by_event", ["eventId"])
      .index("by_user", ["userId"])
      .index("by_waiting_list", ["waitingListId"])
      .index("by_event_user", ["eventId", "userId"]) ,
    purchases: defineTable({
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
    })
      .index("by_event", ["eventId"])
      .index("by_user", ["userId"])
});