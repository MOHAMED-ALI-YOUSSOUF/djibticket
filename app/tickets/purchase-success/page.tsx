"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Ticket from "@/components/Ticket";

export default function PurchaseSuccess() {
  const { user } = useUser();
  const tickets = useQuery(api.events.getUserTickets, {
    userId: user?.id ?? "",
  });

  if (!user) {
    redirect("/");
  }

  if (!tickets) {
    return <div>Chargement...</div>;
  }

  const dernierBillet = tickets[tickets.length - 1];

  if (!dernierBillet) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
          🎉 Achat de Billet Réussi !
          </h1>
          <p className="mt-2 text-gray-600">
            Votre billet a été confirmé avec succès. vous pouvez le trouver dans votre compte
          </p>
        </div>

        <Ticket ticketId={dernierBillet._id} />
      </div>
    </div>
  );
}
