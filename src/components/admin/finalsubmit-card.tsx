import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const FinalSubmit = () => {
  return (
    <Card className="overflow-hidden border-2 rounded-xl mb-2">
      <CardContent className="mt-2 pb-2 flex flex-col gap-2">
        <div className="flex justify-center items-center font-semibold text-lg">
          {`After team winner and players data updated.. click below  `}
        </div>
        <Button>Final Submit</Button>
      </CardContent>
    </Card>
  );
};
