import { useQuery } from "convex/react";
import { CircleX, Loader, LucideIcon, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export const StatCardBlock = () => {
  const userstats = useQuery(api.users.getAllUsersCount);
  if (userstats == undefined) {
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Loader className="animate-spin" />
    </div>;
  }
  return (
    <>
      {userstats && (
        <div className="grid gap-4 md:grid-cols-2  mb-6">
          <StatCard
            title="Total Users"
            value={userstats?.totalUsers.toString()}
            description="+15% from last month"
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="AutoSetup Incomplete Users"
            value={userstats?.pendingSetupUsers.toString()}
            description="92% participation rate"
            icon={CircleX}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>
      )}
    </>
  );
};

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${iconBgColor} p-2 rounded-full`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
