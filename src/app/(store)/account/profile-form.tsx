"use client";

/**
 * Formulario para editar el perfil del usuario.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface ProfileFormProps {
  profile: Profile;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
}

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          role={message.type === "success" ? "status" : "alert"}
          className={cn(
            "rounded-lg border p-3 text-sm",
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {message.text}
        </div>
      )}

      <div>
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          value={email}
          disabled
          aria-readonly="true"
          className="bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-400">(no se puede cambiar)</p>
      </div>

      <Input
        id="fullName"
        label="Nombre completo"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Tu nombre completo"
      />

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={isLoading}>
          Guardar Cambios
        </Button>
        <span className="text-xs text-gray-400">
          Rol: {profile.role === "admin" ? "Administrador" : "Cliente"}
        </span>
      </div>
    </form>
  );
}


