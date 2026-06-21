"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login } from "@/lib/authClient";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/app/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-navy">
          Correo electrónico
        </label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-navy">
          Contraseña
        </label>
        <Input id="password" name="password" type="password" required />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-2 self-start">
        {isSubmitting ? "Entrando…" : "Iniciar sesión"}
      </Button>

      <p className="text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
