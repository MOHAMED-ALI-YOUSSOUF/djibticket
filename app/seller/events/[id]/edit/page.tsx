"use client";

import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import EventForm from "@/components/EventForm";
import { AlertCircle } from "lucide-react";

export default function EditEventPage() {
  const params = useParams();
  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });

  if (!event) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
        <h2 className="text-2xl font-bold">Modifier l'Événement</h2>
          <p className="text-blue-100 mt-2">Mettez à jour les détails de votre événement</p>
       
        </div>

        <div className="p-6">
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">
              Note : Si vous modifiez le nombre total de billets, tous les billets déjà vendus resteront valides. Vous ne pouvez qu&apos;augmenter le nombre total de billets, pas le réduire en dessous du nombre de billets déjà vendus.
           
              </p>
            </div>
          </div>

          <EventForm mode="edit" initialData={event} />
        </div>
      </div>
    </div>
  );
}