import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const Message = ({}) => {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-green-700">
          <TrendingUp className="h-5 w-5" />
          <span>
            On winning, for {500} coins, you will get {1245} coins
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
