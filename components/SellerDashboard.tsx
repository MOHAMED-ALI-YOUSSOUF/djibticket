
"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { CalendarDays, Plus, Check, X } from "lucide-react";
import Link from "next/link";
import Spinner from "./Spinner";
import { useState } from "react";
import { toast } from "sonner";

export default function SellerDashboard() {
  const { user } = useUser();
  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const pendingTransactions = useQuery(
    api.transactions.getPendingTransactionsForEvent,
    selectedEventId ? { eventId: selectedEventId as any } : "skip"
  );
  const approveTransaction = useMutation(api.transactions.approveTransaction);
  const rejectTransaction = useMutation(api.transactions.rejectTransaction);

  if (!events) {
    return <Spinner />;
  }

  const handleApprove = async (transaction: any, event: any) => {
    try {
      await approveTransaction({ transactionId: transaction._id });
  
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: transaction.email,
          subject: `Billet confirmé pour ${event.name}`,
          html: `
            <h2>Achat de billet confirmé</h2>
            <p>Votre billet pour <strong>${event.name}</strong> a été confirmé !</p>
            <p><strong>Date de l'événement :</strong> ${new Date(event.eventDate).toLocaleString()}</p>
            <p><strong>Lieu :</strong> ${event.location}</p>
            <p>Vous pouvez consulter votre billet dans votre compte.</p>
            <p><a href="https://rohaty.com/tickets">Voir mes billets</a></p>
          `,
        }),
      });
      
  
      toast.success("✅ Transaction approuvée", {
        description: "Le ticket a été délivré à l'acheteur.",
      });
    } catch (error) {
      toast.error("❌ Erreur", {
        description: "Échec de l'approbation de la transaction.",
      });
    }
  };
  
  const handleReject = async (transaction: any, event: any) => {
    try {
      await rejectTransaction({ transactionId: transaction._id });
  
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: transaction.email,
          subject: `Réservation annulée pour ${event.name}`,
          html: `
            <h2>Réservation de billet annulée</h2>
            <p>Votre réservation pour <strong>${event.name}</strong> a été annulée.</p>
            <p>Le paiement n'a pas été approuvé par le vendeur. Si vous avez des questions, veuillez contacter le support.</p>
            <p><a href="https://rohaty.com/support">Contacter le support</a></p>
          `,
        }),
      });
      
  
      toast("🚫 Transaction rejetée", {
        description: "La transaction a été annulée.",
      });
    } catch (error) {
      toast.error("❌ Erreur", {
        description: "Échec du rejet de la transaction.",
      });
    }
  };
  

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
        <h2 className="text-2xl font-bold">Tableau de bord vendeur</h2>
        <p className="text-blue-100 mt-2">
          Gérez vos événements et approuvez les transactions
        </p>
        </div>

        <div className="p-6">
          <div className="flex justify-center gap-4 mb-8">
            <Link
              href="/seller/new-event"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un événement
            </Link>
            <Link
              href="/seller/events"
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <CalendarDays className="w-5 h-5" />
              Voir mes événements
            </Link>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Approuver les transactions</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionnez un événement
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setSelectedEventId(e.target.value)}
                value={selectedEventId || ""}
              >
                <option value="">Choisissez un événement</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEventId && pendingTransactions && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">
                Transactions en attente
                </h4>
                {pendingTransactions.length === 0 ? (
                  <p className="text-gray-500">Aucune transaction en attente</p>
                ) : (
                  <div className="space-y-4">
                    {pendingTransactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex justify-between items-center bg-white p-4 rounded-lg border"
                      >
                        <div>
                        <p className="text-sm font-medium text-gray-700">Nom : {transaction.name}</p>
                          <p className="text-sm font-medium text-gray-700">Email : {transaction.email}</p>
                          <p className="text-sm font-medium text-gray-700">Téléphone : {transaction.phone}</p>
                          <p className="font-medium">ID acheteur : {transaction.userId}</p>
                          <p className="text-sm text-gray-500">Montant : £{transaction.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Créé : {new Date(transaction.createdAt).toLocaleString()}</p>

                        </div>
                        <div className="flex gap-2">
                          <button
                              onClick={() => handleApprove(transaction, events.find(e => e._id === selectedEventId))}
      
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleReject(transaction, events.find(e => e._id === selectedEventId))}
       
                            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}