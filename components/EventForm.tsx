"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useStorageUrl } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Le nom de l'événement est requis"),
  description: z.string().min(1, "La description est requise"),
  location: z.string().min(1, "Le lieu est requis"),
  eventDate: z
    .date()
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "La date de l'événement doit être dans le futur"
    ),
  price: z.number().min(0, "Le prix doit être supérieur ou égal à 0"),
  totalTickets: z.number().min(1, "Il doit y avoir au moins 1 billet"),
});

type FormData = z.infer<typeof formSchema>;

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  imageStorageId?: Id<"_storage">;
}

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: InitialEventData;
}

export default function EventForm({ mode, initialData }: EventFormProps) {
  const { user } = useUser();
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.updateEvent);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentImageUrl = useStorageUrl(initialData?.imageStorageId);

  // Téléchargement d'image
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  const [removedCurrentImage, setRemovedCurrentImage] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
      price: initialData?.price ?? 0,
      totalTickets: initialData?.totalTickets ?? 1,
    },
  });

  async function onSubmit(values: FormData) {
    if (!user?.id) return;

    startTransition(async () => {
      try {
        let imageStorageId = null;

        // Gestion des changements d'image
        if (selectedImage) {
          // Télécharger une nouvelle image
          imageStorageId = await handleImageUpload(selectedImage);
        }

        // Gestion de la suppression ou mise à jour de l'image en mode édition
        if (mode === "edit" && initialData?.imageStorageId) {
          if (removedCurrentImage || selectedImage) {
            // Supprimer l'ancienne image du stockage
            await deleteImage({
              storageId: initialData.imageStorageId,
            });
          }
        }

        if (mode === "create") {
          const eventId = await createEvent({
            ...values,
            userId: user.id,
            eventDate: values.eventDate.getTime(),
          });

          if (imageStorageId) {
            await updateEventImage({
              eventId,
              storageId: imageStorageId as Id<"_storage">,
            });
          }

          router.push(`/event/${eventId}`);
        } else {
          // Assurez-vous que les données initiales existent avant de procéder à la mise à jour
          if (!initialData) {
            throw new Error("Les données initiales de l'événement sont nécessaires pour les mises à jour");
          }

          // Mettre à jour les détails de l'événement
          await updateEvent({
            eventId: initialData._id,
            ...values,
            eventDate: values.eventDate.getTime(),
          });

          // Mettre à jour l'image - cela gère maintenant à la fois l'ajout d'une nouvelle image et la suppression de l'image existante
          if (imageStorageId || removedCurrentImage) {
            await updateEventImage({
              eventId: initialData._id,
              // Si nous avons une nouvelle image, utilisez son ID, sinon si nous supprimons l'image, passez null
              storageId: imageStorageId
                ? (imageStorageId as Id<"_storage">)
                : null,
            });
          }

          toast.success("Événement mis à jour", {
            description: "Votre événement a été mis à jour avec succès.",
          });

          router.push(`/event/${initialData._id}`);
        }
      } catch (error) {
        console.error("Échec de la gestion de l'événement:", error);
        toast.error("Oups ! Un problème est survenu.", {
          description: "Il y a eu un problème avec votre demande.",
        });
      }
    });
  }

  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Échec du téléchargement de l'image:", error);
      return null;
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Champs du formulaire */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l&apos;événement</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de l&apos;événement</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      );
                    }}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix par billet</FormLabel>
                <FormControl>
                  {/* Ajout de la monnaie de Djibouti (DJF) */}
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-sm">
                      DJF
                    </span>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pl-9 "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalTickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre total de billets disponibles</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Téléchargement de l'image */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Image de l&apos;événement
            </label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                <div className="relative w-32 aspect-square bg-gray-100 rounded-lg">
                  <Image
                    src={imagePreview || currentImageUrl!}
                    alt="Aperçu de l'image de l'événement"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  Aucune image sélectionnée
                </span>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInput.current?.click()}
                >
                  {selectedImage || currentImageUrl
                    ? "Changer l'image"
                    : "Ajouter une image"}
                </Button>

                {(selectedImage || currentImageUrl) && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setRemovedCurrentImage(true);
                      if (imageInput.current) {
                        imageInput.current.value = "";
                      }
                    }}
                  >
                    Supprimer l&apos;image
                  </Button>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInput}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {mode === "create" ? "Créer l'événement" : "Mettre à jour l'événement"}
        </Button>
      </form>
    </Form>
  );
}
