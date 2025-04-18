"use node"
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { WAITING_LIST_STATUS } from "../constants";

export const expirerTransactions = action({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.runQuery(
      internal.transactions.getPendingTransactionsForEvent,
      { eventId: "" as any } // Hack pour récupérer toutes les transactions en attente
    );

    const now = Date.now();
    for (const transaction of transactions) {
      if (transaction.createdAt + 10 * 60 * 1000 < now) {
        const event = await ctx.runQuery(internal.events.getById, {
          eventId: transaction.eventId,
        });
        if (!event) continue;

        await ctx.runMutation(internal.transactions.expirePendingTransaction, {
          transactionId: transaction._id,
        });

        await fetch("http://localhost:3000/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: transaction.email,
            subject: `Réservation de billet expirée pour ${event.name}`,
            html: `
              <h2>Réservation de billet expirée</h2>
              <p>Votre réservation de billet pour <strong>${event.name}</strong> a expiré.</p>
              <p>Le paiement n'a pas été effectué dans les 10 minutes. Veuillez rejoindre à nouveau la liste d'attente si vous êtes toujours intéressé(e).</p>
              <p><a href="https://your-app-url.com/events/${event._id}">Voir l'événement</a></p>
            `,
          }),
        });
      }
    }

    return { success: true };
  },
});
