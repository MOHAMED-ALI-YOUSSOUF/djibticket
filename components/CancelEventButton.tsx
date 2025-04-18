"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function CancelEventButton({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const cancelEvent = useMutation(api.events.cancelEvent);

  const handleCancel = async () => {
    if (
      !confirm(
        "Es-tu sûr de vouloir annuler cet événement ? Tous les billets seront remboursés et l’événement sera annulé définitivement."
      )
    ) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelEvent({ eventId });
      toast.success("Événement annulé", {
        description: "Tous les billets ont été remboursés avec succès.",
      });
      router.push("/seller/events");
    } catch (error) {
      console.error("Échec de l'annulation de l'événement :", error);
      toast.error("Erreur", {
        description:
          "Impossible d'annuler l'événement. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Ban className="w-4 h-4" />
      <span>{isCancelling ? "Traitement en cours..." : "Annuler l’événement"}</span>
    </button>
  );
}
