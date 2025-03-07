"use client";
import { LeaderBoard } from "@/components/home/leaderboard";
import { UpcomingMatchForHome } from "@/components/home/upcoming-match";
import UserScoreCard from "@/components/home/user-points-card";
import { useUser } from "@/hooks/convex-hooks";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user && !user.isAutoSetupDone) {
      setIsRedirecting(true);
      router.push("/auto-setup");
    }
  }, [loading, user, router]);

  if (loading || isRedirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <UserScoreCard />
      <UpcomingMatchForHome />
      <LeaderBoard />
    </div>
  );
}
