import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export default function IntroCard({
  hasTeamSetup,
  hasPlayersSetup,
  handleCardSelection,
}: {
  hasTeamSetup: boolean;
  hasPlayersSetup: boolean;
  handleCardSelection: (option: "teams" | "players") => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submitAutoSetupBoolean = useMutation(api.teams.submitAutoSetupBoolean);

  const handleSubmit = async () => {
    if (!hasTeamSetup || !hasPlayersSetup) {
      toast.error("Please complete Team Selection and Player Selection first.");
      return;
    }

    try {
      setLoading(true);
      await submitAutoSetupBoolean();
      toast.success("Setup completed successfully!");

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.log("Something went wrong! ", error);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {/* Main Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Auto Setup</h1>
        <p className="text-sm text-muted-foreground max-w-[600px] mx-auto">
          Automatically configure your fantasy team in just minutes, perfect for
          busy fans who want to join the action without the complexity of manual
          selection. Our system simplifies the process, allowing you to enjoy
          the IPL experience without needing to follow every match closely. Let
          us handle the details while you focus on the excitement of the game.
        </p>
      </div>

      {/* Setup Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Selection Card */}
        <Card className="relative overflow-hidden">
          <div
            className={`absolute top-2 right-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
              hasTeamSetup
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {hasTeamSetup ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                Pending
              </>
            )}
          </div>
          <CardHeader className="mt-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Team Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Evaluate and rank your favorite IPL teams by leveraging their
                current performance metrics and historical data. Our AI-driven
                system will intelligently prioritize teams, ensuring optimal
                selections for your fantasy lineup.
              </p>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => handleCardSelection("teams")}
            >
              Quick Rank Teams
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Player Selection Card */}
        <Card className="relative overflow-hidden">
          <div
            className={`absolute top-2 right-2 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
              hasPlayersSetup
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {hasPlayersSetup ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                Pending
              </>
            )}
          </div>
          <CardHeader className="mt-4">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Player Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select two players from each team, and our advanced AI will
                seamlessly manage your choices when you&aposre unavailable. This
                ensures your fantasy lineup remains optimized and competitive,
                even when you&aposre not actively participating.
              </p>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={() => handleCardSelection("players")}
            >
              Players Selection
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          disabled={loading}
          onClick={handleSubmit}
        >
          Go To Home Page
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
