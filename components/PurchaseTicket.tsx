"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import ReleaseTicket from "./ReleaseTicket";
import { Banknote, Ticket } from "lucide-react";


export default function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {

  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });
  const createPendingTransaction = useMutation(api.transactions.createPendingTransaction);
  const event = useQuery(api.events.getById, { eventId });
  const seller = useQuery(api.users.getUserById, { userId: event?.userId ?? "" });

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expiré");
        return;
      }

      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (minutes > 0) {
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} seconde${seconds === 1 ? "" : "s"}`
        );
      } else {
        setTimeRemaining(`${seconds} seconde${seconds === 1 ? "" : "s"}`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

 
  
  
  const handlePurchase = async () => {
    if (!user || !queuePosition?._id || !event || !seller?.email) {
      console.error("Données manquantes", { user, queuePosition, event, seller });
      return;
    }

    try {
      setIsLoading(true);
      const transactionId = await createPendingTransaction({
        eventId,
        userId: user.id,
        waitingListId: queuePosition._id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName ?? "Inconnu",
        phone: user.phoneNumbers[0]?.phoneNumber ?? "",
      });

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: seller.email,
          subject: `Nouvelle transaction en attente pour ${event.name}`,
          html: `
            <h2>Nouvelle réservation de billet</h2>
            <p>Un acheteur a réservé un billet pour votre événement : <strong>${event.name}</strong>.</p>
            <p><strong>Acheteur :</strong> ${user.fullName ?? "Inconnu"} (${user.emailAddresses[0].emailAddress})</p>
            <p><strong>Montant :</strong> ${event.price.toFixed(2)} FDJ</p>
            <p>Merci de vérifier le paiement via Waafi ou D-Money.dj et d’approuver ou rejeter la transaction dans votre tableau de bord vendeur.</p>
            <p><a href="https://rohaty.com/">Accéder au tableau de bord</a></p>
          `,
        }),
      });

      setShowPaymentInstructions(true);
    } catch (error) {
      console.error("Erreur lors de la transaction :", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !queuePosition || queuePosition.status !== "offered" || !event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Ticket className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Billet réservé</h2>
        </div>

        <div className="text-lg font-semibold text-gray-700 mb-2">
          {event.name} – Expire dans {timeRemaining}
        </div>

        <div className="text-sm text-gray-600 leading-relaxed mb-6">
          Un billet a été réservé pour toi. Clique ci-dessous pour procéder au paiement.
        </div>

        {showPaymentInstructions && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Instructions de paiement
            </h3>
            <ul className="text-blue-700 space-y-4">
              <li className="flex items-start gap-2">
                <Banknote className="w-5 h-5 mt-1" />
                <span>
                  Transfère <strong>{event.price.toFixed(2)} FDJ</strong> via Waafi ou D-Money.dj à :
                  <br />
                  <strong>Nom du compte :</strong> Djib-Ticket Events
                  <br />
                  <strong>Numéro du compte :</strong> +253-77-123456
                </span>
              </li>
              <li>
                Une fois le paiement reçu, le vendeur validera ta transaction et ton billet sera confirmé.
              </li>
            </ul>
            <div className="bg-amber-50 p-4 rounded-lg mt-4">
              <p className="text-amber-700">
                Ton billet est réservé pendant 10 minutes. Merci de finaliser le paiement dans ce délai pour éviter l’annulation.
              </p>
            </div>
          </div>
        )}

        {!showPaymentInstructions && (
          <button
            onClick={handlePurchase}
            disabled={isExpired || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg cursor-pointer"
          >
            {isLoading ? "Traitement en cours..." : "Procéder au paiement manuel"}
          </button>
        )}

        <div className="mt-4">
          <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
        </div>
      </div>
      

    </div>
  );
}
