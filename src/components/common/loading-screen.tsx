import { Loader } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <Loader className="animate-spin" />
    </div>
  );
};
