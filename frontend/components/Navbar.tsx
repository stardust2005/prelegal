import Link from "next/link";
import Button from "@/components/ui/Button";

interface NavbarProps {
  email: string;
  onLogout: () => void;
}

export default function Navbar({ email, onLogout }: NavbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <Link href="/app" className="text-lg font-semibold text-navy">
        PreLegal
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link href="/app/documents" className="text-primary hover:underline">
          Mis documentos
        </Link>
        <span className="text-muted">{email}</span>
        <Button type="button" onClick={onLogout} className="px-3 py-1.5">
          Cerrar sesión
        </Button>
      </nav>
    </header>
  );
}
