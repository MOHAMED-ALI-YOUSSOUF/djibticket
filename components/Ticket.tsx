"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  Download,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import Spinner from "./Spinner";
import { useStorageUrl } from "@/lib/utils";
import Image from "next/image";
import QRCode from "react-qr-code";


export default function Ticket({ ticketId }: { ticketId: Id<"tickets"> }) {
 
  const ticket = useQuery(api.tickets.getTicketWithDetails, { ticketId });
  const user = useQuery(api.users.getUserById, {
    userId: ticket?.userId ?? "",
  });
  const imageUrl = useStorageUrl(ticket?.event?.imageStorageId);
  const downloadTicket = async () => {

  };
  

  if (!ticket || !ticket.event || !user) {
    return <Spinner />;
  }

  return (
    <div
      className={`relative bg-white rounded-xl overflow-hidden shadow-xl border ${ticket.event.is_cancelled ? "border-red-200" : "border-gray-100"}`}
    >
      {/* En-tête de l'événement avec image */}
      <div className="relative">
        {imageUrl && (
          <div className="relative w-full aspect-[21/9]">
            <Image
              src={imageUrl}
              alt={ticket.event.name}
              fill
              className={`object-cover object-center ${ticket.event.is_cancelled ? "opacity-50" : ""}`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
          </div>
        )}
        <div
          className={`px-6 py-4 ${imageUrl ? "absolute bottom-0 left-0 right-0" : ticket.event.is_cancelled ? "bg-red-600" : "bg-blue-600"}`}
        >
          <h2
            className={`text-2xl font-bold ${imageUrl || !imageUrl ? "text-white" : "text-black"}`}
          >
            {ticket.event.name}
          </h2>
          {ticket.event.is_cancelled && (
            <p className="text-red-300 mt-1">Cet événement a été annulé</p>
          )}
        </div>
      </div>

      {/* Contenu du billet */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Colonne gauche - Détails de l'événement */}
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays
                className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(ticket.event.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin
                className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="font-medium">{ticket.event.location}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <User
                className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Titulaire du billet</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 break-all">
              <IdCard
                className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">ID du titulaire</p>
                <p className="font-medium">{user.userId}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <TicketIcon
                className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-600" : "text-blue-600"}`}
              />
              <div>
                <p className="text-sm text-gray-500">Prix du billet</p>
                <p className="font-medium">£{ticket.event.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Colonne droite - QR Code */}
          <div className="flex flex-col items-center justify-center border-l border-gray-200 pl-6">
            <div
              className={`bg-gray-100 p-4 rounded-lg ${ticket.event.is_cancelled ? "opacity-50" : ""}`}
            >
              <QRCode value={ticket._id} className="w-32 h-32" />
            </div>
            <p className="mt-2 text-sm text-gray-500 break-all text-center max-w-[200px] md:max-w-full">
              ID du billet : {ticket._id}
            </p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Informations importantes
          </h3>
          {ticket.event.is_cancelled ? (
            <p className="text-sm text-red-600">
              Cet événement a été annulé. Un remboursement sera effectué si ce
              n’est pas déjà fait.
            </p>
          ) : (
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Veuillez arriver au moins 30 minutes avant l’événement</li>
              <li>• Ayez votre QR code prêt pour le scan</li>
              <li>• Ce billet est non transférable</li>
            </ul>
          )}
        </div>
      </div>

      {/* Pied de page du billet */}
      <div
        className={`${ticket.event.is_cancelled ? "bg-red-50" : "bg-gray-50"} px-6 py-4 flex justify-between items-center`}
      >
        <span className="text-sm text-gray-500">
          Date d’achat : {new Date(ticket.purchasedAt).toLocaleString()}
        </span>
        <span
          className={`text-sm font-medium ${ticket.event.is_cancelled ? "text-red-600" : "text-blue-600"}`}
        >
          {ticket.event.is_cancelled ? "Annulé" : "Billet valide"}
        </span>
      </div>



       {/* Bouton de téléchargement */}
       <div className="mt-4 flex justify-end">
        <button
          onClick={downloadTicket}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow absolute top-4 right-4"
        >
          <Download className="w-4 h-4" />
          Télécharger le billet
        </button>
      </div>
    </div>
  );
}
