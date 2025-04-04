import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const SingleBet = () => {
  const [selectedTeam, setSelectedTeam] = useState("");
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Place Your Bet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Team</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"csk"}>CSK</SelectItem>
                <SelectItem value={"mi"}>MI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bet Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Enter amount"
                className="pl-7"
                //value={betAmount}
                //onChange={(e) => setBetAmount(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Remaining Coins: ₹4568
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Place Bet</Button>
      </CardFooter>
    </Card>
  );
};
