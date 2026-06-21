"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { fetchCurrentUser, logout } from "@/lib/authClient";
import { AuthUser } from "@/types/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchCurrentUser().then((result) => {
      if (result === null) {
        router.replace("/");
        return;
      }
      setUser(result);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  if (user === null) return null;

  return (
    <div className="flex flex-1 flex-col">
      <Navbar email={user.email} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
