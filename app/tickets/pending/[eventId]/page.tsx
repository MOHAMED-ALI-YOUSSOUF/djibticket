"use client";

import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { Banknote, Clock } from "lucide-react";

export default function PendingTicketPage() {
  const params = useParams();
  const eventId = params.eventId as Id<"events">;
  const event = useQuery(api.events.getById, { eventId });

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Complete Your Payment for {event.name}
          </h1>
          <p className="text-gray-600 mb-6">
            Please make a manual payment to secure your ticket. Your ticket is reserved and pending approval.
          </p>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Payment Instructions
            </h2>
            <ul className="text-blue-700 space-y-4">
              <li className="flex items-start gap-2">
                <Banknote className="w-5 h-5 mt-1" />
                <span>
                  Transfer <strong>£{event.price.toFixed(2)}</strong> via Waafi or D-Money.dj to the following account:
                  <br />
                  <strong>Account Name:</strong> Djib-Ticket Events
                  <br />
                  <strong>Account Number:</strong> +253-77-123456
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 mt-1" />
                <span>
                  Include the event name &quot;<strong>{event.name}</strong>&quot; in the payment reference.
                </span>
              </li>
              <li>
                Once the payment is received, the seller will approve your transaction, and your ticket will be confirmed.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-amber-700">
              Your ticket is reserved for 48 hours. Please complete the payment within this time to avoid cancellation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}