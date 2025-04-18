"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import TicketCard from "@/components/TicketCard";
import { Ticket } from "lucide-react";

export default function MyTickets() {
  const { user } = useUser();
  const tickets = useQuery(api.events.getUserTickets, {
    userId: user?.id ?? "",
  });

  if (!tickets) return null;

  const billetsValides = tickets.filter((t) => t.status === "valid");
  const autresBillets = tickets.filter((t) => t.status !== "valid");

  const billetsÀVenir = billetsValides.filter(
    (t) => t.event && t.event.eventDate > Date.now()
  );
  const billetsPassés = billetsValides.filter(
    (t) => t.event && t.event.eventDate <= Date.now()
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Billets</h1>
            <p className="mt-2 text-gray-600">
              Gérez et visualisez tous vos billets en un seul endroit
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Ticket className="w-5 h-5" />
              <span className="font-medium">
                {tickets.length} Billets 
              </span>
            </div>
          </div>
        </div>

        {billetsÀVenir.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Événements à Venir
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {billetsÀVenir.map((ticket) => (
                <TicketCard key={ticket._id} ticketId={ticket._id} />
              ))}
            </div>
          </div>
        )}

        {billetsPassés.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Événements Passés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {billetsPassés.map((ticket) => (
                <TicketCard key={ticket._id} ticketId={ticket._id} />
              ))}
            </div>
          </div>
        )}

        {autresBillets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Autres Billets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {autresBillets.map((ticket) => (
                <TicketCard key={ticket._id} ticketId={ticket._id} />
              ))}
            </div>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Aucun billet pour l&apos;instant
            </h3>
            <p className="text-gray-600 mt-1">
              Lorsque vous achetez des billets, ils apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
