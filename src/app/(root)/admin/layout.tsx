"use client";

import { useUser } from "@/hooks/convex-hooks";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user && user?.role === "user") {
      setIsRedirecting(true);
      router.replace("/no-access");
    }
  }, [loading, user, router]);

  if (loading || isRedirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null; // Avoid rendering anything before redirecting
  }

  return <div>{children}</div>;
}
