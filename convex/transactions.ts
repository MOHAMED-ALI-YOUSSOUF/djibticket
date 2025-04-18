import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

export const createPendingTransaction = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, userId, waitingListId, email, name, phone }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const waitingListEntry = await ctx.db.get(waitingListId);
    if (!waitingListEntry) throw new Error("Waiting list entry not found");
    if (waitingListEntry.status !== WAITING_LIST_STATUS.OFFERED) {
      throw new Error("Invalid or expired ticket offer");
    }
    if (waitingListEntry.userId !== userId) {
      throw new Error("Waiting list entry does not belong to this user");
    }

    const transactionId = await ctx.db.insert("transactions", {
      eventId,
      userId,
      waitingListId,
      status: "pending",
      createdAt: Date.now(),
      amount: event.price,
      email,
      name,
      phone,
    });

    await ctx.scheduler.runAfter(10 * 60 * 1000, internal.transactions.expirePendingTransaction, {
      transactionId,
    });

    return transactionId;
  },
});

export const approveTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, { transactionId }) => {
    const transaction = await ctx.db.get(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== "pending") throw new Error("Transaction is not pending");

    const event = await ctx.db.get(transaction.eventId);
    if (!event) throw new Error("Event not found");

    await ctx.db.insert("tickets", {
      eventId: transaction.eventId,
      userId: transaction.userId,
      purchasedAt: Date.now(),
      status: TICKET_STATUS.VALID,
      amount: transaction.amount,
    });

    await ctx.db.patch(transaction.waitingListId, {
      status: WAITING_LIST_STATUS.PURCHASED,
    });

    await ctx.db.patch(transactionId, {
      status: "approved",
    });

    await ctx.runMutation(internal.waitingList.processQueue, {
      eventId: transaction.eventId,
    });

    console.log(`Transaction ${transactionId} approved for event ${event.name}`);
  },
});

export const rejectTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, { transactionId }) => {
    const transaction = await ctx.db.get(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== "pending") throw new Error("Transaction is not pending");

    const event = await ctx.db.get(transaction.eventId);
    if (!event) throw new Error("Event not found");

    await ctx.db.patch(transaction.waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    await ctx.db.patch(transactionId, {
      status: "rejected",
    });

    await ctx.runMutation(internal.waitingList.processQueue, {
      eventId: transaction.eventId,
    });

    console.log(`Transaction ${transactionId} rejected for event ${event.name}`);
  },
});

export const getPendingTransactionsForEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const expirePendingTransaction = internalMutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, { transactionId }) => {
    const transaction = await ctx.db.get(transactionId);
    if (!transaction || transaction.status !== "pending") return;

    const event = await ctx.db.get(transaction.eventId);
    if (!event) return;

    await ctx.db.patch(transactionId, {
      status: "rejected",
    });

    await ctx.db.patch(transaction.waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    await ctx.runMutation(internal.waitingList.processQueue, {
      eventId: transaction.eventId,
    });

    console.log(`Transaction ${transactionId} expired for event ${event.name}`);
  },
});


