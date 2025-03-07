import { Player } from "@/types";
import { Avatar } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const AllPlayers = ({
  homeTeamName,
  homeTeamPlayers,
  awayTeamName,
  awayTeamPlayers,
  selectedPlayers,
  setSelectedPlayers,
}: {
  homeTeamName: string;
  homeTeamPlayers: Player[];
  awayTeamName: string;
  awayTeamPlayers: Player[];
  selectedPlayers: Player[];
  setSelectedPlayers: (players: Player[]) => void;
}) => {
  const handlePlayerSelect = (player: Player) => {
    console.log("players", player);
    if (selectedPlayers.length >= 4) {
      toast.error("Player limit reached", {
        description: "You can only select up to 4 players",
      });

      return;
    }

    if (selectedPlayers.some((p) => p._id === player._id)) {
      toast.error("Player already selected");

      return;
    }

    setSelectedPlayers([...selectedPlayers, player]);
  };
  return (
    <div className="flex flex-row">
      {/* Team 1 Players */}
      <Card className="w-full ">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{homeTeamName}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 overflow-y-auto">
          <div className="space-y-1">
            {homeTeamPlayers.map((player) => (
              <button
                key={player._id}
                onClick={() => handlePlayerSelect(player)}
                className={`w-full flex items-center p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground ${selectedPlayers.some((p) => p._id === player._id) && "bg-gray-200"}`}
                disabled={selectedPlayers.some((p) => p._id === player._id)}
              >
                <Avatar className="h-7 w-7 mr-2">
                  <AvatarImage src={player.profileImage} alt={player.name} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium leading-none mb-1">
                    {player.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {player.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team 2 Players */}
      <Card className="w-full">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{awayTeamName}</CardTitle>
        </CardHeader>
        <CardContent className="p-2  overflow-y-auto">
          <div className="space-y-1">
            {awayTeamPlayers.map((player) => (
              <button
                key={player._id}
                onClick={() => handlePlayerSelect(player)}
                className={`w-full flex items-center p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground ${selectedPlayers.some((p) => p._id === player._id) && "bg-gray-200"}`}
                disabled={selectedPlayers.some((p) => p._id === player._id)}
              >
                <Avatar className="h-7 w-7 mr-2">
                  <AvatarImage src={player.profileImage} alt={player.name} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium leading-none mb-1">
                    {player.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {player.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
