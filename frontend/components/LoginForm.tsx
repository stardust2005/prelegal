"use client";

import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/app/");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-[#032147]">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#209dd7] focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-[#032147]">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[#209dd7] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="mt-2 self-start rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
