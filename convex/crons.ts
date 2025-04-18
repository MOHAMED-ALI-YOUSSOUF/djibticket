import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup-expired-offers",
  { minutes: 1 },
  internal.waitingList.cleanupExpiredOffers
);

crons.interval(
  "cleanup-expired-transactions",
  { hours: 1 },
  internal.transactions.expirePendingTransaction
);

// crons.interval(
//   "cleanup-expired-transactions",
//   { hours: 1 },
//   internal.actions.expireTransactions
// );

export default crons;